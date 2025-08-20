import axios from 'axios'
import { io as socketIO } from 'socket.io-client'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api',
})

export function attachToken(getToken) {
    api.interceptors.request.use((config) => {
        const token = getToken()
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    })
}

export default api

export function createSocket() {
    const base = (
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api').replace(/\/?api$/, '')
    return socketIO(base, {
        // allow default transports (polling + websocket) for reliable negotiation
        withCredentials: true,
    })
}