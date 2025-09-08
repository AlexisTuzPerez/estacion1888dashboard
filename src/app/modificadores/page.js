'use client';
import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

export default function ModificadoresPage() {
  // Datos de ejemplo basados en el modelo Java
  const [modificadores] = useState([
    {
      id: 1,
      nombre: "EXTRA QUESO",
      precio: 2.50,
      subcategoria: "Lácteos"
    },
    {
      id: 2,
      nombre: "SIN CEBOLLA",
      precio: 0.00,
      subcategoria: "Vegetales"
    },
    {
      id: 3,
      nombre: "DOBLE CARNE",
      precio: 3.00,
      subcategoria: "Proteínas"
    },
    {
      id: 4,
      nombre: "EXTRA PICANTE",
      precio: 0.50,
      subcategoria: "Salsas"
    },
    {
      id: 5,
      nombre: "SIN GLUTEN",
      precio: 1.00,
      subcategoria: "Especiales"
    }
  ]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header minimalista */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Modificadores</h1>
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
                {modificadores.map((modificador, index) => (
                  <tr 
                    key={modificador.id} 
                    className={`hover:bg-green-50 transition-colors ${
                      index !== modificadores.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
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
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-[#0E592F]">
                        {modificador.subcategoria}
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
            {modificadores.length} modificadores
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
