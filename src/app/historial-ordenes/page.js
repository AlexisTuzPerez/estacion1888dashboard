'use client';
import { useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

export default function OrdenesPage() {
  const { checkTokenExpiry } = useAuth();
  const isLoading = true;

  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header minimalista */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Historial</h1>
            </div>
          </div>
        </div>
        {/* Tabla minimalista con skeleton */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Productos</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-50">
                      <td className="px-6 py-4 text-center">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                      </td>
                    
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
