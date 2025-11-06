'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

export default function OrdenesPage() {
  const { checkTokenExpiry } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ordenes, setOrdenes] = useState([]);

  const statusConfig = {
    pendiente: {
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
    preparando: {
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
    completada: {
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
    rechazada: {
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
    checkTokenExpiry();
    
    // Mock data para las órdenes
    const mockOrdenes = [
      {
        id: 'ORD-001',
        usuario: 'Juan Pérez',
        fecha: '2025-11-04 10:30',
        articulos: 3,
        mesa: 5,
        total: 25.50,
        status: 'pendiente'
      },
      {
        id: 'ORD-002',
        usuario: 'María García',
        fecha: '2025-11-04 10:25',
        articulos: 2,
        mesa: 12,
        total: 18.75,
        status: 'preparando'
      },
      {
        id: 'ORD-003',
        usuario: 'Carlos López',
        fecha: '2025-11-04 10:20',
        articulos: 4,
        mesa: 8,
        total: 32.00,
        status: 'preparando'
      },
      {
        id: 'ORD-004',
        usuario: 'Ana Martínez',
        fecha: '2025-11-04 10:15',
        articulos: 1,
        mesa: 3,
        total: 12.25,
        status: 'completada'
      },
      {
        id: 'ORD-005',
        usuario: 'Luis Rodríguez',
        fecha: '2025-11-04 10:10',
        articulos: 5,
        mesa: 15,
        total: 45.80,
        status: 'completada'
      },
      {
        id: 'ORD-006',
        usuario: 'Sofia Hernández',
        fecha: '2025-11-04 10:05',
        articulos: 2,
        mesa: 7,
        total: 19.90,
        status: 'rechazada'
      },
      {
        id: 'ORD-007',
        usuario: 'Diego Torres',
        fecha: '2025-11-04 10:35',
        articulos: 3,
        mesa: 22,
        total: 28.50,
        status: 'pendiente'
      },
      {
        id: 'ORD-008',
        usuario: 'Elena Vargas',
        fecha: '2025-11-04 10:32',
        articulos: 4,
        mesa: 14,
        total: 35.75,
        status: 'preparando'
      },
      {
        id: 'ORD-009',
        usuario: 'Roberto Silva',
        fecha: '2025-11-04 10:40',
        articulos: 2,
        mesa: 9,
        total: 22.30,
        status: 'pendiente'
      },
      {
        id: 'ORD-010',
        usuario: 'Patricia Ruiz',
        fecha: '2025-11-04 10:38',
        articulos: 6,
        mesa: 18,
        total: 52.90,
        status: 'pendiente'
      },
      {
        id: 'ORD-011',
        usuario: 'Fernando Castro',
        fecha: '2025-11-04 10:28',
        articulos: 3,
        mesa: 6,
        total: 31.45,
        status: 'preparando'
      },
      {
        id: 'ORD-012',
        usuario: 'Gabriela Moreno',
        fecha: '2025-11-04 10:22',
        articulos: 1,
        mesa: 11,
        total: 15.75,
        status: 'preparando'
      },
      {
        id: 'ORD-013',
        usuario: 'Andrés Jiménez',
        fecha: '2025-11-04 10:08',
        articulos: 4,
        mesa: 20,
        total: 38.60,
        status: 'completada'
      },
      {
        id: 'ORD-014',
        usuario: 'Carmen Delgado',
        fecha: '2025-11-04 10:12',
        articulos: 2,
        mesa: 4,
        total: 27.85,
        status: 'completada'
      },
      {
        id: 'ORD-015',
        usuario: 'Miguel Vega',
        fecha: '2025-11-04 10:18',
        articulos: 3,
        mesa: 16,
        total: 29.40,
        status: 'completada'
      },
      {
        id: 'ORD-016',
        usuario: 'Lucía Herrera',
        fecha: '2025-11-04 10:03',
        articulos: 2,
        mesa: 13,
        total: 21.15,
        status: 'rechazada'
      },
      {
        id: 'ORD-017',
        usuario: 'Raúl Mendoza',
        fecha: '2025-11-04 10:42',
        articulos: 5,
        mesa: 2,
        total: 41.25,
        status: 'pendiente'
      },
      {
        id: 'ORD-018',
        usuario: 'Valeria Ramos',
        fecha: '2025-11-04 10:29',
        articulos: 3,
        mesa: 19,
        total: 33.80,
        status: 'preparando'
      },
      {
        id: 'ORD-019',
        usuario: 'Joaquín Flores',
        fecha: '2025-11-04 10:45',
        articulos: 2,
        mesa: 10,
        total: 24.50,
        status: 'pendiente'
      },
      {
        id: 'ORD-020',
        usuario: 'Daniela Ortiz',
        fecha: '2025-11-04 10:26',
        articulos: 4,
        mesa: 17,
        total: 36.90,
        status: 'preparando'
      }
    ];
    
    // Simular carga de datos
    setTimeout(() => {
      setOrdenes(mockOrdenes);
      setIsLoading(false);
    }, 1500);
  }, [checkTokenExpiry]);

  const getOrdenesByStatus = (status) => {
    return ordenes.filter(orden => orden.status === status);
  };

  const handleAceptarOrden = (ordenId) => {
    console.log('Aceptar orden:', ordenId);
    // Aquí implementarías la lógica para aceptar la orden
  };

  const handleRechazarOrden = (ordenId) => {
    console.log('Rechazar orden:', ordenId);
    // Aquí implementarías la lógica para rechazar la orden
  };

  const handleCompletarOrden = (ordenId) => {
    console.log('Completar orden:', ordenId);
    // Aquí implementarías la lógica para completar la orden
  };

  const handleCancelarOrden = (ordenId) => {
    console.log('Cancelar orden:', ordenId);
    // Aquí implementarías la lógica para cancelar la orden
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
  const OrdenCard = ({ orden }) => (
    <div className="flex-shrink-0 w-80 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow p-4">
      <div className="space-y-3">
        {/* Header con ID y fecha */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">{orden.id}</span>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
            </svg>
            <span>{orden.fecha.split(' ')[1]}</span>
          </div>
        </div>
        
        {/* Usuario */}
        <div className="text-lg font-medium text-gray-800">{orden.usuario}</div>
        
        {/* Fecha completa */}
        <div className="text-sm text-gray-600">{orden.fecha.split(' ')[0]}</div>
        
        {/* Detalles */}
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Artículos:</span>
            <span className="font-medium">{orden.articulos}</span>
          </div>
          <div className="flex justify-between">
            <span>Mesa:</span>
            <span className="font-medium">#{orden.mesa}</span>
          </div>
        </div>
        
        {/* Total */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-lg font-bold text-gray-900">${orden.total.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Botones de acción - para órdenes pendientes */}
        {orden.status === 'pendiente' && (
          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => handleAceptarOrden(orden.id)}
              className="flex-1 bg-green-600 bg-opacity-80 text-white px-6 py-4 rounded-xl hover:bg-green-600 hover:bg-opacity-90 transition-all text-lg font-bold"
            >
              Aceptar
            </button>
            <button
              onClick={() => handleRechazarOrden(orden.id)}
              className="flex-1 bg-red-600 bg-opacity-80 text-white px-6 py-4 rounded-xl hover:bg-red-600 hover:bg-opacity-90 transition-all text-lg font-bold"
            >
              Rechazar
            </button>
          </div>
        )}

        {/* Botones de acción - para órdenes preparando */}
        {orden.status === 'preparando' && (
          <div className="flex items-center space-x-4 pt-4">
            <button
              onClick={() => handleCompletarOrden(orden.id)}
              className="flex-1 bg-green-600 bg-opacity-80 text-white px-6 py-4 rounded-xl hover:bg-green-600 hover:bg-opacity-90 transition-all text-lg font-bold"
            >
              Completar
            </button>
            <button
              onClick={() => handleCancelarOrden(orden.id)}
              className="w-16 h-16 bg-red-600 bg-opacity-80 text-white rounded-xl hover:bg-red-600 hover:bg-opacity-90 transition-all text-lg font-bold flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );

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
    </DashboardLayout>
  );
}
