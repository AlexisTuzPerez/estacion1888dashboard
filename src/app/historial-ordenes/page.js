'use client';
import { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { cargarMasOrdenes, getOrdenDetalle, getOrdenesIniciales } from '../../actions/ordenes';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

export default function OrdenesPage() {
  const { checkTokenExpiry } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrdenes, setTotalOrdenes] = useState(0);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha: '',
    usuario: '',
    numeroOrden: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState({
    sort: 'fechaCreacion',
    order: 'desc'
  });

  // Cargar órdenes iniciales
  const cargarOrdenesIniciales = useCallback(async (filtrosActuales = {}, ordenActual = ordenamiento) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getOrdenesIniciales(10, filtrosActuales, ordenActual);

      if (response.success) {
        setOrdenes(response.data);
        setTotalOrdenes(response.pagination.totalItems);
        setHasMore(response.pagination.hasNextPage);
        setCurrentPage(response.pagination.currentPage);
      } else {
        setError(response.error || 'Error al cargar las órdenes');
        setOrdenes([]);
        setTotalOrdenes(0);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error al cargar órdenes iniciales:', error);
      setError('Error de conexión al cargar las órdenes');
      setOrdenes([]);
      setTotalOrdenes(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [ordenamiento]);

  useEffect(() => {
    checkTokenExpiry();
    cargarOrdenesIniciales();
  }, [checkTokenExpiry, cargarOrdenesIniciales]);

  // Cargar más órdenes para scroll infinito
  const fetchMoreData = async () => {
    try {
      const nextPage = currentPage + 1;
      const response = await cargarMasOrdenes(nextPage, 10, filtros, ordenamiento);

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

  // Aplicar filtros
  const aplicarFiltros = () => {
    setCurrentPage(1);
    cargarOrdenesIniciales(filtros, ordenamiento);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    const filtrosVacios = {
      estado: '',
      fecha: '',
      usuario: '',
      numeroOrden: ''
    };
    setFiltros(filtrosVacios);
    setCurrentPage(1);
    cargarOrdenesIniciales(filtrosVacios, ordenamiento);
  };

  // Cambiar ordenamiento
  const cambiarOrdenamiento = (campo) => {
    const nuevoOrdenamiento = {
      sort: campo,
      order: ordenamiento.sort === campo && ordenamiento.order === 'desc' ? 'asc' : 'desc'
    };
    setOrdenamiento(nuevoOrdenamiento);
    setCurrentPage(1);
    cargarOrdenesIniciales(filtros, nuevoOrdenamiento);
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
  const openOrdenModal = async (orden) => {
    // Info básica preliminar
    setSelectedOrden(orden);
    setIsModalOpen(true);
    setIsLoadingDetails(true);

    try {
      const ordenCompleta = await getOrdenDetalle(orden.id);
      // Mezclamos con lo que ya teníamos por si acaso
      const tipoOrdenCompleta = ordenCompleta.tipoOrden || orden.tipoOrden || 'COMER_AQUI';
      const mesaCompleta = tipoOrdenCompleta === 'PARA_LLEVAR' ? 'Para llevar' : (ordenCompleta.mesa?.numero || orden.mesa?.numero || ordenCompleta.mesa || orden.mesa || '---');

      setSelectedOrden({
        ...orden,
        ...ordenCompleta,
        // Aseguramos mantener campos si el endpoint detalle los trae diferente, o priorizamos detalle
        usuario: ordenCompleta.usuarioNombre || orden.usuario || ordenCompleta.usuario,
        estado: ordenCompleta.estado || orden.estado,
        tipoOrden: tipoOrdenCompleta,
        mesa: mesaCompleta
      });
    } catch (error) {
      console.error("Error al cargar detalles de la orden:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrden(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header con filtros */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Historial de Órdenes</h1>
              <p className="text-sm text-gray-500 mt-2">
                {error ? 'Error al cargar las órdenes' : `${totalOrdenes} órdenes en total`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filtros
              </button>
              <button
                onClick={() => cargarOrdenesIniciales(filtros, ordenamiento)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro por número de orden */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Orden</label>
                  <input
                    type="text"
                    value={filtros.numeroOrden}
                    onChange={(e) => setFiltros({ ...filtros, numeroOrden: e.target.value })}
                    placeholder="Ej: 123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Filtro por estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="preparando">Preparando</option>
                    <option value="completada">Completada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>

                {/* Filtro por usuario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                  <input
                    type="text"
                    value={filtros.usuario}
                    onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
                    placeholder="Nombre del usuario"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Filtro por fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={filtros.fecha}
                    onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botones de acción para filtros */}
              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={aplicarFiltros}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Aplicar filtros
                </button>
                <button
                  onClick={limpiarFiltros}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Tabla con scroll infinito */}
        {error ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Error al cargar las órdenes</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                onClick={() => cargarOrdenesIniciales(filtros, ordenamiento)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : isLoading ? (
          // Skeleton loading solo para carga inicial
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      <button
                        onClick={() => cambiarOrdenamiento('estado')}
                        className="flex items-center space-x-1 hover:text-gray-900"
                      >
                        <span>Estado</span>
                        {ordenamiento.sort === 'estado' && (
                          <svg className={`h-4 w-4 ${ordenamiento.order === 'desc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      <button
                        onClick={() => cambiarOrdenamiento('usuario')}
                        className="flex items-center space-x-1 hover:text-gray-900"
                      >
                        <span>Usuario</span>
                        {ordenamiento.sort === 'usuario' && (
                          <svg className={`h-4 w-4 ${ordenamiento.order === 'desc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      <button
                        onClick={() => cambiarOrdenamiento('fechaCreacion')}
                        className="flex items-center space-x-1 hover:text-gray-900"
                      >
                        <span>Fecha de creación</span>
                        {ordenamiento.sort === 'fechaCreacion' && (
                          <svg className={`h-4 w-4 ${ordenamiento.order === 'desc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Artículos</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Mesa</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      <button
                        onClick={() => cambiarOrdenamiento('total')}
                        className="flex items-center space-x-1 hover:text-gray-900"
                      >
                        <span>Total</span>
                        {ordenamiento.sort === 'total' && (
                          <svg className={`h-4 w-4 ${ordenamiento.order === 'desc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </th>
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
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
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
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Mesa</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron órdenes</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {Object.values(filtros).some(f => f !== '') ? 'Intenta cambiar los filtros de búsqueda.' : 'No hay órdenes registradas.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      ordenes.map((orden) => (
                        <tr key={orden.id} className="border-b border-gray-50 hover:bg-green-50 transition-colors cursor-pointer" onClick={() => openOrdenModal(orden)}>
                          <td className="px-6 py-4 text-sm text-gray-500">{orden.id}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${orden.estado.toLowerCase() === 'rechazada'
                              ? 'bg-red-100 text-red-800'
                              : orden.estado.toLowerCase() === 'completada'
                                ? 'bg-green-100 text-green-800'
                                : orden.estado.toLowerCase() === 'pendiente'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : orden.estado.toLowerCase() === 'preparando'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                              {orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1).toLowerCase()}
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
                            <div className={`text-sm font-medium ${orden.tipoOrden === 'PARA_LLEVAR' ? 'text-orange-600' : 'text-green-600'}`}>
                              {orden.tipoOrden === 'PARA_LLEVAR' ? 'Para Llevar' : 'Comer Aquí'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {orden.tipoOrden === 'PARA_LLEVAR' ? '---' : (orden.mesa?.numero || orden.mesa || '---')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              ${orden.total.toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
                <p className="text-sm text-gray-500 mt-1">Detalles de la orden</p>
              </div>
              <div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedOrden.estado.toLowerCase() === 'rechazada'
                  ? 'bg-red-100 text-red-800'
                  : selectedOrden.estado.toLowerCase() === 'completada'
                    ? 'bg-green-100 text-green-800'
                    : selectedOrden.estado.toLowerCase() === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedOrden.estado.toLowerCase() === 'preparando'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                  {selectedOrden.estado.charAt(0).toUpperCase() + selectedOrden.estado.slice(1).toLowerCase()}
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
                <label className="block text-sm font-medium text-gray-700">{selectedOrden.tipoOrden === 'PARA_LLEVAR' ? 'Destino de Orden' : 'Mesa / Asiento'}</label>
                <span className="text-gray-900 font-medium">{selectedOrden.tipoOrden === 'PARA_LLEVAR' ? 'Para Llevar' : selectedOrden.mesa}</span>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <span className="text-gray-900 font-medium">{selectedOrden.notas || 'Sin notas'}</span>
              </div>
            </div>

            {/* Lista de Productos Detallada */}
            <div className="space-y-3 mt-6">
              <h4 className="font-medium text-gray-900 pb-2 border-b border-gray-100">Productos ({selectedOrden.productos ? selectedOrden.productos.reduce((acc, prod) => acc + (Number(prod.cantidad) || 0), 0) : 0})</h4>

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
