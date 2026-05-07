import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const COLORS = ['#2a7c5a', '#5b4fd8', '#d85b5b', '#c47d1a', '#1a7fb5', '#a854a8']

function avatarColor(name) {
    const palette = COLORS
    let h = 0
    for (let c of name) h = (h * 31 + c.charCodeAt(0)) % palette.length
    return palette[h]
}

function initials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function Dashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const { dark, toggleTheme } = useTheme()

    const [circles, setCircles] = useState([])
    const [posts, setPosts] = useState([])
    const [selectedCircle, setSelectedCircle] = useState('all')
    const [postContent, setPostContent] = useState('')
    const [selectedCirclesForPost, setSelectedCirclesForPost] = useState([])
    const [showCircleModal, setShowCircleModal] = useState(false)
    const [showMemberModal, setShowMemberModal] = useState(false)
    const [circleName, setCircleName] = useState('')
    const [circleColor, setCircleColor] = useState('#2a7c5a')
    const [memberEmail, setMemberEmail] = useState('')
    const [memberError, setMemberError] = useState('')
    const [activeCircle, setActiveCircle] = useState(null)
    const [now, setNow] = useState(Date.now())

    // 1. Load data and set up live refresh
    useEffect(() => { loadCircles() }, [])
    useEffect(() => {
        loadFeed()
        const interval = setInterval(() => {
            setNow(Date.now()) // Updates the countdown timers
            loadFeed()         // Keeps the "live" feel
        }, 10000)
        return () => clearInterval(interval)
    }, [selectedCircle])

    async function loadCircles() {
        const res = await axios.get('/api/circles')
        setCircles(res.data)
    }

    async function loadFeed() {
        const url = selectedCircle === 'all' ? '/api/posts/feed' : `/api/posts/feed?circle=${selectedCircle}`
        const res = await axios.get(url)
        setPosts(res.data)
    }

    async function handlePost() {
        if (!postContent.trim()) return
        if (!selectedCirclesForPost.length) return alert('Select a Circle for this Whisper')
        await axios.post('/api/posts', { content: postContent, circles: selectedCirclesForPost })
        setPostContent('')
        setSelectedCirclesForPost([])
        loadFeed()
    }

    async function handleLike(postId) {
        await axios.post(`/api/posts/${postId}/like`)
        loadFeed()
    }

    async function handleLogout() {
        await logout()
        navigate('/')
    }

    // Styles with Dark Mode fixes
    const s = {
        page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: 'var(--text)', transition: '0.3s' },
        nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 100 },
        logo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: 'var(--text)', textDecoration: 'none' },
        layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 65px)' },
        sidebar: { background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '1.5rem' },
        feed: { padding: '2rem', maxWidth: '680px', margin: '0 auto' },
        card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' },
        btnPrimary: { padding: '0.6rem 1.4rem', border: 'none', borderRadius: '99px', background: 'var(--accent)', color: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' },
        input: { padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg)', color: 'var(--text)', outline: 'none' },
        whisperTag: { fontSize: '0.65rem', fontWeight: 800, color: '#ff4b4b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '5px' }
    }

    return (
        <div style={s.page}>
            <nav style={s.nav}>
                <span style={s.logo}>Cloze<span style={{ color: 'var(--accent)' }}>r</span></span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>{dark ? '☀️' : '🌙'}</button>
                    <button style={{ ...s.btnPrimary, background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={handleLogout}>Log out</button>
                </div>
            </nav>

            <div style={s.layout}>
                <aside style={s.sidebar}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>Circles</div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li onClick={() => setSelectedCircle('all')} style={{ padding: '0.5rem', cursor: 'pointer', color: selectedCircle === 'all' ? 'var(--accent)' : 'var(--text-muted)' }}>
                            ● All Whispers
                        </li>
                        {circles.map(c => (
                            <li key={c._id} onClick={() => setSelectedCircle(c._id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem', cursor: 'pointer', color: selectedCircle === c._id ? 'var(--text)' : 'var(--text-muted)' }}>
                                <div style={{
                                    width: 10, height: 10, borderRadius: '50%', background: c.color,
                                    boxShadow: `0 0 10px ${c.color}`,
                                    animation: 'pulse 2s infinite ease-in-out'
                                }} />
                                {c.name}
                            </li>
                        ))}
                    </ul>
                </aside>

                <main style={s.feed}>
                    {/* Create Whisper Section */}
                    <div style={s.card}>
                        <textarea
                            value={postContent}
                            onChange={e => setPostContent(e.target.value)}
                            placeholder="Send a whisper... it'll vanish in 10 minutes."
                            style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text)', fontSize: '1.1rem', outline: 'none', resize: 'none', minHeight: '60px' }}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                            {circles.map(c => (
                                <button
                                    key={c._id}
                                    onClick={() => setSelectedCirclesForPost(prev => prev.includes(c._id) ? prev.filter(id => id !== c._id) : [...prev, c._id])}
                                    style={{
                                        padding: '4px 12px', borderRadius: '20px', border: `1px solid ${c.color}`,
                                        background: selectedCirclesForPost.includes(c._id) ? c.color : 'transparent',
                                        color: selectedCirclesForPost.includes(c._id) ? '#fff' : c.color,
                                        fontSize: '0.75rem', cursor: 'pointer'
                                    }}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button onClick={handlePost} style={s.btnPrimary}>Whisper</button>
                        </div>
                    </div>

                    {/* Feed Section */}
                    {posts.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>
                            <div style={{ fontSize: '3rem' }}>🤫</div>
                            <p>No whispers right now. Start one?</p>
                        </div>
                    ) : (
                        posts.map(post => {
                            // Calculation for the vanishing logic
                            const expiresAt = post.expiresAt ? new Date(post.expiresAt) : new Date(new Date(post.createdAt).getTime() + 10 * 60000);
                            const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
                            const m = Math.floor(secondsLeft / 60);
                            const s_left = secondsLeft % 60;

                            return (
                                <div key={post._id} style={s.card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={s.whisperTag}>
                                            <div style={{ width: 6, height: 6, background: '#ff4b4b', borderRadius: '50%' }} />
                                            Live Whisper
                                        </div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: secondsLeft < 60 ? '#ff4b4b' : 'var(--text-muted)' }}>
                                            VANISH IN {m}:{s_left < 10 ? '0' : ''}{s_left}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor(post.author.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem' }}>
                                            {initials(post.author.name)}
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.author.name}</span>
                                    </div>

                                    <div style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text)' }}>
                                        {post.content}
                                    </div>

                                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                                        <button onClick={() => handleLike(post._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            ♥ {post.likes.length}
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </main>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.7; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.7; }
                }
            `}</style>
        </div>
    )
}