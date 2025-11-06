'use server';

// Simular base de datos con más órdenes para testing
const mockOrdenesDB = [
  {
    id: 'ORD-001',
    usuario: 'Juan Pérez',
    fechaCreacion: '2025-11-04T10:30:15.123456',
    articulos: 3,
    mesa: 5,
    total: 25.50,
    estado: 'pendiente'
  },
  {
    id: 'ORD-002',
    usuario: 'María García',
    fechaCreacion: '2025-11-04T10:25:32.987654',
    articulos: 2,
    mesa: 12,
    total: 18.75,
    estado: 'preparando'
  },
  {
    id: 'ORD-003',
    usuario: 'Carlos López',
    fechaCreacion: '2025-11-04T10:20:45.456789',
    articulos: 4,
    mesa: 8,
    total: 32.00,
    estado: 'preparando'
  },
  {
    id: 'ORD-004',
    usuario: 'Ana Martínez',
    fechaCreacion: '2025-11-04T10:15:22.234567',
    articulos: 1,
    mesa: 3,
    total: 12.25,
    estado: 'completada'
  },
  {
    id: 'ORD-005',
    usuario: 'Luis Rodríguez',
    fechaCreacion: '2025-11-04T10:10:18.345678',
    articulos: 5,
    mesa: 15,
    total: 45.80,
    estado: 'completada'
  },
  {
    id: 'ORD-006',
    usuario: 'Sofia Hernández',
    fechaCreacion: '2025-11-04T10:05:41.567890',
    articulos: 2,
    mesa: 7,
    total: 19.90,
    estado: 'rechazada'
  },
  {
    id: 'ORD-007',
    usuario: 'Diego Torres',
    fechaCreacion: '2025-11-04T10:35:27.678901',
    articulos: 3,
    mesa: 22,
    total: 28.50,
    estado: 'pendiente'
  },
  {
    id: 'ORD-008',
    usuario: 'Elena Vargas',
    fechaCreacion: '2025-11-04T10:32:53.789012',
    articulos: 4,
    mesa: 14,
    total: 35.75,
    estado: 'preparando'
  },
  {
    id: 'ORD-009',
    usuario: 'Roberto Silva',
    fechaCreacion: '2025-11-04T10:40:09.890123',
    articulos: 2,
    mesa: 9,
    total: 22.30,
    estado: 'pendiente'
  },
  {
    id: 'ORD-010',
    usuario: 'Patricia Ruiz',
    fechaCreacion: '2025-11-04T10:38:36.012345',
    articulos: 6,
    mesa: 18,
    total: 52.90,
    estado: 'pendiente'
  },
  // Agregar más órdenes para simular scroll infinito
  {
    id: 'ORD-011',
    usuario: 'Fernando Castro',
    fechaCreacion: '2025-11-03T15:20:30.123456',
    articulos: 2,
    mesa: 11,
    total: 22.30,
    estado: 'completada'
  },
  {
    id: 'ORD-012',
    usuario: 'Isabella Moreno',
    fechaCreacion: '2025-11-03T14:45:22.987654',
    articulos: 5,
    mesa: 6,
    total: 48.75,
    estado: 'completada'
  },
  {
    id: 'ORD-013',
    usuario: 'Gabriel Reyes',
    fechaCreacion: '2025-11-03T13:30:15.456789',
    articulos: 1,
    mesa: 20,
    total: 15.50,
    estado: 'completada'
  },
  {
    id: 'ORD-014',
    usuario: 'Valentina Jiménez',
    fechaCreacion: '2025-11-03T12:15:45.234567',
    articulos: 3,
    mesa: 4,
    total: 33.25,
    estado: 'completada'
  },
  {
    id: 'ORD-015',
    usuario: 'Sebastián Ortega',
    fechaCreacion: '2025-11-03T11:40:30.345678',
    articulos: 4,
    mesa: 16,
    total: 42.80,
    estado: 'completada'
  },
  {
    id: 'ORD-016',
    usuario: 'Camila Vega',
    fechaCreacion: '2025-11-03T10:25:18.567890',
    articulos: 2,
    mesa: 13,
    total: 28.90,
    estado: 'completada'
  },
  {
    id: 'ORD-017',
    usuario: 'Mateo Delgado',
    fechaCreacion: '2025-11-02T16:50:45.678901',
    articulos: 6,
    mesa: 8,
    total: 55.40,
    estado: 'completada'
  },
  {
    id: 'ORD-018',
    usuario: 'Antonella Ramos',
    fechaCreacion: '2025-11-02T15:35:22.789012',
    articulos: 1,
    mesa: 19,
    total: 12.75,
    estado: 'completada'
  },
  {
    id: 'ORD-019',
    usuario: 'Joaquín Mendoza',
    fechaCreacion: '2025-11-02T14:20:15.890123',
    articulos: 3,
    mesa: 2,
    total: 35.60,
    estado: 'completada'
  },
  {
    id: 'ORD-020',
    usuario: 'Martina Cruz',
    fechaCreacion: '2025-11-02T13:45:30.012345',
    articulos: 4,
    mesa: 17,
    total: 41.25,
    estado: 'completada'
  }
];

/**
 * Obtener órdenes con paginación
 * @param {number} page - Número de página (empezando en 1)
 * @param {number} limit - Cantidad de elementos por página
 * @param {string} sort - Campo para ordenar ('fechaCreacion', 'total', 'estado')
 * @param {string} order - Dirección del orden ('asc' o 'desc')
 * @returns {Object} - Objeto con data, paginación y metadatos
 */
export async function getOrdenesPaginadas(page = 1, limit = 10, sort = 'fechaCreacion', order = 'desc') {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Ordenar datos
    const sortedOrdenes = [...mockOrdenesDB].sort((a, b) => {
      let aValue = a[sort];
      let bValue = b[sort];

      // Manejar fechas
      if (sort === 'fechaCreacion') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calcular índices para paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrdenes = sortedOrdenes.slice(startIndex, endIndex);

    // Metadatos de paginación
    const totalItems = sortedOrdenes.length;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      data: paginatedOrdenes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      meta: {
        sort,
        order,
        timestamp: new Date().toISOString()
      }
    };

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
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
      }
    };
  }
}

/**
 * Obtener órdenes iniciales (primera carga)
 */
export async function getOrdenesIniciales() {
  return await getOrdenesPaginadas(1, 10, 'fechaCreacion', 'desc');
}

/**
 * Cargar más órdenes para scroll infinito
 */
export async function cargarMasOrdenes(page, limit = 10) {
  return await getOrdenesPaginadas(page, limit, 'fechaCreacion', 'desc');
}