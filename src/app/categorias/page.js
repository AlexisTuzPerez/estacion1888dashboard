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
import { deleteCategoria, getCategorias, postCategoria, updateCategoria, updateCategoriaOrder } from '../../actions/categorias';
import CategoriaForm from '../../components/CategoriaForm';
import ConfirmationModal from '../../components/ConfirmationModal';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

// Componente para las filas sortables de la tabla
function SortableItem({ categoria, index, onEdit, totalItems, loadingReorder }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: categoria.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`hover:bg-green-50 transition-colors cursor-pointer ${index !== totalItems - 1 ? 'border-b border-gray-50' : ''
                } ${isDragging ? 'z-50' : ''}`}
            onClick={() => onEdit(categoria)}
        >
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
            <td className="px-6 py-4 text-sm text-gray-500">
                {categoria.id}
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                    {categoria.nombre}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(categoria);
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
    const [loadingReorder, setLoadingReorder] = useState(false);

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
            const categoriasData = await getCategorias();
            setCategorias(categoriasData);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            showNotification('Error al cargar las categorías', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            await deleteCategoria(categoriaId);
            showNotification('Categoría eliminada exitosamente', 'success');
            closeModal();
            fetchData();
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            let errorMessage = 'Error al eliminar la categoría';
            showNotification(errorMessage, 'error');
        }
    };

    const closeConfirmationModal = () => {
        setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = categorias.findIndex((c) => c.id === active.id);
            const newIndex = categorias.findIndex((c) => c.id === over.id);

            const newCategorias = arrayMove(categorias, oldIndex, newIndex);
            setCategorias(newCategorias);

            setLoadingReorder(true);
            try {
                const newOrder = newCategorias.map((c, index) => ({
                    id: c.id,
                    posicion: index + 1
                }));

                await updateCategoriaOrder(newOrder);
                showNotification('Orden de categorías actualizado correctamente', 'success');
            } catch (error) {
                console.error('Error al actualizar orden en el servidor:', error);
                showNotification('Error al actualizar el orden en el servidor', 'error');
                setCategorias(categorias);
            } finally {
                setLoadingReorder(false);
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto mt-8 px-4">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900">Categorías</h1>
                            <p className="text-gray-500 mt-2 text-sm">Gestiona los grupos principales de tu menú (ej: Bebidas, Alimentos)</p>
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
                                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <SortableContext
                                    items={categorias.map(c => c.id)}
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
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5"></div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            categorias.map((categoria, index) => (
                                                <SortableItem
                                                    key={categoria.id}
                                                    categoria={categoria}
                                                    index={index}
                                                    onEdit={handleEditCategoria}
                                                    totalItems={categorias.length}
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

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        {categorias.length} categorías
                    </p>
                </div>
            </div>

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
                    <div className="text-center py-8">
                        <p className="text-gray-500">Vista de detalles de la categoría (por implementar)</p>
                    </div>
                )}
            </Modal>

            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${notification.type === 'success'
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
