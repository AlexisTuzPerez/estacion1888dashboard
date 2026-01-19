const API_URL = process.env.NEXT_PUBLIC_BASE_URL;



export async function getSubcategorias() {
    try {
        const response = await fetch(`${API_URL}/subcategorias`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    } catch (error) {
        console.error('Error al obtener subcategorías:', error);
        throw error;
    }
}


export async function getSubcategoriaById(id) {
    try {
        const response = await fetch(`${API_URL}/subcategorias/${id}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch (error) {
        console.error('Error al obtener subcategoría por id:', error);
        throw error;
    }
}

export async function postSubcategoria(subcategoria) {
    try {
        const response = await fetch(`${API_URL}/subcategorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(subcategoria),
        });
        return response.json();
    } catch (error) {
        console.error('Error al crear subcategoría:', error);
        throw error;
    }
}

export async function updateSubcategoria(id, subcategoria) {
    try {
        const response = await fetch(`${API_URL}/subcategorias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(subcategoria),
        });
        return response.json();
    } catch (error) {
        console.error('Error al actualizar subcategoría:', error);
        throw error;
    }
}

export async function deleteSubcategoria(id) {
    try {
        await fetch(`${API_URL}/subcategorias/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return
    } catch (error) {
        console.error('Error al eliminar subcategoría:', error);
        throw error;
    }
}

// TODO: Implementar endpoint en el backend para actualizar el orden de subcategorías
// Esta función está lista para cuando se implemente el endpoint /subcategorias/reorder
export async function updateSubcategoriaOrder(ordenData) {
    try {
        const response = await fetch(`${API_URL}/subcategorias/reorder`, {
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
            throw new Error('Error al actualizar el orden de las subcategorías');
        }

        return response.json();
    } catch (error) {
        console.error('Error al actualizar el orden de subcategorías:', error);
        throw error;
    }
}