
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