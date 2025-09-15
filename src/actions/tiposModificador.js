const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getTiposModificador() {
    try {
        const response = await fetch(`${API_URL}/tipos-modificador`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener tipos de modificador:', error);
        throw error;
    }
}

export async function getTipoModificadorById(id) {
    try {
        const response = await fetch(`${API_URL}/tipos-modificador/${id}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener tipo de modificador por id:', error);
        throw error;
    }
}

export async function postTipoModificador(tipoModificador) {
    try {
        const response = await fetch(`${API_URL}/tipos-modificador`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(tipoModificador),
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al crear tipo de modificador:', error);
        throw error;
    }
}

export async function updateTipoModificador(id, tipoModificador) {
    try {
        const response = await fetch(`${API_URL}/tipos-modificador/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(tipoModificador),
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al actualizar tipo de modificador:', error);
        throw error;
    }
}

export async function deleteTipoModificador(id) {
    try {
        await fetch(`${API_URL}/tipos-modificador/${id}`, {   
            method: 'DELETE',
            credentials: 'include',
        });
        return 
    }
    catch (error) {
        console.error('Error al eliminar tipo de modificador:', error);
        throw error;
    }
}

// TODO: Implementar endpoint en el backend para actualizar el orden de tipos modificador
// Esta función está lista para cuando se implemente el endpoint /tipos-modificador/reorder
export async function updateTipoModificadorOrder(ordenData) {
    try {
        const response = await fetch(`${API_URL}/tipos-modificador/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(ordenData.map(item => ({
                id: item.id,
                posicion: item.posicion
            }))),
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar el orden de los tipos modificador');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error al actualizar el orden de tipos modificador:', error);
        throw error;
    }
}
