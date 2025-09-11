
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
            return { error: `Error al iniciar sesión: ${response.status}` };
        }
        try {
            return JSON.parse(responseText);
        } catch {
            return { message: responseText, success: true, status: response.status };
        }
    } catch (error) {
        return { error: 'Error de conexión' };
    }
}

export async function verifyAuth() {
    try {

        
        const response = await fetch(`${API_URL}/verifyAuth`, {
            method: 'GET',
            credentials: 'include',
        });
        
        if (response.status === 401 || response.status === 403) {
            return false;
        }
        
        return response.ok;
    } catch (error) {
        return false;
    }
}