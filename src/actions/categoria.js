const API_URL = process.env.NEXT_PUBLIC_BASE_URL;



export async function getCategorias() {
    try {
        const response = await fetch(`${API_URL}/subcategorias`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        throw error;
    }
}


export async function getCategoriaById(id) {
    try {
        const response = await fetch(`${API_URL}/subcategorias/${id}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener categoría por id:', error);
        throw error;
    }
}

export async function postCategoria(categoria) {
    try {
        const response = await fetch(`${API_URL}/subcategorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(categoria),
        });
        return response.json();
    } catch (error) {
        console.error('Error al crear categoría:', error);
        throw error;
    }
}

export async function updateCategoria(id, categoria) {
    try {
        const response = await fetch(`${API_URL}/subcategorias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(categoria),
        });
        return response.json();
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        throw error;
    }
}

export async function deleteCategoria(id) {
    try {
        await fetch(`${API_URL}/subcategorias/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return 
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        throw error;
    }
}