'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  };

  return (
    <aside className="bg-white border-r border-gray-200 w-64 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {/* Home */}
        <Link 
          href="/"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/')}`}
        >
          <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Inicio
        </Link>
        {/* Órdenes */}
        <Link 
          href="/ordenes"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/ordenes')}`}
        >
          <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Órdenes
        </Link>

          {/* Historial de Órdenes */}
          <Link 
            href="/historial-ordenes"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/historial-ordenes')}`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
            </svg>
            Historial de Órdenes
          </Link>

        {/* Sección Elementos */}
        <div className="pt-2">
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Elementos
          </h3>
          
          {/* Productos */}
          <Link 
            href="/productos"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/productos')}`}
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Productos
          </Link>

          {/* Modificadores */}
          <Link 
            href="/modificadores"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/modificadores')}`}
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Modificadores
          </Link>

          {/* Tipos de Modificador */}
          <Link 
            href="/tipos-modificador"
            className={`flex items-center px-8 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/tipos-modificador')}`}
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Tipos de Modificador
          </Link>

          {/* Tamaños */}
          <Link 
            href="/tamanos"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/tamanos')}`}
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Tamaños
          </Link>

          {/* Categoría */}
          <Link 
            href="/categoria"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/categoria')}`}
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categoría
          </Link>

          {/* Mesas */}
          <Link 
            href="/mesas"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/mesas')}`}
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Mesas
          </Link>
        </div>
      </nav>
    </aside>
  );
}
