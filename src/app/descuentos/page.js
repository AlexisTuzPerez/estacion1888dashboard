'use client';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useState } from 'react';
import { getDescuentos, updateDescuentoEstado } from '../../actions/descuentos';
import DashboardLayout from '../../components/DashboardLayout';
import DescuentoDetalle from '../../components/DescuentoDetalle';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

// Componente para las filas sortables de la tabla
function SortableItem({ descuento, index, totalItems, onSelect }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: descuento.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            onClick={() => onSelect(descuento)}
            className={`hover:bg-green-50 transition-colors cursor-pointer ${index !== totalItems - 1 ? 'border-b border-gray-50' : ''
                } ${isDragging ? 'z-50' : ''}`}
        >
            {/* Columna Posición con handle de drag and drop */}
            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <button
                    {...attributes}
                    {...listeners}
                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
                    title="Arrastrar para cambiar prioridad"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </td>
            {/* ID */}
            <td className="px-6 py-4 text-sm text-gray-500">
                {descuento.id}
            </td>
            {/* Nombre */}
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 flex items-center">
                    {descuento.nombre}
                </div>
            </td>
            {/* Descripción / Regla */}
            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {descuento.descripcion || descuento.regla || '-'}
            </td>
            {/* Estado */}
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${descuento.activo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {descuento.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
        </tr>
    );
}

export default function DescuentosPage() {
    const { checkTokenExpiry } = useAuth();

    const [descuentos, setDescuentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDescuento, setSelectedDescuento] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Configuración de sensores para drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        checkTokenExpiry();
    }, [checkTokenExpiry]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getDescuentos(1);
            const descuentosList = Array.isArray(data) ? data : [];
            setDescuentos(descuentosList);
        } catch (error) {
            console.error('Error al cargar descuentos:', error);
            showNotification('Error al cargar los descuentos', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const handleSelectDescuento = (descuento) => {
        setSelectedDescuento(descuento);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDescuento(null);
    };

    const handleToggleStatus = async (id, nuevoEstado) => {
        try {
            await updateDescuentoEstado(id, nuevoEstado);
            showNotification(`Descuento ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`, 'success');
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            showNotification('Error al actualizar el estado del descuento', 'error');
        }
    };

    // Función para manejar el reordenamiento por drag and drop
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setDescuentos((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                console.log('Nuevo orden de descuentos (Frontend):', newItems.map((d, i) => ({
                    id: d.id,
                    nombre: d.nombre,
                    posicion: i + 1
                })));

                return newItems;
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto mt-8 px-4">
                {/* Header minimalista */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900">Descuentos</h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Visualización y prioridad de las reglas de descuento.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabla minimalista con drag and drop */}
                <div className="bg-white rounded-xl border border-gray-100">
                    <div className="overflow-x-auto">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left">
                                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-600 w-16">
                                            Prioridad
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-600">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-600">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-600 border-x-0">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-600">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <SortableContext
                                    items={descuentos.map(d => d.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <tbody>
                                        {loading ? (
                                            [...Array(3)].map((_, index) => (
                                                <tr key={index} className="border-b border-gray-50">
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5 mx-auto"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : descuentos.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No hay descuentos activos.
                                                </td>
                                            </tr>
                                        ) : (
                                            descuentos.map((descuento, index) => (
                                                <SortableItem
                                                    key={descuento.id}
                                                    descuento={descuento}
                                                    index={index}
                                                    totalItems={descuentos.length}
                                                    onSelect={handleSelectDescuento}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </SortableContext>
                            </table>
                        </DndContext>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        {descuentos.length} descuento(s) activo(s)
                    </p>
                </div>
            </div>

            {/* Modal de Detalles */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Detalles del Descuento"
            >
                <DescuentoDetalle
                    descuento={selectedDescuento}
                    onToggleStatus={handleToggleStatus}
                    onCancel={handleCloseModal}
                />
            </Modal>

            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${notification.type === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                    }`}>
                    <div className="flex items-center space-x-2">
                        {notification.type === 'success' ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

