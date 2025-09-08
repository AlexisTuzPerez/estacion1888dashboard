import DashboardLayout from '../components/DashboardLayout';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bienvenido al Dashboard</h1>
          <p className="text-gray-600">
            Selecciona una opción del menú lateral para comenzar a navegar por el dashboard.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Órdenes</h3>
              <p className="text-sm text-gray-600">Gestiona todas las órdenes del sistema</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Productos</h3>
              <p className="text-sm text-gray-600">Administra el catálogo de productos</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
