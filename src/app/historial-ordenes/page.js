'use client';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { cargarMasOrdenes, getOrdenesIniciales } from '../../actions/ordenes';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

export default function OrdenesPage() {
  const { checkTokenExpiry } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ordenes, setOrdenes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrdenes, setTotalOrdenes] = useState(0);

  useEffect(() => {
    checkTokenExpiry();
    cargarOrdenesIniciales();
  }, [checkTokenExpiry]);

  // Cargar órdenes iniciales
  const cargarOrdenesIniciales = async () => {
    try {
      setIsLoading(true);
      const response = await getOrdenesIniciales();
      
      if (response.success) {
        setOrdenes(response.data);
        setTotalOrdenes(response.pagination.totalItems);
        setHasMore(response.pagination.hasNextPage);
        setCurrentPage(response.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error al cargar órdenes iniciales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar más órdenes para scroll infinito
  const fetchMoreData = async () => {
    try {
      const nextPage = currentPage + 1;
      const response = await cargarMasOrdenes(nextPage);
      
      if (response.success && response.data.length > 0) {
        setOrdenes(prevOrdenes => [...prevOrdenes, ...response.data]);
        setCurrentPage(nextPage);
        setHasMore(response.pagination.hasNextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error al cargar más órdenes:', error);
      setHasMore(false);
    }
  };

  // Formatear fecha en español
  function formatFecha(fechaStr) {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    // Manejar formato ISO "2025-11-04T10:30:15.123456"
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia} ${mes} ${año}`;
  }

  // Modal de detalles de orden
  const openOrdenModal = (orden) => {
    setSelectedOrden(orden);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrden(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header minimalista */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Historial de Órdenes</h1>
            </div>
          </div>
        </div>
        {/* Tabla con scroll infinito */}
        {isLoading ? (
          // Skeleton loading solo para carga inicial
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Fecha de creación</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Artículos</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Scroll infinito para las órdenes
          <InfiniteScroll
            dataLength={ordenes.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <div className="bg-white border-l border-r border-gray-100 px-6 py-8">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                  <span className="text-sm text-gray-500">Cargando más órdenes...</span>
                </div>
              </div>
            }
            endMessage={
              <div className="bg-white border-l border-r border-b border-gray-100 rounded-b-xl px-6 py-8">
                <div className="flex flex-col items-center space-y-2">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-500 font-medium">
                    ¡Has visto todas las órdenes!
                  </p>
                  <p className="text-xs text-gray-400">
                    Se han cargado {ordenes.length} órdenes en total
                  </p>
                </div>
              </div>
            }
            scrollThreshold={0.8}
          >
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Usuario</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Fecha de creación</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Artículos</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map((orden) => (
                      <tr key={orden.id} className="border-b border-gray-50 hover:bg-green-50 transition-colors cursor-pointer" onClick={() => openOrdenModal(orden)}>
                        <td className="px-6 py-4 text-sm text-gray-500">{orden.id}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            orden.estado === 'rechazada' 
                              ? 'bg-red-100 text-red-800' 
                              : orden.estado === 'completada' 
                              ? 'bg-green-100 text-green-800' 
                              : orden.estado === 'pendiente' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : orden.estado === 'preparando' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {orden.usuario}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {formatFecha(orden.fechaCreacion)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {orden.articulos}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ${orden.total.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </InfiniteScroll>
        )}
        {/* Footer minimalista */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Cargando...' : `Mostrando ${ordenes.length} de ${totalOrdenes} órdenes`}
          </p>
          {!isLoading && hasMore && (
            <p className="text-xs text-gray-400 mt-1">
              Haz scroll hacia abajo para cargar más
            </p>
          )}
        </div>
      </div>

      {/* Modal de detalles de la orden */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
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
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  selectedOrden.estado === 'rechazada' 
                    ? 'bg-red-100 text-red-800' 
                    : selectedOrden.estado === 'completada' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedOrden.estado === 'pendiente' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : selectedOrden.estado === 'preparando' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedOrden.estado.charAt(0).toUpperCase() + selectedOrden.estado.slice(1)}
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
                  <span className="text-gray-700">{formatFecha(selectedOrden.fechaCreacion)}</span>
                </div>
              </div>
            </div>

            {/* Artículos y mesa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Artículos</label>
                <span className="text-gray-900 font-medium">{selectedOrden.articulos}</span>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Mesa</label>
                <span className="text-gray-900 font-medium">#{selectedOrden.mesa}</span>
              </div>
            </div>

            {/* Total destacado */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Total de la orden</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">${selectedOrden.total.toFixed(2)}</span>
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
    </DashboardLayout>
  );
}
