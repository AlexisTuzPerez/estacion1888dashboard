const API_URL = process.env.NEXT_PUBLIC_BASE_URL;



export async function getMesas() {
    try {
        const response = await fetch(`${API_URL}/mesas`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener mesas:', error);
        throw error;
    }
}


export async function getMesaById(id) {
    try {
        const response = await fetch(`${API_URL}/mesas/${id}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener mesa por id:', error);
        throw error;
    }
}

export async function postMesa(mesa) {
    try {
        const response = await fetch(`${API_URL}/mesas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(mesa),
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al crear mesa:', error);
        throw error;
    }
}

export async function updateMesa(id, mesa) {
    try {
        const response = await fetch(`${API_URL}/mesas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(mesa),
        });
        return response.json();
    } 
    catch (error) {
        console.error('Error al actualizar mesa:', error);
        throw error;
    }
}

export async function deleteMesa(id) {
    try {
        await fetch(`${API_URL}/mesas/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return 
    }
    catch (error) {
        console.error('Error al eliminar mesa:', error);
        throw error;
    }
}