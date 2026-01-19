'use client';
import { useEffect, useState } from 'react';
import { getCorteCajaData } from '../../actions/ordenes';
import DashboardLayout from '../../components/DashboardLayout';

export default function CortesPage() {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [ordenes, setOrdenes] = useState([]);
    const [efectivoReal, setEfectivoReal] = useState('');

    // KPIs
    const [kpis, setKpis] = useState({
        ventaTotal: 0,
        numOrdenes: 0,
        ticketPromedio: 0,
        eficiencia: 0,
        porComerAqui: 0,
        porParaLlevar: 0,
        ordenesRechazadas: 0
    });

    const fetchCorteData = async (selectedDate) => {
        setLoading(true);
        try {
            const data = await getCorteCajaData(selectedDate);
            const ordersArray = data.data || [];
            setOrdenes(ordersArray);

            // Procesar KPIs
            const completadas = ordersArray.filter(o => o.estado === 'COMPLETADA');
            const rechazadas = ordersArray.filter(o => o.estado === 'RECHAZADA');
            const totalVentas = completadas.reduce((acc, o) => acc + Number(o.total), 0);

            setKpis({
                ventaTotal: totalVentas,
                numOrdenes: completadas.length,
                ticketPromedio: completadas.length > 0 ? totalVentas / completadas.length : 0,
                eficiencia: ordersArray.length > 0 ? (completadas.length / ordersArray.length) * 100 : 0,
                porComerAqui: completadas.filter(o => o.tipoOrden === 'COMER_AQUI').length,
                porParaLlevar: completadas.filter(o => o.tipoOrden === 'PARA_LLEVAR').length,
                ordenesRechazadas: rechazadas.length
            });
        } catch (error) {
            console.error('Error al cargar datos del corte:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCorteData(fecha);
    }, [fecha]);

    const handlePrint = () => {
        window.print();
    };

    const diferencia = efectivoReal !== '' ? Number(efectivoReal) - kpis.ventaTotal : null;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto mt-8 px-4 pb-12">
                {/* Header con Filtros */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-light text-gray-900">Corte de Caja</h1>
                        <p className="text-gray-500 mt-1">Resumen operativo y conciliación de ventas</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#0E592F] outline-none"
                        />
                        <button
                            onClick={handlePrint}
                            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Imprimir</span>
                        </button>
                    </div>
                </div>

                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Venta Bruta</p>
                        <p className="text-3xl font-bold text-[#0E592F]">${kpis.ventaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <div className="mt-2 text-xs text-gray-400">Total de órdenes completadas</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Transacciones</p>
                        <p className="text-3xl font-bold text-gray-900">{kpis.numOrdenes}</p>
                        <div className="mt-2 text-xs text-gray-400">Excluye {kpis.ordenesRechazadas} rechazadas</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Ticket Promedio</p>
                        <p className="text-3xl font-bold text-gray-900">${kpis.ticketPromedio.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <div className="mt-2 text-xs text-gray-400">Promedio por cliente</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Eficiencia</p>
                        <p className="text-3xl font-bold text-gray-900">{Math.round(kpis.eficiencia)}%</p>
                        <div className="mt-2 text-xs text-gray-400">Ratio de éxito de órdenes</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Desglose y Conciliación */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Comparativo de tipos */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Canales de Venta
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Comer Aquí vs Para Llevar</span>
                                    <span className="font-semibold text-gray-900">
                                        {kpis.porComerAqui} / {kpis.porParaLlevar}
                                    </span>
                                </div>
                                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-[#0E592F]"
                                        style={{ width: `${kpis.numOrdenes > 0 ? (kpis.porComerAqui / kpis.numOrdenes) * 100 : 50}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-[#D4B996]"
                                        style={{ width: `${kpis.numOrdenes > 0 ? (kpis.porParaLlevar / kpis.numOrdenes) * 100 : 50}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center space-x-6 text-xs text-gray-500">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-[#0E592F] rounded-full mr-2"></div>
                                        Comer Aquí ({kpis.porComerAqui})
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-[#D4B996] rounded-full mr-2"></div>
                                        Para Llevar ({kpis.porParaLlevar})
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Arqueo de Caja */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#D4B996]">
                            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                Conciliación Manual
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Efectivo en Caja</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            value={efectivoReal}
                                            onChange={(e) => setEfectivoReal(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0E592F] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl border ${diferencia === null
                                        ? 'bg-gray-50 border-gray-100'
                                        : diferencia >= 0
                                            ? 'bg-green-50 border-green-100'
                                            : 'bg-red-50 border-red-100'
                                    }`}>
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Diferencia</p>
                                    <p className={`text-xl font-bold ${diferencia === null
                                            ? 'text-gray-400'
                                            : diferencia >= 0
                                                ? 'text-green-700'
                                                : 'text-red-700'
                                        }`}>
                                        {diferencia === null ? '$ ---' : `$${diferencia.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Listado lateral simple */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[600px] overflow-hidden flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                            <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Órdenes del Día
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
                                ))
                            ) : ordenes.length > 0 ? (
                                ordenes.map((orden) => (
                                    <div key={orden.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">#{orden.id}</p>
                                            <p className="text-xs text-gray-500">{new Date(orden.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">${Number(orden.total).toFixed(2)}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${orden.estado === 'COMPLETADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {orden.estado}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400 italic text-sm">
                                    Sin órdenes registradas
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        @media print {
          aside { display: none !important; }
          main { margin-left: 0 !important; }
          button, input[type="date"], .conciliacion-input { display: none !important; }
        }
      `}</style>
        </DashboardLayout>
    );
}
