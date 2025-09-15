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
import { getCategorias } from '../../actions/categoria';
import { deleteModificador, getModificadores, postModificador, updateModificador, updateModificadorOrder } from '../../actions/modificadores';
import { getTiposModificador } from '../../actions/tiposModificador';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import ModificadorForm from '../../components/ModificadorForm';
import { useAuth } from '../../contexts/AuthContext';

// Componente para las filas sortables de la tabla
function SortableItem({ modificador, index, onEdit, totalItems, subcategorias, loadingReorder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: modificador.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Manejar tanto subcategorias (array) como subcategoriaId (singular) para compatibilidad
  const modificadorSubcategorias = modificador.subcategorias || 
    (modificador.subcategoriaId ? [{ id: modificador.subcategoriaId }] : []);

  return (
    <tr 
      ref={setNodeRef}
      style={style}
      className={`hover:bg-green-50 transition-colors cursor-pointer ${
        index !== totalItems - 1 ? 'border-b border-gray-50' : ''
      } ${isDragging ? 'z-50' : ''}`}
      onClick={() => onEdit(modificador)}
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
        {modificador.id}
      </td>
      {/* Nombre */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {modificador.nombre}
        </div>
      </td>
      {/* Precio */}
      <td className="px-6 py-4 text-sm">
        <span className={`font-medium ${
          modificador.precio === 0 
            ? 'text-[#16A34A]' 
            : 'text-gray-900'
        }`}>
          {modificador.precio === 0 ? 'Gratis' : `$${modificador.precio}`}
        </span>
      </td>
      {/* Tipo - Ya no es necesario mostrar aquí ya que está agrupado por tipo */}
      {/* Subcategorías */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {modificadorSubcategorias.length > 0 ? (
            modificadorSubcategorias.map((subcategoriaData) => {
              const subcategoria = subcategorias.find(sub => sub.id === subcategoriaData.id);
              return (
                <span 
                  key={subcategoriaData.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-[#0E592F]"
                >
                  {subcategoria?.nombre || `ID: ${subcategoriaData.id}`}
                </span>
              );
            })
          ) : (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
              Sin subcategorías
            </span>
          )}
        </div>
      </td>
      {/* Acciones */}
      <td className="px-6 py-4">
        <div className="flex justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(modificador);
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

// Componente para tabla de modificadores por tipo
function ModificadoresTableByType({ tipo, modificadores, onEdit, subcategorias, sensors, onDragEnd, loadingReorder }) {
  return (
    <div className="mb-8">
      {/* Header del tipo de modificador */}
      <div className="mb-4">
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          {tipo.nombre}
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {modificadores.length} modificador{modificadores.length !== 1 ? 'es' : ''}
          </span>
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tipo.esUnico ? 'Selección única' : 'Selección múltiple'}
          </span>
        </div>
      </div>

      {/* Tabla de modificadores */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
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
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Subcategorías
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <SortableContext
                items={modificadores.map(modificador => modificador.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {modificadores.map((modificador, index) => (
                    <SortableItem
                      key={modificador.id}
                      modificador={modificador}
                      index={index}
                      onEdit={onEdit}
                      totalItems={modificadores.length}
                      subcategorias={subcategorias}
                      loadingReorder={loadingReorder}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

export default function ModificadoresPage() {
  const { checkTokenExpiry } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModificador, setSelectedModificador] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });
  const [modificadores, setModificadores] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
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
      const [modificadoresData, subcategoriasData, tiposModificadorData] = await Promise.all([
        getModificadores(),
        getCategorias(),
        getTiposModificador()
      ]);
      setModificadores(modificadoresData);
      setSubcategorias(subcategoriasData);
      setTiposModificador(tiposModificadorData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para agrupar modificadores por tipo
  const groupModificadoresByType = useCallback(() => {
    const grouped = {};
    
    // Inicializar grupos para todos los tipos de modificador
    tiposModificador.forEach(tipo => {
      grouped[tipo.id] = {
        tipo: tipo,
        modificadores: []
      };
    });
    
    // Agrupar modificadores por tipo
    modificadores.forEach(modificador => {
      const tipoId = modificador.tipoModificador?.id;
      if (tipoId && grouped[tipoId]) {
        grouped[tipoId].modificadores.push(modificador);
      }
    });
    
    // Filtrar solo los grupos que tienen modificadores
    return Object.values(grouped).filter(group => group.modificadores.length > 0);
  }, [modificadores, tiposModificador]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModificadorModal = (modificador, mode = 'view') => {
    setSelectedModificador(modificador);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedModificador(null);
    setModalMode('view');
  };

  const handleCreateModificador = () => {
    openModificadorModal(null, 'create');
  };

  const handleEditModificador = (modificador) => {
    openModificadorModal(modificador, 'edit');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSaveModificador = async (modificadorData) => {
    try {
      if (modalMode === 'edit' && selectedModificador?.id) {
        await updateModificador(selectedModificador.id, modificadorData);
        showNotification('Modificador actualizado exitosamente', 'success');
      } else {
        await postModificador(modificadorData);
        showNotification('Modificador creado exitosamente', 'success');
      }
      
      closeModal();
      
      fetchData();
      
    } catch (error) {
      console.error('Error al guardar modificador:', error);
      const errorMessage = error.message || 'Error al guardar el modificador';
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const handleDeleteModificador = (modificadorId) => {
    const modificador = selectedModificador;
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Modificador',
      message: `¿Estás seguro de que quieres eliminar el modificador "${modificador?.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => executeDeleteModificador(modificadorId)
    });
  };

  const executeDeleteModificador = async (modificadorId) => {
    try {
      const result = await deleteModificador(modificadorId);
      showNotification('Modificador eliminado exitosamente', 'success');
      
      closeModal();
      
      fetchData();
      
    } catch (error) {
      console.error('Error al eliminar modificador:', error);
      let errorMessage = 'Error al eliminar el modificador';
      
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
      // Encontrar el modificador activo y su tipo
      const activeModificador = modificadores.find(m => m.id === active.id);
      const overModificador = modificadores.find(m => m.id === over.id);
      
      if (!activeModificador || !overModificador) return;
      
      // Solo permitir reordenamiento dentro del mismo tipo
      if (activeModificador.tipoModificador?.id !== overModificador.tipoModificador?.id) {
        showNotification('Solo puedes reordenar modificadores del mismo tipo', 'error');
        return;
      }

      // Encontrar todos los modificadores del mismo tipo
      const tipoId = activeModificador.tipoModificador.id;
      const modificadoresDelTipo = modificadores.filter(m => m.tipoModificador?.id === tipoId);
      const otrosModificadores = modificadores.filter(m => m.tipoModificador?.id !== tipoId);
      
      // Reordenar dentro del tipo
      const oldIndex = modificadoresDelTipo.findIndex((modificador) => modificador.id === active.id);
      const newIndex = modificadoresDelTipo.findIndex((modificador) => modificador.id === over.id);
      
      const reorderedModificadoresDelTipo = arrayMove(modificadoresDelTipo, oldIndex, newIndex);
      
      // Combinar con los otros modificadores
      const newModificadores = [...otrosModificadores, ...reorderedModificadoresDelTipo];
      setModificadores(newModificadores);

      // Actualizar el orden en el backend
      setLoadingReorder(true);
      try {
        const newOrder = reorderedModificadoresDelTipo.map((modificador, index) => ({
          id: modificador.id,
          posicion: index + 1
        }));
        
        await updateModificadorOrder(newOrder);
        showNotification(`Orden de modificadores "${activeModificador.tipoModificador.nombre}" actualizado correctamente`, 'success');
      } catch (error) {
        console.error('Error al actualizar orden en el servidor:', error);
        showNotification('Error al actualizar el orden en el servidor', 'error');
        // Revertir cambios locales en caso de error
        setModificadores(modificadores);
      } finally {
        setLoadingReorder(false);
      }
      
      // Log para desarrollo - mostrar el nuevo orden
      console.log(`Nuevo orden de modificadores tipo "${activeModificador.tipoModificador.nombre}":`, reorderedModificadoresDelTipo.map((modificador, index) => ({
        id: modificador.id,
        nombre: modificador.nombre,
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
              <h1 className="text-3xl font-light text-gray-900">Modificadores</h1>
            </div>
            <button 
              onClick={handleCreateModificador}
              className="bg-[#0E592F] text-white px-3 mr-1 py-3 rounded-lg hover:bg-[#0B4A27] transition-colors font-medium flex items-center"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tablas agrupadas por tipo de modificador */}
        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-6"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, rowIndex) => (
                    <div key={rowIndex} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {groupModificadoresByType().map((group) => (
              <ModificadoresTableByType
                key={group.tipo.id}
                tipo={group.tipo}
                modificadores={group.modificadores}
                onEdit={handleEditModificador}
                subcategorias={subcategorias}
                sensors={sensors}
                onDragEnd={handleDragEnd}
                loadingReorder={loadingReorder}
              />
            ))}
            
            {/* Mensaje si no hay modificadores */}
            {groupModificadoresByType().length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay modificadores</h3>
                <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer modificador.</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateModificador}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0E592F] hover:bg-[#0B4A27] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E592F]"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Modificador
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer con estadísticas */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {modificadores.length} modificador{modificadores.length !== 1 ? 'es' : ''} total
            </span>
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {groupModificadoresByType().length} tipo{groupModificadoresByType().length !== 1 ? 's' : ''} de modificador
            </span>
          </div>
        </div>
      </div>

      {/* Modal con formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Crear Nuevo Modificador' :
          modalMode === 'edit' ? 'Editar Modificador' :
          'Detalles del Modificador'
        }
      >
        {modalMode === 'create' || modalMode === 'edit' ? (
          <ModificadorForm
            modificador={selectedModificador}
            onSave={handleSaveModificador}
            onCancel={closeModal}
            onDelete={handleDeleteModificador}
            subcategorias={subcategorias}
            tiposModificador={tiposModificador}
          />
        ) : (
          /* Vista de solo lectura - puedes implementar esto más tarde */
          <div className="text-center py-8">
            <p className="text-gray-500">Vista de detalles del modificador (por implementar)</p>
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
