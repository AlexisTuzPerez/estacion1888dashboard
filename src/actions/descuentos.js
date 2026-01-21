const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getDescuentos(sucursalId = 1) {
    try {
        const response = await fetch(`${API_URL}/v1/descuentos/sucursal/${sucursalId}?soloActivos=false`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error fetching discounts: ${response.statusText}`);
        }
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener descuentos:', error);
        throw error;
    }
}

export async function updateDescuentoEstado(id, activo) {
    try {
        const response = await fetch(`${API_URL}/v1/descuentos/${id}/activar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ activo }),
        });
        if (!response.ok) {
            throw new Error(`Error updating discount status: ${response.statusText}`);
        }
        return response.json();
    }
    catch (error) {
        console.error('Error al actualizar estado del descuento:', error);
        throw error;
    }
}

