'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getProductoById } from '../actions/productos';

export default function ProductForm({ product = null, onSave, onCancel, onDelete, subcategorias = [], tamanos = [] }) {
  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
    imagenUrl: '',
    precio: '',
    subcategoriaId: '',
    sucursales: [],
    tamaños: [] // Array de { tamanoId, precio }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const loadProductData = async () => {
      if (product && product.id) {
        setIsLoading(true);
        try {
          const productoCompleto = await getProductoById(product.id);
          
          const tamañosTransformados = productoCompleto.tamaños?.map(tamano => ({
            tamanoId: tamano.id,
            precio: tamano.precio
          })) || [];


          setFormData({
            nombre: productoCompleto.nombre || '',
            activo: productoCompleto.activo !== undefined ? productoCompleto.activo : true,
            imagenUrl: productoCompleto.imagenUrl || '',
            precio: productoCompleto.precio || '',
            subcategoriaId: productoCompleto.subcategoriaId || '',
            sucursales: productoCompleto.sucursales || [],
            tamaños: tamañosTransformados
          });
        } catch (error) {
          console.error('Error al cargar datos del producto:', error);
          const tamañosFallback = product.tamaños?.map(tamano => ({
            tamanoId: tamano.id,
            precio: tamano.precio
          })) || [];

          setFormData({
            nombre: product.nombre || '',
            activo: product.activo !== undefined ? product.activo : true,
            imagenUrl: product.imagenUrl || '',
            precio: product.precio || '',
            subcategoriaId: product.subcategoriaId || '',
            sucursales: product.sucursales || [],
            tamaños: tamañosFallback
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProductData();
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calcularMenorPrecio = (tamaños) => {
    const preciosVálidos = tamaños
      .filter(t => t.precio > 0)
      .map(t => t.precio);
    
    return preciosVálidos.length > 0 ? Math.min(...preciosVálidos) : null;
  };

  const handleTamanoChange = (tamanoId, precio) => {
    setFormData(prev => {
      const existingIndex = prev.tamaños.findIndex(t => t.tamanoId === tamanoId);
      let newTamaños;
      
      if (existingIndex >= 0) {
        newTamaños = [...prev.tamaños];
        newTamaños[existingIndex] = { tamanoId, precio: parseFloat(precio) || 0 };
      } else {
        newTamaños = [...prev.tamaños, { tamanoId, precio: parseFloat(precio) || 0 }];
      }

      const menorPrecio = calcularMenorPrecio(newTamaños);
      const cantidadTamaños = newTamaños.filter(t => t.precio > 0).length;
      
      return {
        ...prev,
        tamaños: newTamaños,
        precio: (cantidadTamaños > 1 && menorPrecio) ? menorPrecio : prev.precio // Solo auto-calcular si hay múltiples tamaños
      };
    });
  };

  const removeTamano = (tamanoId) => {
    setFormData(prev => {
      const newTamaños = prev.tamaños.filter(t => t.tamanoId !== tamanoId);
      const menorPrecio = calcularMenorPrecio(newTamaños);
      const cantidadTamaños = newTamaños.filter(t => t.precio > 0).length;
      
      return {
        ...prev,
        tamaños: newTamaños,
        precio: (cantidadTamaños > 1 && menorPrecio) ? menorPrecio : prev.precio // Solo auto-calcular si hay múltiples tamaños
      };
    });
  };

  const getTamanoPrecio = (tamanoId) => {
    const tamano = formData.tamaños.find(t => t.tamanoId === tamanoId);
    return tamano ? tamano.precio : '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es requerido';
    }

    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    if (!formData.subcategoriaId) {
      newErrors.subcategoriaId = 'Debe seleccionar una subcategoría';
    }

    if (formData.imagenUrl && !isValidUrl(formData.imagenUrl)) {
      newErrors.imagenUrl = 'La URL de la imagen no es válida';
    }

    const preciosTamaños = formData.tamaños
      .filter(t => t.precio > 0)
      .map(t => t.precio);
    
    if (preciosTamaños.length > 1) {
      const menorPrecio = Math.min(...preciosTamaños);
      if (parseFloat(formData.precio) !== menorPrecio) {
        newErrors.precio = `El precio del producto debe ser igual al menor precio de los tamaños ($${menorPrecio})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const productData = {
        nombre: formData.nombre,
        activo: formData.activo,
        precio: parseFloat(formData.precio),
        imagenUrl: formData.imagenUrl,
        subcategoriaId: parseInt(formData.subcategoriaId),
        tamaños: formData.tamaños.filter(t => t.precio > 0) // Solo incluir tamaños con precio > 0
      };

      await onSave(productData);
    } catch (error) {
      console.error('Error al guardar producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton para nombre del producto */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>

      {/* Skeleton para precio */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>

      {/* Skeleton para subcategoría */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>

      {/* Skeleton para URL de imagen */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
        <div className="mt-3">
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton para tamaños */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-36 mb-4"></div>
        <div className="grid grid-cols-1 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-4 bg-gray-200 rounded w-4"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton para checkbox activo */}
      <div className="flex items-center">
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
        <div className="ml-2 h-4 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Skeleton para botones */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del producto */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Producto *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent ${
            errors.nombre ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ingrese el nombre del producto"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
        )}
      </div>

      {/* Precio */}
      <div>
        <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
          Precio *
          {formData.tamaños.filter(t => t.precio > 0).length > 1 && (
            <span className="text-xs text-gray-500 ml-2">(calculado automáticamente)</span>
          )}
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
            readOnly={formData.tamaños.filter(t => t.precio > 0).length > 1}
            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent ${
              errors.precio ? 'border-red-500' : 'border-gray-300'
            } ${formData.tamaños.filter(t => t.precio > 0).length > 1 ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="0.00"
          />
        </div>
        {errors.precio && (
          <p className="mt-1 text-sm text-red-600">{errors.precio}</p>
        )}
        {formData.tamaños.filter(t => t.precio > 0).length > 1 && (
          <p className="mt-1 text-xs text-gray-500">
            El precio se calcula automáticamente basado en el menor precio de los tamaños seleccionados
          </p>
        )}
        {formData.tamaños.filter(t => t.precio > 0).length === 1 && (
          <p className="mt-1 text-xs text-gray-500">
            Puedes editar el precio del producto directamente
          </p>
        )}
      </div>

      {/* Subcategoría */}
      <div>
        <label htmlFor="subcategoriaId" className="block text-sm font-medium text-gray-700 mb-2">
          Subcategoría *
        </label>
        <select
          id="subcategoriaId"
          name="subcategoriaId"
          value={formData.subcategoriaId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent ${
            errors.subcategoriaId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Seleccione una subcategoría</option>
          {subcategorias.map((subcategoria) => (
            <option key={subcategoria.id} value={subcategoria.id}>
              {subcategoria.nombre}
            </option>
          ))}
        </select>
        {errors.subcategoriaId && (
          <p className="mt-1 text-sm text-red-600">{errors.subcategoriaId}</p>
        )}
      </div>

      {/* URL de imagen */}
      <div>
        <label htmlFor="imagenUrl" className="block text-sm font-medium text-gray-700 mb-2">
          URL de Imagen
        </label>
        <input
          type="url"
          id="imagenUrl"
          name="imagenUrl"
          value={formData.imagenUrl}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent ${
            errors.imagenUrl ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        {errors.imagenUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.imagenUrl}</p>
        )}
        
        {/* Vista previa de la imagen */}
        {formData.imagenUrl && !errors.imagenUrl && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
            <div className="w-32 h-32 relative border border-gray-200 rounded-lg overflow-hidden">
              <Image
                src={formData.imagenUrl}
                alt="Vista previa"
                fill
                className="object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Gestión de Tamaños */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Tamaños Disponibles
        </label>
        <div className="grid grid-cols-1 gap-3">
          {tamanos.map((tamano) => {
            const precio = getTamanoPrecio(tamano.id);
            const isActive = precio !== '';
            
            return (
              <div 
                key={tamano.id} 
                className={`relative border rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'border-[#0E592F] bg-white shadow-sm' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  if (isActive) {
                    removeTamano(tamano.id);
                  } else {
                    handleTamanoChange(tamano.id, 0);
                  }
                }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => {
                          e.stopPropagation(); // Evitar doble activación
                          if (e.target.checked) {
                            handleTamanoChange(tamano.id, 0);
                          } else {
                            removeTamano(tamano.id);
                          }
                        }}
                        className="h-4 w-4 text-[#0E592F] focus:ring-[#0E592F] border-gray-300 rounded"
                      />
                      <div>
                        <span className={`font-medium transition-colors ${
                          isActive ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {tamano.nombre}
                        </span>
                        {tamano.descripcion && (
                          <p className="text-xs text-gray-500 mt-0.5">{tamano.descripcion}</p>
                        )}
                      </div>
                    </div>
                    
                    {isActive && (
                      <div 
                        className="flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()} // Evitar activación al hacer clic en el precio
                      >
                        <span className="text-sm text-gray-500">$</span>
                        <input
                          type="number"
                          value={precio == '' ? '' : precio}
                          onChange={(e) => handleTamanoChange(tamano.id, e.target.value)}
                          step="0.01"
                          min="0"
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E592F] focus:border-transparent transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estado activo */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="activo"
          name="activo"
          checked={formData.activo}
          onChange={handleInputChange}
          className="h-4 w-4 text-[#0E592F] focus:ring-[#0E592F] border-gray-300 rounded"
        />
        <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
          Producto activo
        </label>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        {/* Botón de eliminar (solo en modo edición) */}
        {product && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar</span>
          </button>
        )}
        
        {/* Botones de cancelar y guardar */}
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
            {isSubmitting ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </div>
    </form>
  );
}
