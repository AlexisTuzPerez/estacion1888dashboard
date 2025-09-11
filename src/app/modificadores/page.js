'use client';
import { useEffect, useState } from 'react';
import { getCategorias } from '../../actions/categoria';
import { deleteModificador, getModificadores, postModificador, updateModificador } from '../../actions/modificadores';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import ModificadorForm from '../../components/ModificadorForm';
import { useAuth } from '../../contexts/AuthContext';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modificadoresData, subcategoriasData] = await Promise.all([
        getModificadores(),
        getCategorias()
      ]);
      setModificadores(modificadoresData);
      setSubcategorias(subcategoriasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Subcategoría
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
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  modificadores.map((modificador, index) => (
                  <tr 
                    key={modificador.id} 
                    className={`hover:bg-green-50 transition-colors cursor-pointer ${
                      index !== modificadores.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                    onClick={() => handleEditModificador(modificador)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {modificador.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {modificador.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${
                        modificador.precio === 0 
                          ? 'text-[#16A34A]' 
                          : 'text-gray-900'
                      }`}>
                        ${modificador.precio.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {modificador.subcategorias && modificador.subcategorias.length > 0 ? (
                          modificador.subcategorias.map((subcategoria) => (
                            <span 
                              key={subcategoria.id}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-[#0E592F]"
                            >
                              {subcategoria.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                            Sin subcategorías
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditModificador(modificador);
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
            {modificadores.length} modificadores
          </p>
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
