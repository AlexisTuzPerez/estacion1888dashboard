'use client';
import { useEffect, useState } from 'react';

export default function ModificadorForm({ modificador = null, onSave, onCancel, onDelete, subcategorias = [] }) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    subcategoriasIds: [],
    sucursales: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (modificador) {
      setFormData({
        nombre: modificador.nombre || '',
        precio: modificador.precio || '',
        subcategoriasIds: modificador.subcategorias ? modificador.subcategorias.map(sub => sub.id) : [],
        sucursales: modificador.sucursales || []
      });
    }
  }, [modificador]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const processedValue = name === 'nombre' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubcategoriaChange = (subcategoriaId) => {
    setFormData(prev => ({
      ...prev,
      subcategoriasIds: prev.subcategoriasIds.includes(subcategoriaId)
        ? prev.subcategoriasIds.filter(id => id !== subcategoriaId)
        : [...prev.subcategoriasIds, subcategoriaId]
    }));

    if (errors.subcategoriasIds) {
      setErrors(prev => ({
        ...prev,
        subcategoriasIds: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del modificador es requerido';
    }

    if (formData.precio === '' || formData.precio < 0) {
      newErrors.precio = 'El precio debe ser mayor o igual a 0';
    }

    if (formData.subcategoriasIds.length === 0) {
      newErrors.subcategoriasIds = 'Debe seleccionar al menos una subcategoría';
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
      const modificadorData = {
        nombre: formData.nombre,
        subcategoriasIds: formData.subcategoriasIds,
        precio: parseFloat(formData.precio)
      };

      await onSave(modificadorData);
    } catch (error) {
      console.error('Error al guardar modificador:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del modificador */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Modificador *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent uppercase ${
            errors.nombre ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="EXTRA QUESO, SIN CEBOLLA, etc."
          style={{ textTransform: 'uppercase' }}
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
        )}
      </div>

      {/* Precio */}
      <div>
        <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
          Precio *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent ${
              errors.precio ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.precio && (
          <p className="mt-1 text-sm text-red-600">{errors.precio}</p>
        )}
      </div>

      {/* Gestión de Subcategorías */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Subcategorías Disponibles *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {subcategorias.map((subcategoria) => {
            const isActive = formData.subcategoriasIds.includes(subcategoria.id);
            
            return (
              <div 
                key={subcategoria.id} 
                className={`relative border rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'border-[#0E592F] bg-white shadow-sm' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleSubcategoriaChange(subcategoria.id)}
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => {
                        e.stopPropagation(); // Evitar doble activación
                        handleSubcategoriaChange(subcategoria.id);
                      }}
                      className="h-4 w-4 text-[#0E592F] focus:ring-[#0E592F] border-gray-300 rounded"
                    />
                    <div>
                      <span className={`font-medium transition-colors ${
                        isActive ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {subcategoria.nombre}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.subcategoriasIds && (
          <p className="mt-1 text-sm text-red-600">{errors.subcategoriasIds}</p>
        )}
      </div>


      {/* Botones de acción */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        {/* Botón de eliminar (solo en modo edición) */}
        {modificador && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(modificador.id)}
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
            {isSubmitting ? 'Guardando...' : (modificador ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </div>
    </form>
  );
}
