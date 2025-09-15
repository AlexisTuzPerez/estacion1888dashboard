
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;



export async function getProductosBySubcategoria(subcategoriaId) {
    try {
        const response = await fetch(`${API_URL}/productos/subcategoria/${subcategoriaId}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        throw error;
    }
}

export async function getAllProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    } catch (error) {
        console.error('Error al obtener todos los productos:', error);
        throw error;
    }
}

export async function getProductoById(productoId) {
    try{
        const response = await fetch(`${API_URL}/productos/${productoId}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        throw error;
    }
}


export async function postProducto(productoData) {
    try{
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(productoData),
        });
        return response.json();
    } catch (error) {
        console.error('Error al crear producto:', error);
        throw error;
    }
}


export async function updateProducto(productoId, productoData) {
    try{
        await fetch(`${API_URL}/productos/${productoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(productoData),
        });
        return 
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        throw error;
    }
}


export async function deleteProducto(productoId) {
    try{
        const response = await fetch(`${API_URL}/productos/${productoId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return { success: true, message: 'Producto eliminado exitosamente' };

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        throw error;
    }
}

// TODO: Implementar endpoint en el backend para actualizar el orden de productos
// Esta función está lista para cuando se implemente el endpoint /productos/reorder
export async function updateProductoOrder(ordenData) {
    try {
        const response = await fetch(`${API_URL}/productos/reorder`, {
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
            throw new Error('Error al actualizar el orden de los productos');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error al actualizar el orden de productos:', error);
        throw error;
    }
}