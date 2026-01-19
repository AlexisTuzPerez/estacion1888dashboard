'use client';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { deleteProducto, getProductosBySubcategoria, postProducto, updateProducto, updateProductoOrder } from '../../actions/productos';
import { getSubcategorias } from '../../actions/subcategorias';
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
  const [categoriesLoaded, setCategoriesLoaded] = useState(new Set());
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Estados para el modal de posición
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [selectedSubcategoriaModal, setSelectedSubcategoriaModal] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingModalProducts, setLoadingModalProducts] = useState(false);
  const [loadingReorderProducts, setLoadingReorderProducts] = useState(false);

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  const fetchSubcategorias = async () => {
    try {
      setLoading(true);
      const subcategorias = await getSubcategorias();
      setSubcategorias(subcategorias);

      // Inicializar todas las subcategorías como cargando
      const initialLoadingSet = new Set(subcategorias.map(cat => cat.id));
      setLoadingCategories(initialLoadingSet);
      setCategoriesLoaded(new Set());

      // Cargar productos de todas las subcategorías de forma asíncrona e independiente
      subcategorias.forEach(async (subcategoria) => {
        try {
          const productos = await getProductosBySubcategoria(subcategoria.id);

          // Actualizar productos para esta subcategoría específica
          setProductosPorSubcategoria(prev => ({
            ...prev,
            [subcategoria.id]: productos
          }));

          // Marcar esta subcategoría como cargada
          setCategoriesLoaded(prev => new Set([...prev, subcategoria.id]));

        } catch (error) {
          console.error(`Error al cargar productos de ${subcategoria.nombre}:`, error);

          // En caso de error, marcar como cargada con array vacío
          setProductosPorSubcategoria(prev => ({
            ...prev,
            [subcategoria.id]: []
          }));
          setCategoriesLoaded(prev => new Set([...prev, subcategoria.id]));
        } finally {
          // Quitar el skeleton de esta subcategoría específica
          setLoadingCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(subcategoria.id);
            return newSet;
          });
        }
      });

      // Ocultar el loading principal una vez que tenemos las subcategorías
      setLoading(false);

    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
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
    fetchSubcategorias();
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

        // Cerrar modal primero
        closeModal();

        // Actualizar solo la subcategoría específica en lugar de recargar todas
        const subcategoriaId = productData.subcategoriaId;
        console.log('Subcategoria ID del producto editado:', subcategoriaId);

        if (subcategoriaId) {
          // Activar skeleton para mostrar carga
          setLoadingCategories(prev => new Set([...prev, subcategoriaId]));

          // Pequeño delay para asegurar que el skeleton se muestre
          await new Promise(resolve => setTimeout(resolve, 150));

          const productos = await getProductosBySubcategoria(subcategoriaId);
          setProductosPorSubcategoria(prev => ({
            ...prev,
            [subcategoriaId]: productos
          }));

          // Desactivar skeleton
          setLoadingCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(subcategoriaId);
            return newSet;
          });
        } else {
          console.log('No se encontró subcategoriaId, recargando todas las subcategorías');
          fetchSubcategorias();
        }
      } else {
        await postProducto(productData);
        showNotification('Producto creado exitosamente', 'success');

        // Cerrar modal primero
        closeModal();

        // Actualizar solo la subcategoría específica en lugar de recargar todas
        const subcategoriaId = productData.subcategoriaId;


        if (subcategoriaId) {
          // Activar skeleton para mostrar carga
          setLoadingCategories(prev => new Set([...prev, subcategoriaId]));

          // Pequeño delay para asegurar que el skeleton se muestre
          await new Promise(resolve => setTimeout(resolve, 150));

          const productos = await getProductosBySubcategoria(subcategoriaId);
          setProductosPorSubcategoria(prev => ({
            ...prev,
            [subcategoriaId]: productos
          }));

          // Desactivar skeleton
          setLoadingCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(subcategoriaId);
            return newSet;
          });
        } else {
          console.log('No se encontró subcategoriaId, recargando todas las subcategorías');
          fetchSubcategorias();
        }
      }

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

      // Obtener subcategoriaId antes de cerrar el modal
      const subcategoriaId = selectedProduct?.subcategoriaId;
      console.log('Subcategoria ID del producto eliminado:', subcategoriaId);

      closeModal();

      // Actualizar solo la subcategoría específica en lugar de recargar todas
      if (subcategoriaId) {
        const productos = await getProductosBySubcategoria(subcategoriaId);
        setProductosPorSubcategoria(prev => ({
          ...prev,
          [subcategoriaId]: productos
        }));
      } else {
        // Si no tenemos subcategoriaId, recargar todas las subcategorías como fallback
        console.log('No se encontró subcategoriaId, recargando todas las subcategorías');
        fetchSubcategorias();
      }

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

  // Funciones para el modal de posición
  const openPositionModal = async (subcategoria) => {
    setSelectedSubcategoriaModal(subcategoria);
    setIsPositionModalOpen(true);
  };

  const closePositionModal = () => {
    setIsPositionModalOpen(false);
    setSelectedSubcategoriaModal(null);
    setCategoryProducts([]);
  };

  useEffect(() => {
    const fetchModalProducts = async () => {
      if (selectedSubcategoriaModal) {
        setLoadingModalProducts(true);
        try {
          const productos = await getProductosBySubcategoria(selectedSubcategoriaModal.id);
          setCategoryProducts(productos);
        } catch (error) {
          console.error('Error al cargar productos para reordenar:', error);
        } finally {
          setLoadingModalProducts(false);
        }
      }
    };

    fetchModalProducts();
  }, [selectedSubcategoriaModal]);

  const handleProductDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = categoryProducts.findIndex((product) => product.id === active.id);
      const newIndex = categoryProducts.findIndex((product) => product.id === over.id);

      const newProducts = arrayMove(categoryProducts, oldIndex, newIndex);
      setCategoryProducts(newProducts);

      // Actualizar el orden en el backend
      setLoadingReorderProducts(true);
      try {
        const newOrder = newProducts.map((product, index) => ({
          id: product.id,
          posicion: index + 1
        }));

        await updateProductoOrder(newOrder);

        // Mostrar notificación de éxito
        showNotification('Orden de productos actualizado correctamente', 'success');

        // Recargar la subcategoría específica después del éxito
        if (selectedSubcategoriaModal?.id) {
          // Activar skeleton para mostrar carga
          setLoadingCategories(prev => new Set([...prev, selectedSubcategoriaModal.id]));

          // Pequeño delay para asegurar que el skeleton se muestre
          await new Promise(resolve => setTimeout(resolve, 150));

          const productos = await getProductosBySubcategoria(selectedSubcategoriaModal.id);
          setProductosPorSubcategoria(prev => ({
            ...prev,
            [selectedSubcategoriaModal.id]: productos
          }));

          // Desactivar skeleton
          setLoadingCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedSubcategoriaModal.id);
            return newSet;
          });
        }

      } catch (error) {
        console.error('Error al actualizar el orden:', error);
        showNotification('Error al actualizar el orden de los productos', 'error');
        // Revertir cambios locales en caso de error
        setCategoryProducts(categoryProducts);
      } finally {
        setLoadingReorderProducts(false);
      }

      // Log para desarrollo - mostrar el nuevo orden
      console.log('Nuevo orden de productos:', newProducts.map((product, index) => ({
        id: product.id,
        nombre: product.nombre,
        posicion: index + 1
      })));
    }
  };

  // Componente SortableItem para productos
  const SortableItem = ({ product, loadingReorder }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: product.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <tr ref={setNodeRef} style={style} className="border-b border-gray-50 hover:bg-gray-50">
        <td className="px-6 py-4 text-center">
          <button
            {...attributes}
            {...listeners}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-grab active:cursor-grabbing"
            title="Arrastrar para reordenar"
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
        <td className="px-6 py-4">
          <div className="flex items-center">
            {product.imagenUrl ? (
              <div className="flex-shrink-0 h-10 w-10">
                <Image
                  className="h-10 w-10 rounded-lg object-cover"
                  src={product.imagenUrl}
                  alt={product.nombre}
                  width={40}
                  height={40}
                />
              </div>
            ) : (
              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image
                  src="/Logo.png"
                  alt="Logo"
                  width={20}
                  height={20}
                  className="opacity-40"
                />
              </div>
            )}
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
              <div className="text-sm text-gray-500">${product.precio}</div>
            </div>
          </div>
        </td>
      </tr>
    );
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

  const SubcategoriaSkeleton = () => (
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
              <SubcategoriaSkeleton key={i} />
            ))}
          </div>
        ) : (
          /* Productos por subcategoría con carga progresiva */
          <div className="space-y-8">
            {subcategorias.map((subcategoria) => (
              <div key={subcategoria.id} className="bg-white rounded-xl border border-gray-100 p-6">
                {/* Título de la subcategoría */}
                <div className="mb-4">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-medium text-gray-900">{subcategoria.nombre}</h2>
                    <button
                      onClick={() => openPositionModal(subcategoria)}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex items-center space-x-1"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span>Posición</span>
                    </button>
                  </div>
                </div>

                {/* Productos con scroll horizontal */}
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-4 pb-4">
                    {loadingCategories.has(subcategoria.id) ? (
                      [...Array(4)].map((_, i) => (
                        <ProductSkeleton key={i} />
                      ))
                    ) : categoriesLoaded.has(subcategoria.id) && productosPorSubcategoria[subcategoria.id]?.length > 0 ? (
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
                    ) : categoriesLoaded.has(subcategoria.id) ? (
                      <div className="flex-none w-full text-center py-8">
                        <p className="text-gray-500">No hay productos en esta subcategoría</p>
                      </div>
                    ) : (
                      // Mostrar skeleton mientras no se ha cargado
                      [...Array(4)].map((_, i) => (
                        <ProductSkeleton key={i} />
                      ))
                    )}
                  </div>
                </div>

                {/* Contador de productos */}
                <div className="mt-3 text-right">
                  <span className="text-sm text-gray-500">
                    {loadingCategories.has(subcategoria.id) ? (
                      <span className="animate-pulse">Cargando...</span>
                    ) : (
                      `${productosPorSubcategoria[subcategoria.id]?.length || 0} productos`
                    )}
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

      {/* Modal de posición de productos */}
      <Modal
        isOpen={isPositionModalOpen}
        onClose={closePositionModal}
        title={`Posición de productos - ${selectedSubcategoriaModal?.nombre || ''}`}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Arrastra los productos para reordenarlos
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Usa el ícono de tres líneas para arrastrar y soltar los productos en el orden deseado.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100">
            <div className="overflow-x-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleProductDragEnd}
              >
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-600 w-16">
                        Posición
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                        Producto
                      </th>
                    </tr>
                  </thead>
                  <SortableContext items={categoryProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <tbody>
                      {loadingModalProducts ? (
                        [...Array(5)].map((_, index) => (
                          <tr key={index} className="border-b border-gray-50">
                            <td className="px-6 py-4 text-center">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-5"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        categoryProducts.map((product, index) => (
                          <SortableItem key={product.id} product={product} loadingReorder={loadingReorderProducts} />
                        ))
                      )}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            </div>
          </div>

          {!loadingModalProducts && categoryProducts.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
              <p className="mt-1 text-sm text-gray-500">Esta subcategoría no tiene productos para reordenar.</p>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
