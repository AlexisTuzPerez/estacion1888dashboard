const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getModificadores() {
    try {
        const response = await fetch(`${API_URL}/modificadores`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener modificadores:', error);
        throw error;
    }
}

export async function getModificadorById(id) {
    try {
        const response = await fetch(`${API_URL}/modificadores/${id}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener modificador por id:', error);
        throw error;
    }
}

export async function postModificador(modificador) {
    try {
        const response = await fetch(`${API_URL}/modificadores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(modificador),
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al crear modificador:', error);
        throw error;
    }
}

export async function updateModificador(id, modificador) {
    try {
        const response = await fetch(`${API_URL}/modificadores/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(modificador),
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al actualizar modificador:', error);
        throw error;
    }
}

export async function deleteModificador(id) {
    try {
        await fetch(`${API_URL}/modificadores/${id}`, {   
            method: 'DELETE',
            credentials: 'include',
        });
        return 
    }
    catch (error) {
        console.error('Error al eliminar modificador:', error);
        throw error;
    }
}

// TODO: Implementar endpoint en el backend para actualizar el orden de modificadores
// Esta función está lista para cuando se implemente el endpoint /modificadores/reorder
export async function updateModificadorOrder(ordenData) {
    try {
        const response = await fetch(`${API_URL}/modificadores/reorder`, {
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
            throw new Error('Error al actualizar el orden de los modificadores');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error al actualizar el orden de modificadores:', error);
        throw error;
    }
}   