
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
export async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify({ email, password }),
        });
        const responseText = await response.text();
        if (!response.ok) {
            return { error: `Error al iniciar sesión` };
        }
        let userInfo;
        try {
            userInfo = JSON.parse(responseText);
        } catch {
            return { message: responseText, success: true, status: response.status };
        }
        // Verificación de usuario permitido
        if (!userInfo || userInfo.id !== 152) {
            return { error: 'Error al iniciar sesión' };
        }
        return userInfo;
    } catch (error) {
        return { error: 'Error de conexión' };
    }
}

export async function verifyAuth() {
    try {
        const response = await fetch(`${API_URL}/verifyAuth`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            return false;
        }
        
        return response.ok;
    } catch (error) {
        return false;
    }
}