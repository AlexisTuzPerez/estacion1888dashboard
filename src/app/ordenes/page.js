'use client';
import { useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

export default function OrdenesPage() {
  const { checkTokenExpiry } = useAuth();

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
              <h1 className="text-3xl font-light text-gray-900">Órdenes</h1>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
