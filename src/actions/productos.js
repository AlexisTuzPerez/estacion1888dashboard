
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