const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Obtiene el historial de órdenes con paginación, filtros y ordenamiento
 * @param {Object} params - Parámetros de consulta
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.limit - Elementos por página (default: 10)
 * @param {string} params.sort - Campo para ordenar (default: 'fechaCreacion')
 * @param {string} params.order - Orden ascendente/descendente (asc/desc, default: 'desc')
 * @param {string} params.estado - Filtrar por estado de orden
 * @param {string} params.fecha - Filtrar por fecha específica (YYYY-MM-DD)
 * @param {string} params.usuario - Filtrar por nombre de usuario
 * @param {string} params.numeroOrden - Filtrar por número/ID de orden
 * @returns {Promise<Object>} Respuesta con datos paginados
 */
async function getHistorialOrdenes(params = {}) {
    try {
        // Parámetros con valores por defecto
        const {
            page = 1,
            limit = 10,
            sort = 'fechaCreacion',
            order = 'desc',
            estado,
            fecha,
            usuario,
            numeroOrden
        } = params;

        // Construir query string con todos los parámetros
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sort,
            order
        });

        // Agregar filtros opcionales si tienen valor
        if (estado && estado.trim() !== '') {
            queryParams.append('estado', estado);
        }
        if (fecha && fecha.trim() !== '') {
            queryParams.append('fecha', fecha);
        }
        if (usuario && usuario.trim() !== '') {
            queryParams.append('usuario', usuario);
        }
        if (numeroOrden && numeroOrden.trim() !== '') {
            queryParams.append('numeroOrden', numeroOrden);
        }

        const response = await fetch(`${API_URL}/ordenes/historial?${queryParams}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error al obtener historial de órdenes:', error);
        throw error;
    }
}

/**
 * Obtener órdenes con paginación
 * @param {number} page - Número de página (empezando en 1)
 * @param {number} limit - Cantidad de elementos por página
 * @param {string} sort - Campo para ordenar
 * @param {string} order - Dirección del orden (asc/desc)
 * @param {Object} filtros - Filtros adicionales
 * @returns {Object} - Objeto con data, paginación y success flag
 */
async function getOrdenesPaginadas(page = 1, limit = 10, sort = 'fechaCreacion', order = 'desc', filtros = {}) {
    try {
        const params = {
            page,
            limit,
            sort,
            order,
            ...filtros
        };
        return await getHistorialOrdenes(params);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        return {
            success: false,
            error: 'Error al cargar las órdenes',
            data: [],
            pagination: {
                currentPage: page,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: limit,
                hasNextPage: false
            },
            meta: {
                sort,
                order,
                filters: filtros,
                timestamp: new Date().toISOString()
            }
        };
    }
}

/**
 * Obtener órdenes iniciales (primera carga)
 * @param {number} limit - Límite de elementos por página
 * @param {Object} filtros - Filtros adicionales opcionales
 * @param {Object} ordenamiento - Configuración de ordenamiento
 */
export async function getOrdenesIniciales(limit = 10, filtros = {}, ordenamiento = {}) {
    const { sort = 'fechaCreacion', order = 'desc' } = ordenamiento;
    return await getOrdenesPaginadas(1, limit, sort, order, filtros);
}

/**
 * Cargar más órdenes para scroll infinito
 * @param {number} page - Página a cargar
 * @param {number} limit - Límite de elementos
 * @param {Object} filtros - Filtros adicionales opcionales
 * @param {Object} ordenamiento - Configuración de ordenamiento
 */
export async function cargarMasOrdenes(page, limit = 10, filtros = {}, ordenamiento = {}) {
    const { sort = 'fechaCreacion', order = 'desc' } = ordenamiento;
    return await getOrdenesPaginadas(page, limit, sort, order, filtros);
}

/**
 * Obtener el detalle completo de una orden
 * @param {number|string} ordenId - ID de la orden
 * @returns {Promise<Object>} - Datos completos de la orden
 */
export async function getOrdenDetalle(ordenId) {
    try {
        const response = await fetch(`${API_URL}/ordenes/${ordenId}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener detalle de orden:', error);
        throw error;
    }
}

/**
 * Actualiza el estado de una orden.
 * @param {number|string} ordenId - ID de la orden
 * @param {string} nuevoStatus - Nuevo estado (PENDIENTE, PREPARANDO, COMPLETADA, RECHAZADA)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function actualizarEstadoOrden(ordenId, nuevoStatus) {
    try {
        const response = await fetch(`${API_URL}/ordenes/${ordenId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: nuevoStatus }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error('Error al actualizar estado de orden:', error);
        throw error;
    }
}

/**
 * Obtiene los datos necesarios para realizar el corte de caja de un día específico
 * Aprovecha el endpoint de historial con parámetros optimizados
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Object>} - Datos del historial filtrados para el corte
 */
export async function getCorteCajaData(fecha) {
    try {
        // Obtenemos un límite alto para asegurar que traemos todas las órdenes del día
        // Si hay más de 500 órdenes en un día, se necesitaría paginación adicional o reporte de backend
        const params = {
            fecha,
            limit: 500,
            sort: 'fechaCreacion',
            order: 'asc'
        };

        return await getHistorialOrdenes(params);
    } catch (error) {
        console.error(`Error al obtener datos para el corte de caja del ${fecha}:`, error);
        throw error;
    }
}