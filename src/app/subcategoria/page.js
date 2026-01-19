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
import { getCategorias } from '../../actions/categorias';
import { deleteSubcategoria, getSubcategorias, postSubcategoria, updateSubcategoria, updateSubcategoriaOrder } from '../../actions/subcategorias';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import SubcategoriaForm from '../../components/SubcategoriaForm';
import { useAuth } from '../../contexts/AuthContext';

// Componente para las filas sortables de la tabla
function SortableItem({ subcategoria, index, onEdit, totalItems, categorias, loadingReorder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subcategoria.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoria = categorias.find(cat => cat.id === subcategoria.categoriaId);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-green-50 transition-colors cursor-pointer ${index !== totalItems - 1 ? 'border-b border-gray-50' : ''
        } ${isDragging ? 'z-50' : ''}`}
      onClick={() => onEdit(subcategoria)}
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
        {subcategoria.id}
      </td>
      {/* Nombre */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {subcategoria.nombre}
        </div>
      </td>
      {/* Categoría */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {categoria ? (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-[#0E592F]">
              {categoria.nombre}
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
              Sin categoría
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
              onEdit(subcategoria);
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

export default function SubcategoriaPage() {
  const { checkTokenExpiry } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
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
      const [subcategoriasData, categoriasData] = await Promise.all([
        getSubcategorias(),
        getCategorias()
      ]);
      setSubcategorias(subcategoriasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openSubcategoriaModal = (subcategoria, mode = 'view') => {
    setSelectedSubcategoria(subcategoria);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubcategoria(null);
    setModalMode('view');
  };

  const handleCreateSubcategoria = () => {
    openSubcategoriaModal(null, 'create');
  };

  const handleEditSubcategoria = (subcategoria) => {
    openSubcategoriaModal(subcategoria, 'edit');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSaveSubcategoria = async (subcategoriaData) => {
    try {
      if (modalMode === 'edit' && selectedSubcategoria?.id) {
        await updateSubcategoria(selectedSubcategoria.id, subcategoriaData);
        showNotification('Subcategoría actualizada exitosamente', 'success');
      } else {
        await postSubcategoria(subcategoriaData);
        showNotification('Subcategoría creada exitosamente', 'success');
      }

      closeModal();

      fetchData();

    } catch (error) {
      console.error('Error al guardar subcategoría:', error);
      const errorMessage = error.message || 'Error al guardar la subcategoría';
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const handleDeleteSubcategoria = (subcategoriaId) => {
    const subcategoria = selectedSubcategoria;
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Subcategoría',
      message: `¿Estás seguro de que quieres eliminar la subcategoría "${subcategoria?.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => executeDeleteSubcategoria(subcategoriaId)
    });
  };

  const executeDeleteSubcategoria = async (subcategoriaId) => {
    try {
      const result = await deleteSubcategoria(subcategoriaId);
      showNotification('Subcategoría eliminada exitosamente', 'success');

      closeModal();

      fetchData();

    } catch (error) {
      console.error('Error al eliminar subcategoría:', error);
      let errorMessage = 'Error al eliminar la subcategoría';

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
      const oldIndex = subcategorias.findIndex((subcategoria) => subcategoria.id === active.id);
      const newIndex = subcategorias.findIndex((subcategoria) => subcategoria.id === over.id);

      const newSubcategorias = arrayMove(subcategorias, oldIndex, newIndex);
      setSubcategorias(newSubcategorias);

      // Actualizar el orden en el backend
      setLoadingReorder(true);
      try {
        const newOrder = newSubcategorias.map((subcategoria, index) => ({
          id: subcategoria.id,
          posicion: index + 1
        }));

        await updateSubcategoriaOrder(newOrder);
        showNotification('Orden de subcategorías actualizado correctamente', 'success');
      } catch (error) {
        console.error('Error al actualizar orden en el servidor:', error);
        showNotification('Error al actualizar el orden en el servidor', 'error');
        // Revertir cambios locales en caso de error
        setSubcategorias(subcategorias);
      } finally {
        setLoadingReorder(false);
      }

      // Log para desarrollo - mostrar el nuevo orden
      console.log('Nuevo orden de subcategorías:', newSubcategorias.map((subcategoria, index) => ({
        id: subcategoria.id,
        nombre: subcategoria.nombre,
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
              <h1 className="text-3xl font-light text-gray-900">Subcategorías</h1>
              <p className="text-gray-500 mt-2 text-sm">Gestiona los grupos secundarios y vincúlalos a categorías de alto nivel</p>
            </div>
            <button
              onClick={handleCreateSubcategoria}
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
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={subcategorias.map(subcategoria => subcategoria.id)}
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
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      subcategorias.map((subcategoria, index) => (
                        <SortableItem
                          key={subcategoria.id}
                          subcategoria={subcategoria}
                          index={index}
                          onEdit={handleEditSubcategoria}
                          totalItems={subcategorias.length}
                          categorias={categorias}
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
            {subcategorias.length} subcategorías
          </p>
        </div>
      </div>

      {/* Modal con formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Crear Nueva Subcategoría' :
            modalMode === 'edit' ? 'Editar Subcategoría' :
              'Detalles de la Subcategoría'
        }
      >
        {modalMode === 'create' || modalMode === 'edit' ? (
          <SubcategoriaForm
            subcategoria={selectedSubcategoria}
            onSave={handleSaveSubcategoria}
            onCancel={closeModal}
            onDelete={handleDeleteSubcategoria}
            categorias={categorias}
          />
        ) : (
          /* Vista de solo lectura - puedes implementar esto más tarde */
          <div className="text-center py-8">
            <p className="text-gray-500">Vista de detalles de la subcategoría (por implementar)</p>
          </div>
        )}
      </Modal>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${notification.type === 'success'
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
