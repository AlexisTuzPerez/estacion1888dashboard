const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getCategorias() {
    try {
        const response = await fetch(`${API_URL}/categorias`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Error al obtener categorías');
        }
        return response.json();
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        throw error;
    }
}

export async function getCategoriaById(id) {
    try {
        const response = await fetch(`${API_URL}/categorias/${id}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Error al obtener categoría por id');
        }
        return response.json();
    } catch (error) {
        console.error('Error al obtener categoría por id:', error);
        throw error;
    }
}

export async function postCategoria(categoria) {
    try {
        const response = await fetch(`${API_URL}/categorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(categoria),
        });
        if (!response.ok) {
            throw new Error('Error al crear categoría');
        }
        return response.json();
    } catch (error) {
        console.error('Error al crear categoría:', error);
        throw error;
    }
}

export async function updateCategoria(id, categoria) {
    try {
        const response = await fetch(`${API_URL}/categorias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(categoria),
        });
        if (!response.ok) {
            throw new Error('Error al actualizar categoría');
        }
        return response.json();
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        throw error;
    }
}

export async function deleteCategoria(id) {
    try {
        const response = await fetch(`${API_URL}/categorias/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Error al eliminar categoría');
        }
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        throw error;
    }
}

export async function updateCategoriaOrder(ordenData) {
    try {
        const response = await fetch(`${API_URL}/categorias/reorder`, {
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
            throw new Error('Error al actualizar el orden de las categorías');
        }

        return response.json();
    } catch (error) {
        console.error('Error al actualizar el orden de categorías:', error);
        throw error;
    }
}
