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
import { deleteTipoModificador, getTiposModificador, postTipoModificador, updateTipoModificador, updateTipoModificadorOrder } from '../../actions/tiposModificador';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import TipoModificadorForm from '../../components/TipoModificadorForm';
import { useAuth } from '../../contexts/AuthContext';

// Componente para las filas sortables de la tabla
function SortableItem({ tipoModificador, index, onEdit, totalItems, loadingReorder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tipoModificador.id });

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
      onClick={() => onEdit(tipoModificador)}
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
        {tipoModificador.id}
      </td>
      {/* Nombre */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {tipoModificador.nombre}
        </div>
      </td>
      {/* Es Único */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          tipoModificador.esUnico 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {tipoModificador.esUnico ? 'Sí' : 'No'}
        </span>
      </td>
      {/* Acciones */}
      <td className="px-6 py-4">
        <div className="flex justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tipoModificador);
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

export default function TiposModificadorPage() {
  const { checkTokenExpiry } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTipoModificador, setSelectedTipoModificador] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });
  const [tiposModificador, setTiposModificador] = useState([]);
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
      const tiposModificadorData = await getTiposModificador();
      setTiposModificador(tiposModificadorData);
    } catch (error) {
      console.error('Error al cargar tipos de modificador:', error);
      showNotification('Error al cargar los tipos de modificador', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openTipoModificadorModal = (tipoModificador, mode = 'view') => {
    setSelectedTipoModificador(tipoModificador);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTipoModificador(null);
    setModalMode('view');
  };

  const handleCreateTipoModificador = () => {
    openTipoModificadorModal(null, 'create');
  };

  const handleEditTipoModificador = (tipoModificador) => {
    openTipoModificadorModal(tipoModificador, 'edit');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSaveTipoModificador = async (tipoModificadorData) => {
    try {
      if (modalMode === 'edit' && selectedTipoModificador?.id) {
        await updateTipoModificador(selectedTipoModificador.id, tipoModificadorData);
        showNotification('Tipo de modificador actualizado exitosamente', 'success');
      } else {
        await postTipoModificador(tipoModificadorData);
        showNotification('Tipo de modificador creado exitosamente', 'success');
      }
      
      closeModal();
      fetchData();
      
    } catch (error) {
      console.error('Error al guardar tipo de modificador:', error);
      const errorMessage = error.message || 'Error al guardar el tipo de modificador';
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const handleDeleteTipoModificador = (tipoModificadorId) => {
    const tipoModificador = selectedTipoModificador;
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Tipo de Modificador',
      message: `¿Estás seguro de que quieres eliminar el tipo de modificador "${tipoModificador?.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => executeDeleteTipoModificador(tipoModificadorId)
    });
  };

  const executeDeleteTipoModificador = async (tipoModificadorId) => {
    try {
      const result = await deleteTipoModificador(tipoModificadorId);
      showNotification('Tipo de modificador eliminado exitosamente', 'success');
      
      closeModal();
      fetchData();
      
    } catch (error) {
      console.error('Error al eliminar tipo de modificador:', error);
      let errorMessage = 'Error al eliminar el tipo de modificador';
      
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
      const oldIndex = tiposModificador.findIndex((tipoModificador) => tipoModificador.id === active.id);
      const newIndex = tiposModificador.findIndex((tipoModificador) => tipoModificador.id === over.id);

      const newTiposModificador = arrayMove(tiposModificador, oldIndex, newIndex);
      setTiposModificador(newTiposModificador);

      // Actualizar el orden en el backend
      setLoadingReorder(true);
      try {
        const newOrder = newTiposModificador.map((tipoModificador, index) => ({
          id: tipoModificador.id,
          posicion: index + 1
        }));
        
        await updateTipoModificadorOrder(newOrder);
        showNotification('Orden de tipos modificador actualizado correctamente', 'success');
      } catch (error) {
        console.error('Error al actualizar orden en el servidor:', error);
        showNotification('Error al actualizar el orden en el servidor', 'error');
        // Revertir cambios locales en caso de error
        setTiposModificador(tiposModificador);
      } finally {
        setLoadingReorder(false);
      }
      
      // Log para desarrollo - mostrar el nuevo orden
      console.log('Nuevo orden de tipos modificador:', newTiposModificador.map((tipoModificador, index) => ({
        id: tipoModificador.id,
        nombre: tipoModificador.nombre,
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
              <h1 className="text-3xl font-light text-gray-900">Tipos de Modificador</h1>
            </div>
            <button 
              onClick={handleCreateTipoModificador}
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
                      Es Único
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={tiposModificador.map(tipoModificador => tipoModificador.id)}
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
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      tiposModificador.map((tipoModificador, index) => (
                        <SortableItem
                          key={tipoModificador.id}
                          tipoModificador={tipoModificador}
                          index={index}
                          onEdit={handleEditTipoModificador}
                          totalItems={tiposModificador.length}
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
            {tiposModificador.length} tipos de modificador
          </p>
        </div>
      </div>

      {/* Modal con formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Crear Nuevo Tipo de Modificador' :
          modalMode === 'edit' ? 'Editar Tipo de Modificador' :
          'Detalles del Tipo de Modificador'
        }
      >
        {modalMode === 'create' || modalMode === 'edit' ? (
          <TipoModificadorForm
            tipoModificador={selectedTipoModificador}
            onSave={handleSaveTipoModificador}
            onCancel={closeModal}
            onDelete={handleDeleteTipoModificador}
          />
        ) : (
          /* Vista de solo lectura - puedes implementar esto más tarde */
          <div className="text-center py-8">
            <p className="text-gray-500">Vista de detalles del tipo de modificador (por implementar)</p>
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
