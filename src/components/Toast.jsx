'use client';
import { useEffect } from 'react';

/**
 * Componente Toast para notificaciones
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success', 'error', 'info', 'warning')
 * @param {function} onClose - Función para cerrar el toast
 * @param {number} duration - Duración en ms antes de cerrar automáticamente (default: 3000)
 */
export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-600',
                    icon: (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )
                };
            case 'error':
                return {
                    bg: 'bg-red-600',
                    icon: (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500',
                    icon: (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    )
                };
            default:
                return {
                    bg: 'bg-blue-600',
                    icon: (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    const styles = getStyles();

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-right">
            <div className={`${styles.bg} shadow-lg rounded-lg px-4 py-3 text-white flex items-center space-x-3 min-w-[300px]`}>
                <div className="flex-shrink-0">
                    {styles.icon}
                </div>
                <div className="flex-1 text-sm font-medium">
                    {message}
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-white hover:text-gray-100 focus:outline-none"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
