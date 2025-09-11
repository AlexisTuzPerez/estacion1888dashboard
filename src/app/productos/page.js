'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getCategorias } from '../../actions/categoria';
import { deleteProducto, getProductosBySubcategoria, postProducto, updateProducto } from '../../actions/productos';
import { getTamanos } from '../../actions/tamanos';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import ProductForm from '../../components/ProductForm';
import { useAuth } from '../../contexts/AuthContext';

export default function ProductosPage() {
  const { checkTokenExpiry } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [subcategorias, setSubcategorias] = useState([]);
  const [productosPorSubcategoria, setProductosPorSubcategoria] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(new Set());
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });
  
  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const categorias = await getCategorias();
      setSubcategorias(categorias);
      setLoading(false); // Mostrar categorías inmediatamente
      
      categorias.forEach(async (categoria, index) => {
        setTimeout(async () => {
          setLoadingCategories(prev => new Set([...prev, categoria.id]));
          
          try {
            const productos = await getProductosBySubcategoria(categoria.id);
            setProductosPorSubcategoria(prev => ({
              ...prev,
              [categoria.id]: productos
            }));
          } catch (error) {
            console.error(`Error al cargar productos de ${categoria.nombre}:`, error);
          } finally {
            setLoadingCategories(prev => {
              const newSet = new Set(prev);
              newSet.delete(categoria.id);
              return newSet;
            });
          }
        }, index * 200); // 200ms entre cada categoría
      });
      
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setLoading(false);
    }
  };

  const fetchTamanos = async () => {
    try {
      const tamanosData = await getTamanos();
      setTamanos(tamanosData);
    } catch (error) {
      console.error('Error al cargar tamaños:', error);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchTamanos();
  }, []);


  const [tamanos, setTamanos] = useState([]);


  const openProductModal = (product, mode = 'view') => {
    setSelectedProduct(product);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setModalMode('view');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleCreateProduct = () => {
    openProductModal(null, 'create');
  };

  const handleEditProduct = (product) => {
    openProductModal(product, 'edit');
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (modalMode === 'edit' && selectedProduct?.id) {
        await updateProducto(selectedProduct.id, productData);
        showNotification('Producto actualizado exitosamente', 'success');
      } else {
        await postProducto(productData);
        showNotification('Producto creado exitosamente', 'success');
      }
      
      closeModal();
      
      fetchCategorias();
      
    } catch (error) {
      console.error('Error al guardar producto:', error);
      const errorMessage = error.message || 'Error al guardar el producto';
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const handleDeleteProduct = (productId) => {
    const product = selectedProduct;
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Producto',
      message: `¿Estás seguro de que quieres eliminar el producto "${product?.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => executeDeleteProduct(productId)
    });
  };

  const executeDeleteProduct = async (productId) => {
    try {
      const result = await deleteProducto(productId);
      showNotification('Producto eliminado exitosamente', 'success');
      
      closeModal();
      
      fetchCategorias();
      
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      let errorMessage = 'Error al eliminar el producto';
      
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

  const ProductSkeleton = () => (
    <div className="flex-none w-48">
      <div className="overflow-hidden rounded-2xl bg-white border border-gray-100">
        <div className="h-40 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
        <div className="p-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-5 w-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const CategorySkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="mb-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
        <div className="h-0.5 w-12 bg-gray-200 animate-pulse"></div>
      </div>
      <div className="flex space-x-4 pb-4">
        {[...Array(4)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header minimalista */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Productos</h1>
            </div>
            <button 
              onClick={handleCreateProduct}
              className="bg-[#0E592F] text-white px-3 py-3 rounded-lg hover:bg-[#0B4A27] transition-colors font-medium flex items-center"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Estado de carga inicial */}
        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : (
          /* Productos por subcategoría con carga progresiva */
          <div className="space-y-8">
            {subcategorias.map((subcategoria) => (
            <div key={subcategoria.id} className="bg-white rounded-xl border border-gray-100 p-6">
              {/* Título de la subcategoría */}
              <div className="mb-4">
                <h2 className="text-xl font-medium text-gray-900">{subcategoria.nombre}</h2>
                <div className="mt-2 h-0.5 w-12 bg-[#0E592F]"></div>
              </div>

              {/* Productos con scroll horizontal */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 pb-4">
                  {loadingCategories.has(subcategoria.id) ? (
                    [...Array(4)].map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))
                  ) : productosPorSubcategoria[subcategoria.id]?.length > 0 ? (
                    productosPorSubcategoria[subcategoria.id].map((product) => (
                      <div key={product.id} className="flex-none w-48">
                        <div 
                          className="overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleEditProduct(product)}
                        >
                          {/* Imagen del producto */}
                          <div className="h-40 w-full relative">
                            {product.imagenUrl ? (
                              <div className={`h-40 w-full relative ${!product.activo ? 'grayscale' : ''}`}>
                                <Image
                                  src={product.imagenUrl}
                                  alt={product.nombre}
                                  fill
                                  className="object-cover"
                                  loading="lazy"
                                  placeholder="blur"
                                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                />
                                {!product.activo && (
                                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                                      INACTIVO
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`h-40 w-full p-14 flex items-center justify-center bg-gray-50 ${!product.activo ? 'opacity-50' : ''}`}>
                                <Image
                                  src="/Logo.png"
                                  alt="Logo"
                                  width={80}
                                  height={80}
                                  className=" opacity-40"
                                  style={{ height: "auto", width: "auto" }}
                                  priority
                                />
                                {!product.activo && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs font-medium bg-white bg-opacity-80 px-2 py-1 rounded">
                                      INACTIVO
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Información del producto */}
                          <div className="p-3">
                            <h3 className={`mb-1 text-base font-semibold line-clamp-2 ${!product.activo ? 'text-gray-500' : 'text-black'}`}>
                              {product.nombre}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className={`text-lg font-bold ${!product.activo ? 'text-gray-400' : 'text-gray-700'}`}>
                                ${product.precio}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProduct(product);
                                }}
                                className="ml-2 p-1 text-gray-400 hover:text-[#0E592F] transition-colors"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-none w-full text-center py-8">
                      <p className="text-gray-500">No hay productos en esta categoría</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contador de productos */}
              <div className="mt-3 text-right">
                <span className="text-sm text-gray-500">
                  {productosPorSubcategoria[subcategoria.id]?.length || 0} productos
                </span>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Modal con formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Crear Nuevo Producto' :
          modalMode === 'edit' ? 'Editar Producto' :
          'Detalles del Producto'
        }
      >
        {modalMode === 'create' || modalMode === 'edit' ? (
          <ProductForm
            product={selectedProduct}
            onSave={handleSaveProduct}
            onCancel={closeModal}
            onDelete={handleDeleteProduct}
            subcategorias={subcategorias}
            tamanos={tamanos}
          />
        ) : (
          /* Vista de solo lectura - puedes implementar esto más tarde */
          <div className="text-center py-8">
            <p className="text-gray-500">Vista de detalles del producto (por implementar)</p>
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
