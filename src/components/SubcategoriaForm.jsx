'use client';
import { useEffect, useState } from 'react';

export default function SubcategoriaForm({ subcategoria = null, onSave, onCancel, onDelete, categorias = [] }) {
  const [formData, setFormData] = useState({
    nombre: '',
    categoriaId: '',
    sucursales: [],
    productos: [],
    modificadores: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subcategoria) {
      setFormData({
        nombre: subcategoria.nombre || '',
        categoriaId: subcategoria.categoriaId || '',
        sucursales: subcategoria.sucursales || [],
        productos: subcategoria.productos || [],
        modificadores: subcategoria.modificadores || []
      });
    }
  }, [subcategoria]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la subcategoría es requerido';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Debe seleccionar una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const subcategoriaData = {
        nombre: formData.nombre,
        categoria: {
          id: parseInt(formData.categoriaId)
        }
      };

      await onSave(subcategoriaData);
    } catch (error) {
      console.error('Error al guardar subcategoría:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre de la subcategoría */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la Subcategoría *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent ${errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="BEBIDAS, HAMBURGUESAS, PIZZAS, etc."
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
        )}
      </div>

      {/* Categoría de Alto Nivel */}
      <div>
        <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-2">
          Categoría *
        </label>
        <select
          id="categoriaId"
          name="categoriaId"
          value={formData.categoriaId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent ${errors.categoriaId ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option value="">Seleccione una Categoria</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        {errors.categoriaId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoriaId}</p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        {/* Botón de eliminar (solo en modo edición) */}
        {subcategoria && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(subcategoria.id)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar</span>
          </button>
        )}

        {/* Botones de la derecha */}
        <div className="flex space-x-3 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E592F] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0E592F] border border-transparent rounded-lg hover:bg-[#0B4A27] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E592F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Guardando...' : (subcategoria ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </div>
    </form>
  );
}
