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
import { deleteTamano, getTamanos, postTamano, updateTamano, updateTamanoOrder } from '../../actions/tamanos';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import TamanoForm from '../../components/TamanoForm';
import { useAuth } from '../../contexts/AuthContext';

// Componente para las filas sortables de la tabla
function SortableItem({ tamano, index, onEdit, totalItems, loadingReorder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tamano.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr 
      ref={setNodeRef}
      style={style}
      className={`hover:bg-green-50 transition-colors cursor-pointer ${
        index !== totalItems - 1 ? 'border-b border-gray-50' : ''
      } ${isDragging ? 'z-50' : ''}`}
      onClick={() => onEdit(tamano)}
    >
      {/* Columna Posición con handle de drag and drop */}
      <td className="px-6 py-4">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
          onClick={(e) => e.stopPropagation()}
          title="Arrastrar para cambiar posición"
          disabled={loadingReorder}
        >
          {loadingReorder ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </td>
      {/* ID */}
      <td className="px-6 py-4 text-sm text-gray-500">
        {tamano.id}
      </td>
      {/* Nombre */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {tamano.nombre}
        </div>
      </td>
      {/* Descripción */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600">
          {tamano.descripcion}
        </div>
      </td>
      {/* Acciones */}
      <td className="px-6 py-4">
        <div className="flex justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tamano);
            }}
            className="text-gray-400 hover:text-[#0E592F] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TamanosPage() {
  const { checkTokenExpiry } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTamano, setSelectedTamano] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });
  const [tamanos, setTamanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReorder, setLoadingReorder] = useState(false);

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
      const tamanosData = await getTamanos();
      setTamanos(tamanosData);
    } catch (error) {
      console.error('Error al cargar tamaños:', error);
      showNotification('Error al cargar los tamaños', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openTamanoModal = (tamano, mode = 'view') => {
    setSelectedTamano(tamano);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTamano(null);
    setModalMode('view');
  };

  const handleCreateTamano = () => {
    openTamanoModal(null, 'create');
  };

  const handleEditTamano = (tamano) => {
    openTamanoModal(tamano, 'edit');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSaveTamano = async (tamanoData) => {
    try {
      if (modalMode === 'edit' && selectedTamano?.id) {
        await updateTamano(selectedTamano.id, tamanoData);
        showNotification('Tamaño actualizado exitosamente', 'success');
      } else {
        await postTamano(tamanoData);
        showNotification('Tamaño creado exitosamente', 'success');
      }
      
      closeModal();
      
      fetchData();
      
    } catch (error) {
      console.error('Error al guardar tamaño:', error);
      const errorMessage = error.message || 'Error al guardar el tamaño';
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const handleDeleteTamano = (tamanoId) => {
    const tamano = selectedTamano;
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Tamaño',
      message: `¿Estás seguro de que quieres eliminar el tamaño "${tamano?.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => executeDeleteTamano(tamanoId)
    });
  };

  const executeDeleteTamano = async (tamanoId) => {
    try {
      const result = await deleteTamano(tamanoId);
      showNotification('Tamaño eliminado exitosamente', 'success');
      
      closeModal();
      
      fetchData();
      
    } catch (error) {
      console.error('Error al eliminar tamaño:', error);
      let errorMessage = 'Error al eliminar el tamaño';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response) {
        errorMessage = `Error del servidor: ${error.response.status}`;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  // Función para manejar el reordenamiento por drag and drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tamanos.findIndex((tamano) => tamano.id === active.id);
      const newIndex = tamanos.findIndex((tamano) => tamano.id === over.id);

      const newTamanos = arrayMove(tamanos, oldIndex, newIndex);
      setTamanos(newTamanos);

      // Actualizar el orden en el backend
      setLoadingReorder(true);
      try {
        const newOrder = newTamanos.map((tamano, index) => ({
          id: tamano.id,
          posicion: index + 1
        }));
        
        await updateTamanoOrder(newOrder);
        showNotification('Orden de tamaños actualizado correctamente', 'success');
      } catch (error) {
        console.error('Error al actualizar orden en el servidor:', error);
        showNotification('Error al actualizar el orden en el servidor', 'error');
        // Revertir cambios locales en caso de error
        setTamanos(tamanos);
      } finally {
        setLoadingReorder(false);
      }
      
      // Log para desarrollo - mostrar el nuevo orden
      console.log('Nuevo orden de tamaños:', newTamanos.map((tamano, index) => ({
        id: tamano.id,
        nombre: tamano.nombre,
        posicion: index + 1
      })));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header minimalista */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Tamaños</h1>
            </div>
            <button 
              onClick={handleCreateTamano}
              className="bg-[#0E592F] text-white px-3 mr-1 py-3 rounded-lg hover:bg-[#0B4A27] transition-colors font-medium flex items-center"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
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
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600 w-16">
                      Posición
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={tamanos.map(tamano => tamano.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, index) => (
                        <tr key={index} className="border-b border-gray-50">
                          <td className="px-6 py-4 text-center">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5"></div>
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
                          <td className="px-6 py-4 text-right">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      tamanos.map((tamano, index) => (
                        <SortableItem
                          key={tamano.id}
                          tamano={tamano}
                          index={index}
                          onEdit={handleEditTamano}
                          totalItems={tamanos.length}
                          loadingReorder={loadingReorder}
                        />
                      ))
                    )}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>
        </div>

        {/* Footer minimalista */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {tamanos.length} tamaños
          </p>
        </div>
      </div>

      {/* Modal con formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Crear Nuevo Tamaño' :
          modalMode === 'edit' ? 'Editar Tamaño' :
          'Detalles del Tamaño'
        }
      >
        {modalMode === 'create' || modalMode === 'edit' ? (
          <TamanoForm
            tamano={selectedTamano}
            onSave={handleSaveTamano}
            onCancel={closeModal}
            onDelete={handleDeleteTamano}
          />
        ) : (
          /* Vista de solo lectura - puedes implementar esto más tarde */
          <div className="text-center py-8">
            <p className="text-gray-500">Vista de detalles del tamaño (por implementar)</p>
          </div>
        )}
      </Modal>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
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

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </DashboardLayout>
  );
}
