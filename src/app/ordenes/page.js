'use client';
import { useEffect, useState } from 'react';
import { actualizarEstadoOrden, getOrdenDetalle } from '../../actions/ordenes';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const SUCURSAL_ID = 1;

export default function OrdenesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrden, setSelectedOrden] = useState(null);
    const { checkTokenExpiry } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [ordenes, setOrdenes] = useState([]);

    // Estados para UX mejorada
    const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
        confirmText: 'Confirmar'
    });
    const [actionLoading, setActionLoading] = useState({}); // { [ordenId]: true/false }

    const showToast = (message, type = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const closeToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // Audio para notificación de nueva orden - Sonido de campana
    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const now = audioContext.currentTime;

            // Frecuencias de una campana (fundamental + armónicos)
            const frequencies = [800, 1200, 1600, 2000, 2400];
            const volumes = [0.4, 0.3, 0.2, 0.15, 0.1]; // Volumen decreciente para armónicos

            frequencies.forEach((frequency, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                // Ataque rápido y decay exponencial (característico de una campana)
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(volumes[index], now + 0.01); // Ataque rápido
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0); // Decay largo

                oscillator.start(now);
                oscillator.stop(now + 1.0);
            });


        } catch (error) {

        }
    };

    // Inicializar audio en la primera interacción del usuario
    useEffect(() => {
        const initAudio = () => {
            // Crear un AudioContext vacío para "desbloquear" el audio
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioContext.resume().then(() => {
                    console.log('🔊 Audio desbloqueado - las notificaciones sonarán');
                });
            } catch (error) {
                console.log('Audio no disponible');
            }
            // Remover el listener después de la primera interacción
            document.removeEventListener('click', initAudio);
        };

        document.addEventListener('click', initAudio, { once: true });

        return () => {
            document.removeEventListener('click', initAudio);
        };
    }, []);

    const statusConfig = {
        PENDIENTE: {
            label: 'Pendientes',
            color: 'bg-white border-gray-200',
            headerColor: 'bg-yellow-100',
            textColor: 'text-gray-700',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        PREPARANDO: {
            label: 'Preparando',
            color: 'bg-white border-gray-200',
            headerColor: 'bg-blue-100',
            textColor: 'text-gray-700',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            )
        },
        COMPLETADA: {
            label: 'Completadas',
            color: 'bg-white border-gray-200',
            headerColor: 'bg-green-100',
            textColor: 'text-gray-700',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        RECHAZADA: {
            label: 'Rechazadas',
            color: 'bg-white border-gray-200',
            headerColor: 'bg-red-100',
            textColor: 'text-gray-700',
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    useEffect(() => {
        let eventSource;

        const loadData = async () => {
            try {
                await checkTokenExpiry();
                await cargarOrdenesIniciales();
                eventSource = conectarTiempoReal();
            } catch (error) {
                console.error("Error iniciando el dashboard de órdenes:", error);
                setIsLoading(false);
            }
        };

        loadData();

        return () => {
            if (eventSource) {
                console.log("Cerrando conexión SSE...");
                eventSource.close();
            }
        };
    }, []);

    async function cargarOrdenesIniciales() {
        try {
            console.log('Cargando órdenes iniciales...');
            const res = await fetch(`${API_URL}/live/ordenes/${SUCURSAL_ID}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
            const data = await res.json();
            // Asegurarse de que data es un array
            setOrdenes(Array.isArray(data) ? data : []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error cargando órdenes iniciales:', error);
            setIsLoading(false);
        }
    }

    function conectarTiempoReal() {
        console.log('Conectando al stream de eventos...');
        const url = `${API_URL}/live/ordenes-dia/${SUCURSAL_ID}`;
        const eventSource = new EventSource(url, { withCredentials: true });

        eventSource.onopen = () => {
            console.log('Conexión SSE establecida con éxito');
        };

        eventSource.onmessage = (event) => {
            try {
                // Ignorar heartbeats si el backend envía algo como "heartbeat" o similar que no sea JSON válido
                if (event.data === 'heartbeat') return;

                const data = JSON.parse(event.data);
                console.log('Evento recibido:', data);
                handleOrdenEvent(data);
            } catch (err) {
                console.error('Error procesando mensaje SSE:', err, event.data);
            }
        };

        eventSource.onerror = (err) => {
            console.error("Error en SSE", err);
            // EventSource intenta reconectar automáticamente
            if (eventSource.readyState === EventSource.CLOSED) {
                console.log("La conexión SSE fue cerrada.");
            }
        };

        return eventSource;
    }

    function handleOrdenEvent(data) {
        const { tipo, orden } = data;

        if (!orden) return;

        setOrdenes(prevOrdenes => {
            const existe = prevOrdenes.find(o => o.id === orden.id);

            switch (tipo) {
                case 'ORDEN_NUEVA':
                    // Reproducir sonido de notificación
                    playNotificationSound();
                    // Evitar duplicados si ya existe
                    if (existe) return prevOrdenes.map(o => o.id === orden.id ? { ...o, ...orden } : o);
                    return [orden, ...prevOrdenes];

                case 'ORDEN_ACTUALIZADA':
                case 'ORDEN_EXISTENTE': // Tratamos existente igual que actualizada para sincronizar
                    if (existe) {
                        return prevOrdenes.map(o => o.id === orden.id ? { ...o, ...orden } : o);
                    } else {
                        // Si llega actualizada pero no la teníamos
                        return [orden, ...prevOrdenes];
                    }

                default:
                    return prevOrdenes;
            }
        });
    }

    const getOrdenesByStatus = (status) => {
        return ordenes.filter(orden => (orden.estado || orden.status) === status);
    };

    // Handlers para acciones
    const handleAction = async (ordenId, status, successMessage, errorMessage) => {
        setActionLoading(prev => ({ ...prev, [ordenId]: true }));
        try {
            await actualizarEstadoOrden(ordenId, status);
            showToast(successMessage, 'success');
        } catch (error) {
            console.error(`Error al actualizar a ${status}:`, error);
            showToast(errorMessage, 'error');
        } finally {
            setActionLoading(prev => {
                const newState = { ...prev };
                delete newState[ordenId];
                return newState;
            });
        }
    };

    const handleAceptarOrden = (ordenId) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Aceptar Orden',
            message: '¿Estás seguro de que deseas aceptar esta orden? Pasará a estado "Preparando".',
            type: 'info',
            confirmText: 'Aceptar',
            onConfirm: () => handleAction(ordenId, 'PREPARANDO', 'Orden aceptada correctamente', 'No se pudo aceptar la orden')
        });
    };

    const handleRechazarOrden = (ordenId) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Rechazar Orden',
            message: '¿Estás seguro de que deseas rechazar esta orden? Esta acción no se puede deshacer.',
            type: 'danger',
            confirmText: 'Rechazar',
            onConfirm: () => handleAction(ordenId, 'RECHAZADA', 'Orden rechazada', 'No se pudo rechazar la orden')
        });
    };

    const handleCompletarOrden = (ordenId) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Completar Orden',
            message: '¿Confirmas que la orden está lista para entregar?',
            type: 'info',
            confirmText: 'Completar',
            onConfirm: () => handleAction(ordenId, 'COMPLETADA', 'Orden completada exitosamente', 'No se pudo completar la orden')
        });
    };

    const handleCancelarOrden = (ordenId) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Cancelar Orden',
            message: '¿Estás seguro de que deseas cancelar esta orden que ya está en preparación?',
            type: 'warning',
            confirmText: 'Sí, cancelar',
            onConfirm: () => handleAction(ordenId, 'RECHAZADA', 'Orden cancelada', 'No se pudo cancelar la orden')
        });
    };

    const handleOpenModal = async (orden) => {
        // Establecer info preliminar
        const usuario = orden.usuarioNombre || orden.usuario || 'Cliente';
        const fecha = orden.fechaCreacion || orden.fecha;
        const estado = orden.estado || orden.status;
        const mesa = orden.mesa || 'Para llevar';

        setSelectedOrden({ ...orden, usuario, fecha, estado, mesa });
        setIsModalOpen(true);
        setIsLoadingDetails(true);

        try {
            const ordenCompleta = await getOrdenDetalle(orden.id);
            // Mapeamos los campos si vienen diferentes, o los usamos directo si el formato es el correcto.
            const usuarioCompleto = ordenCompleta.usuarioNombre || usuario;
            const fechaCompleta = ordenCompleta.fechaCreacion || fecha;
            const estadoCompleto = ordenCompleta.estado || estado;
            // Aseguramos que tenemos los productos
            setSelectedOrden({
                ...ordenCompleta,
                usuario: usuarioCompleto,
                fecha: fechaCompleta,
                estado: estadoCompleto,
                mesa: ordenCompleta.mesa || mesa
            });
        } catch (error) {
            console.error("Error cargando detalles de la orden", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Componente para el skeleton de una carta de orden
    const OrdenCardSkeleton = () => (
        <div className="flex-shrink-0 w-80 bg-white rounded-xl border border-gray-100 p-4">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
                </div>
            </div>
        </div>
    );

    // Componente para la carta de orden
    const OrdenCard = ({ orden }) => {
        // Helper para formatear fecha si viene en ISO
        const formatTime = (fechaString) => {
            if (!fechaString) return '';
            try {
                const date = new Date(fechaString);
                return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                return '';
            }
        };

        const formatDate = (fechaString) => {
            if (!fechaString) return '';
            try {
                const date = new Date(fechaString);
                return date.toLocaleDateString('es-MX');
            } catch (e) {
                return '';
            }
        };

        const usuario = orden.usuarioNombre || orden.usuario || 'Cliente';
        const fecha = orden.fechaCreacion || orden.fecha;
        const estado = orden.estado || orden.status;
        const mesa = orden.mesa || 'Para llevar';

        return (
            <div className={`flex-shrink-0 w-80 bg-white rounded-xl border hover:shadow-md transition-shadow p-4 cursor-pointer ${estado === 'PENDIENTE' ? 'border-yellow-400 animate-pulse' : 'border-gray-100'
                }`} onClick={() => handleOpenModal(orden)}>
                <div className="space-y-3">
                    {/* Header con ID y fecha */}
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">#{orden.id}</span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                            </svg>
                            <span>{formatTime(fecha)}</span>
                        </div>
                    </div>
                    {/* Usuario */}
                    <div className="text-lg font-medium text-gray-800 truncate" title={usuario}>{usuario}</div>
                    {/* Fecha completa */}
                    <div className="text-sm text-gray-600">{formatDate(fecha)}</div>
                    {/* Detalles */}
                    <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Mesa:</span>
                            <span className="font-medium">{mesa}</span>
                        </div>
                    </div>
                    {/* Total */}
                    <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total:</span>
                            <span className="text-lg font-bold text-gray-900">${orden.total ? Number(orden.total).toFixed(2) : '0.00'}</span>
                        </div>
                    </div>
                    {/* Botones de acción - para órdenes pendientes */}
                    {estado === 'PENDIENTE' && (
                        <div className="flex items-center space-x-4 pt-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleAceptarOrden(orden.id); }}
                                disabled={actionLoading[orden.id]}
                                className="flex-1 h-16 bg-green-600 bg-opacity-80 text-white px-6 py-4 rounded-xl hover:bg-green-600 hover:bg-opacity-90 transition-all text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {actionLoading[orden.id] ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : 'Aceptar'}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRechazarOrden(orden.id); }}
                                disabled={actionLoading[orden.id]}
                                className="w-16 h-16 bg-red-600 bg-opacity-80 text-white rounded-xl hover:bg-red-600 hover:bg-opacity-90 transition-all text-lg font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading[orden.id] ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : '✕'}
                            </button>
                        </div>
                    )}
                    {/* Botones de acción - para órdenes preparando */}
                    {estado === 'PREPARANDO' && (
                        <div className="flex items-center space-x-4 pt-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCompletarOrden(orden.id); }}
                                disabled={actionLoading[orden.id]}
                                className="flex-1 h-16 bg-green-600 bg-opacity-80 text-white px-6 py-4 rounded-xl hover:bg-green-600 hover:bg-opacity-90 transition-all text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {actionLoading[orden.id] ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : 'Completar'}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCancelarOrden(orden.id); }}
                                disabled={actionLoading[orden.id]}
                                className="w-16 h-16 bg-red-600 bg-opacity-80 text-white rounded-xl hover:bg-red-600 hover:bg-opacity-90 transition-all text-lg font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading[orden.id] ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : '✕'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto mt-8 px-4">
                {/* Header minimalista */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900">Órdenes en Tiempo Real</h1>
                            <p className="text-gray-600 mt-1">Dashboard de seguimiento de órdenes</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">
                                Total de órdenes: <span className="font-semibold">{ordenes.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard de órdenes por status */}
                <div className="space-y-6">
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const ordenesStatus = getOrdenesByStatus(status);

                        return (
                            <div key={status} className={`rounded-xl border p-6 ${config.color}`}>
                                {/* Header de la sección */}
                                <div className="-mx-6 -mt-6 mb-6 px-6 py-4 rounded-t-xl bg-white border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${config.headerColor} text-gray-700`}>
                                                {config.icon}
                                            </div>
                                            <div className={`px-3 py-1 rounded-lg ${config.headerColor} text-gray-700`}>
                                                <h2 className="text-xl font-semibold">
                                                    {config.label}
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                            {isLoading ? (
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                                            ) : (
                                                `${ordenesStatus.length} ${ordenesStatus.length === 1 ? 'orden' : 'órdenes'}`
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Scroll horizontal con órdenes */}
                                <div className="overflow-x-auto scrollbar-hide">
                                    <div className="flex space-x-4 pb-4">
                                        {isLoading ? (
                                            // Skeleton loading
                                            [...Array(3)].map((_, index) => (
                                                <OrdenCardSkeleton key={index} />
                                            ))
                                        ) : ordenesStatus.length > 0 ? (
                                            // Órdenes reales
                                            ordenesStatus.map((orden) => (
                                                <OrdenCard key={orden.id} orden={orden} />
                                            ))
                                        ) : (
                                            // Estado vacío
                                            <div className="flex-shrink-0 w-full text-center py-12">
                                                <div className="text-gray-400 mb-2">
                                                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-700 font-medium">No hay órdenes {config.label.toLowerCase()}</p>
                                                <p className="text-gray-500 text-sm mt-1">Las nuevas órdenes aparecerán aquí automáticamente</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Modal de detalles de la orden */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedOrden(null); }}
                title={selectedOrden ? `Detalles de la Orden #${selectedOrden.id}` : 'Detalles de la Orden'}
            >
                {selectedOrden ? (
                    <div className="space-y-6">
                        {/* Header con ID y estado */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Orden #{selectedOrden.id}</h3>
                                <p className="text-sm text-gray-500 mt-1">Información detallada de la orden</p>
                            </div>
                            <div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedOrden.estado === 'RECHAZADA'
                                    ? 'bg-red-100 text-red-800'
                                    : selectedOrden.estado === 'COMPLETADA'
                                        ? 'bg-green-100 text-green-800'
                                        : selectedOrden.estado === 'PENDIENTE'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : selectedOrden.estado === 'PREPARANDO'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {statusConfig[selectedOrden.estado]?.label || selectedOrden.estado}
                                </span>
                            </div>
                        </div>

                        {/* Información principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Usuario */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Usuario
                                </label>
                                <div className="flex items-center space-x-2">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-gray-900 font-medium">{selectedOrden.usuario}</span>
                                </div>
                            </div>

                            {/* Fecha de creación */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha de creación
                                </label>
                                <div className="flex items-center space-x-2">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-700">
                                        {selectedOrden.fecha ? new Date(selectedOrden.fecha).toLocaleString('es-MX') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detalles adicionales - Mesa y Notas Globales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Mesa</label>
                                <span className="text-gray-900 font-medium">{selectedOrden.mesa || 'Para llevar'}</span>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Notas Generales</label>
                                <span className="text-gray-900 font-medium">{selectedOrden.notas || 'Sin notas'}</span>
                            </div>
                        </div>

                        {/* Lista de Productos Detallada */}
                        <div className="space-y-3 mt-6">
                            <h4 className="font-medium text-gray-900 pb-2 border-b border-gray-100">Productos ({selectedOrden.productos ? selectedOrden.productos.length : 0})</h4>

                            {isLoadingDetails ? (
                                <div className="py-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    <p className="mt-2 text-sm text-gray-500">Cargando detalles...</p>
                                </div>
                            ) : selectedOrden.productos && selectedOrden.productos.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedOrden.productos.map((prod, index) => (
                                        <div key={prod.id || index} className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-baseline space-x-2">
                                                    <span className="font-bold text-gray-900">{prod.cantidad}x</span>
                                                    <span className="text-gray-900 font-medium">{prod.productoNombre}</span>
                                                    {prod.tamanoNombre && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{prod.tamanoNombre}</span>
                                                    )}
                                                </div>
                                                {/* Modificadores */}
                                                {prod.modificadores && prod.modificadores.length > 0 && (
                                                    <ul className="mt-1 pl-6 space-y-1">
                                                        {prod.modificadores.map((mod, mIndex) => (
                                                            <li key={mod.id || mIndex} className="text-sm text-gray-500 flex justify-between">
                                                                <span>+ {mod.modificadorNombre}</span>
                                                                <span>${mod.subtotal ? Number(mod.subtotal).toFixed(2) : '0.00'}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <span className="text-gray-900 font-medium whitespace-nowrap ml-4">
                                                ${prod.subtotal ? Number(prod.subtotal).toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !isLoadingDetails && (
                                    <div className="text-sm text-gray-500 italic">
                                        {selectedOrden.articulos ? `Resumen: ${selectedOrden.articulos}` : 'No hay detalle de productos disponible.'}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Total destacado */}
                        <div className="bg-gray-50 rounded-lg p-4 mt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Total de la orden</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">${selectedOrden.total ? Number(selectedOrden.total).toFixed(2) : '0.00'}</span>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay información</h3>
                        <p className="mt-1 text-sm text-gray-500">No se pudo cargar la información de la orden.</p>
                    </div>
                )}
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                type={confirmationModal.type}
                confirmText={confirmationModal.confirmText}
            />

            {/* Toast Notification */}
            {toast.isVisible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}
        </DashboardLayout>
    );
}
