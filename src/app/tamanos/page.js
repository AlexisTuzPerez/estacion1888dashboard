'use client';
import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

export default function TamanosPage() {
  // Datos de ejemplo basados en el modelo Java
  const [tamanos] = useState([
    {
      id: 1,
      nombre: "PEQUEÑO",
      descripcion: "Tamaño pequeño - ideal para una persona",
      multiplicadorPrecio: 1.0
    },
    {
      id: 2,
      nombre: "MEDIANO",
      descripcion: "Tamaño mediano - para compartir",
      multiplicadorPrecio: 1.5
    },
    {
      id: 3,
      nombre: "GRANDE",
      descripcion: "Tamaño grande - para grupos",
      multiplicadorPrecio: 2.0
    },
    {
      id: 4,
      nombre: "FAMILIAR",
      descripcion: "Tamaño familiar - para toda la familia",
      multiplicadorPrecio: 2.8
    },
    {
      id: 5,
      nombre: "EXTRA GRANDE",
      descripcion: "Tamaño extra grande - para eventos",
      multiplicadorPrecio: 3.5
    }
  ]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header minimalista */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Tamaños</h1>
            </div>
            <button className="bg-[#0E592F] text-white px-3 mr-1 py-3 rounded-lg hover:bg-[#0B4A27] transition-colors font-medium flex items-center">
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Multiplicador
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {tamanos.map((tamano, index) => (
                  <tr 
                    key={tamano.id} 
                    className={`hover:bg-green-50 transition-colors ${
                      index !== tamanos.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
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
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-[#0E592F]">
                        x{tamano.multiplicadorPrecio}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-3">
                        <button className="text-gray-400 hover:text-[#0E592F] transition-colors">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
    </DashboardLayout>
  );
}
