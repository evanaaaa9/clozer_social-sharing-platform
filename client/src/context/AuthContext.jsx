import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/auth/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password })
        setUser(res.data.user)
        return res.data
    }

    const register = async (name, email, password) => {
        const res = await axios.post('/api/auth/register', { name, email, password })
        setUser(res.data.user)
        return res.data
    }

    const logout = async () => {
        await axios.post('/api/auth/logout')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}