'use client';
import { useEffect, useState } from 'react';
import { deleteTamano, getTamanos, postTamano, updateTamano } from '../../actions/tamanos';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import TamanoForm from '../../components/TamanoForm';
import { useAuth } from '../../contexts/AuthContext';

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

  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);


  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Descripción
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
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  tamanos.map((tamano, index) => (
                  <tr 
                    key={tamano.id} 
                    className={`hover:bg-green-50 transition-colors cursor-pointer ${
                      index !== tamanos.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                    onClick={() => handleEditTamano(tamano)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tamano.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {tamano.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {tamano.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTamano(tamano);
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
