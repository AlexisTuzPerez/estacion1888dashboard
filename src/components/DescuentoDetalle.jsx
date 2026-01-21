'use client';
import { useState } from 'react';

export default function DescuentoDetalle({ descuento, onToggleStatus, onCancel }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleToggle = async () => {
        setIsSubmitting(true);
        try {
            await onToggleStatus(descuento.id, !descuento.activo);
        } catch (error) {
            console.error('Error al cambiar el estado del descuento:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!descuento) return null;

    return (
        <div className="space-y-6">


            {/* Estado */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Actual
                </label>
                <div className="py-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${descuento.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {descuento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>
            {/* ID del Descuento
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Descuento
                </label>
                <input
                    type="text"
                    value={descuento.id}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
            </div> */}

            {/* Nombre del Descuento */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Descuento
                </label>
                <input
                    type="text"
                    value={descuento.nombre}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-medium"
                />
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                </label>
                <textarea
                    value={descuento.descripcion || 'Sin descripción'}
                    readOnly
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed resize-none leading-relaxed"
                />
            </div>

            {/* Monto / Valor (si existe) */}
            {descuento.monto && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto / Valor
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                            type="text"
                            value={descuento.monto}
                            readOnly
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                    </div>
                </div>
            )}


            {/* Gestión del Descuento (Botones de acción) */}
            <div className="flex justify-end items-center pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={isSubmitting}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${descuento.activo
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : 'bg-green-50 text-[#0E592F] hover:bg-green-100 border border-green-200'
                        } disabled:opacity-50`}
                >
                    {isSubmitting ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {descuento.activo ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            )}
                        </svg>
                    )}
                    {descuento.activo ? 'Desactivar Descuento' : 'Activar Descuento'}
                </button>
            </div>
        </div>
    );
}
