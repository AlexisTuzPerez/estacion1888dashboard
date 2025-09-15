
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getTamanos() {
    try {
        const response = await fetch(`${API_URL}/tamanos`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    } catch (error) {
        console.error('Error al obtener tamanos:', error);
        throw error;
    }
}


export async function getTamanoById(id) {
    try {
        const response = await fetch(`${API_URL}/tamanos/${id}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener tamaño por id:', error);
        throw error;
    }
}

export async function postTamano(tamano) {
    try {
        const response = await fetch(`${API_URL}/tamanos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(tamano),
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al crear tamaño:', error);
        throw error;
    }
}

export async function updateTamano(id, tamano) {
    try {
        const response = await fetch(`${API_URL}/tamanos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(tamano),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar tamaño');
        }
        
        return response.json();
    }
    catch (error) {
        console.error('Error al actualizar tamaño:', error);
        throw error;
    }
}

export async function deleteTamano(id) {
    try {
        await fetch(`${API_URL}/tamanos/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return 
    }
    catch (error) {
        console.error('Error al eliminar tamaño:', error);
        throw error;
    }
}

// TODO: Implementar endpoint en el backend para actualizar el orden de tamaños
// Esta función está lista para cuando se implemente el endpoint /tamanos/reorder
export async function updateTamanoOrder(ordenData) {
    try {
        const response = await fetch(`${API_URL}/tamanos/reorder`, {
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
            throw new Error('Error al actualizar el orden de los tamaños');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error al actualizar el orden de tamaños:', error);
        throw error;
    }
}