export const API_BASE = 'https://promoly-backend.onrender.com'; // Production URL

export const api = {
    async get(path: string) {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async post(path: string, data?: any) {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async put(path: string, data: any) {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async delete(path: string) {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'DELETE',
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};
