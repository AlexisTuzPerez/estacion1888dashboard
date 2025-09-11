'use client';
import { useEffect, useState } from 'react';
import { deleteCategoria, getCategorias, postCategoria, updateCategoria } from '../../actions/categoria';
import CategoriaForm from '../../components/CategoriaForm';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

export default function CategoriaPage() {
  const { checkTokenExpiry } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriasData = await getCategorias();
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      showNotification('Error al cargar las categorías', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCategoriaModal = (categoria, mode = 'view') => {
    setSelectedCategoria(categoria);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategoria(null);
    setModalMode('view');
  };

  const handleCreateCategoria = () => {
    openCategoriaModal(null, 'create');
  };

  const handleEditCategoria = (categoria) => {
    openCategoriaModal(categoria, 'edit');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSaveCategoria = async (categoriaData) => {
    try {
      if (modalMode === 'edit' && selectedCategoria?.id) {
        await updateCategoria(selectedCategoria.id, categoriaData);
        showNotification('Categoría actualizada exitosamente', 'success');
      } else {
        await postCategoria(categoriaData);
        showNotification('Categoría creada exitosamente', 'success');
      }
      
      closeModal();
      
      fetchData();
      
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      const errorMessage = error.message || 'Error al guardar la categoría';
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const handleDeleteCategoria = (categoriaId) => {
    const categoria = selectedCategoria;
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Categoría',
      message: `¿Estás seguro de que quieres eliminar la categoría "${categoria?.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => executeDeleteCategoria(categoriaId)
    });
  };

  const executeDeleteCategoria = async (categoriaId) => {
    try {
      const result = await deleteCategoria(categoriaId);
      showNotification('Categoría eliminada exitosamente', 'success');
      
      closeModal();
      
      fetchData();
      
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      let errorMessage = 'Error al eliminar la categoría';
      
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header minimalista */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Categorías</h1>
            </div>
            <button 
              onClick={handleCreateCategoria}
              className="bg-[#0E592F] text-white px-3 mr-1 py-3 rounded-lg hover:bg-[#0B4A27] transition-colors font-medium flex items-center"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabla minimalista */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-50">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  categorias.map((categoria, index) => (
                  <tr 
                    key={categoria.id} 
                    className={`hover:bg-green-50 transition-colors cursor-pointer ${
                      index !== categorias.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                    onClick={() => handleEditCategoria(categoria)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {categoria.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {categoria.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategoria(categoria);
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer minimalista */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {categorias.length} categorías
          </p>
        </div>
      </div>

      {/* Modal con formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Crear Nueva Categoría' :
          modalMode === 'edit' ? 'Editar Categoría' :
          'Detalles de la Categoría'
        }
      >
        {modalMode === 'create' || modalMode === 'edit' ? (
          <CategoriaForm
            categoria={selectedCategoria}
            onSave={handleSaveCategoria}
            onCancel={closeModal}
            onDelete={handleDeleteCategoria}
          />
        ) : (
          /* Vista de solo lectura - puedes implementar esto más tarde */
          <div className="text-center py-8">
            <p className="text-gray-500">Vista de detalles de la categoría (por implementar)</p>
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
