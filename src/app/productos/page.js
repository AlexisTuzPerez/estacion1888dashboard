'use client';
import Image from 'next/image';
import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

export default function ProductosPage() {
  // Mock de subcategorías
  const [subcategorias] = useState([
    { id: 1, nombre: "Bebidas Calientes" },
    { id: 2, nombre: "Bebidas Frías" },
    { id: 3, nombre: "Alimentos" }
  ]);

  // Mock de productos por subcategoría
  const [productosPorSubcategoria] = useState({
    1: [ // Bebidas Calientes
      { id: 1, name: "Café Americano", price: "$3.50", imageURL: null },
      { id: 2, name: "Cappuccino", price: "$4.20", imageURL: null },
      { id: 3, name: "Latte", price: "$4.50", imageURL: null },
      { id: 4, name: "Espresso", price: "$2.80", imageURL: null },
      { id: 5, name: "Mocha", price: "$5.00", imageURL: null },
      { id: 6, name: "Té Chai", price: "$3.80", imageURL: null }
    ],
    2: [ // Bebidas Frías
      { id: 7, name: "Frappé de Vainilla", price: "$5.50", imageURL: null },
      { id: 8, name: "Smoothie de Fresa", price: "$6.00", imageURL: null },
      { id: 9, name: "Limonada", price: "$3.20", imageURL: null },
      { id: 10, name: "Iced Coffee", price: "$4.00", imageURL: null },
      { id: 11, name: "Agua Mineral", price: "$2.00", imageURL: null }
    ],
    3: [ // Alimentos
      { id: 12, name: "Croissant", price: "$4.50", imageURL: null },
      { id: 13, name: "Sandwich Club", price: "$8.90", imageURL: null },
      { id: 14, name: "Ensalada César", price: "$7.20", imageURL: null },
      { id: 15, name: "Muffin de Arándanos", price: "$3.80", imageURL: null },
      { id: 16, name: "Bagel con Queso", price: "$5.50", imageURL: null },
      { id: 17, name: "Wrap de Pollo", price: "$9.50", imageURL: null },
      { id: 18, name: "Tostada Francesa", price: "$6.80", imageURL: null }
    ]
  });

  const openProductModal = (product) => {
    console.log('Abrir modal para:', product);
    // Aquí irá la lógica del modal
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto mt-8 px-4">
        {/* Header minimalista */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Productos</h1>
            </div>
            <button className="bg-[#0E592F] text-white px-3 mr-1 py-3 rounded-lg hover:bg-[#0B4A27] transition-colors font-medium flex items-center">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Productos por subcategoría */}
        <div className="space-y-8">
          {subcategorias.map((subcategoria) => (
            <div key={subcategoria.id} className="bg-white rounded-xl border border-gray-100 p-6">
              {/* Título de la subcategoría */}
              <div className="mb-4">
                <h2 className="text-xl font-medium text-gray-900">{subcategoria.nombre}</h2>
                <div className="mt-2 h-0.5 w-12 bg-[#0E592F]"></div>
              </div>

              {/* Productos con scroll horizontal */}
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                  {productosPorSubcategoria[subcategoria.id]?.map((product) => (
                    <div key={product.id} className="flex-none w-48">
                      <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow">
                        {/* Imagen del producto */}
                        <div className="h-40 w-full relative">
                          {product.imageURL ? (
                            <Image
                              src={product.imageURL}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-40 w-full flex items-center justify-center bg-gray-50">
                              <Image
                                src="/Logo.png"
                                alt="Logo"
                                width={80}
                                height={80}
                                className="object-contain opacity-40"
                              />
                            </div>
                          )}
                        </div>

                        {/* Información del producto */}
                        <div className="p-3">
                          <h3 className="mb-1 text-base font-semibold text-black line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-700">
                              {product.price}
                            </span>
                            <button
                              onClick={() => openProductModal(product)}
                              className="ml-2 p-1 text-gray-400 hover:text-[#0E592F] transition-colors"
                            >
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contador de productos */}
              <div className="mt-3 text-right">
                <span className="text-sm text-gray-500">
                  {productosPorSubcategoria[subcategoria.id]?.length || 0} productos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
