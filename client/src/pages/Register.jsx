import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(name, email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        }
        setLoading(false)
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f3f0', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ background: '#fafafa', border: '1px solid #e8e6e1', borderRadius: '20px', padding: '3rem', width: '100%', maxWidth: '420px' }}>
                <Link to="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: '#0f0f0f', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
                    Cloze<span style={{ color: '#2a7c5a' }}>r</span>
                </Link>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', marginBottom: '0.4rem' }}>Create your account</h2>
                <p style={{ color: '#5c5a55', fontSize: '0.9rem', marginBottom: '2rem', fontWeight: 300 }}>Start sharing intentionally</p>

                {error && <div style={{ background: '#fde8e8', color: '#c44b4b', border: '1px solid #f5c5c5', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.88rem', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c5a55' }}>Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required
                            style={{ padding: '0.7rem 1rem', border: '1px solid #e8e6e1', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c5a55' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                            style={{ padding: '0.7rem 1rem', border: '1px solid #e8e6e1', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c5a55' }}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6}
                            style={{ padding: '0.7rem 1rem', border: '1px solid #e8e6e1', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
                    </div>
                    <button type="submit" disabled={loading}
                        style={{ padding: '0.85rem 2rem', borderRadius: '99px', background: '#0f0f0f', color: '#fafafa', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: 'pointer', border: 'none' }}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#5c5a55' }}>
                    Already have an account? <Link to="/login" style={{ color: '#2a7c5a', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
                </p>
            </div>
        </div>
    )
}