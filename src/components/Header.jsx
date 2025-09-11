'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { logout } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-700">
          Estación 1888 
        </h1>
      </div>
      <button 
        onClick={logout}
        className="text-sm text-gray-600 hover:text-red-800"
      >
        Cerrar Sesión
      </button>
    </header>
  );
}
