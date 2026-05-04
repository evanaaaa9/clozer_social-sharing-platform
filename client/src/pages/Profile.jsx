import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

function avatarColor(name) {
    const palette = ['#2a7c5a', '#5b4fd8', '#d85b5b', '#c47d1a', '#1a7fb5', '#a854a8']
    let h = 0
    for (let c of name) h = (h * 31 + c.charCodeAt(0)) % palette.length
    return palette[h]
}

function initials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(date) {
    const diff = (Date.now() - new Date(date)) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
    return Math.floor(diff / 86400) + 'd ago'
}

export default function Profile() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [circles, setCircles] = useState([])
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [editBio, setEditBio] = useState('')

    useEffect(() => {
        loadProfile()
        loadPosts()
        loadCircles()
    }, [])

    async function loadProfile() {
        const res = await axios.get('/api/profile/me')
        setProfile(res.data)
        setEditName(res.data.name)
        setEditBio(res.data.bio || '')
    }

    async function loadPosts() {
        const res = await axios.get('/api/profile/myposts')
        setPosts(res.data)
    }

    async function loadCircles() {
        const res = await axios.get('/api/circles')
        setCircles(res.data)
    }

    async function handleSave() {
        await axios.post('/api/profile/update', { name: editName, bio: editBio })
        setEditing(false)
        loadProfile()
    }

    async function handleLogout() {
        await logout()
        navigate('/')
    }

    if (!profile) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>

    return (
        <div style={{ background: '#f4f3f0', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
            {/* NAV */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #e8e6e1', background: '#fafafa', position: 'sticky', top: 0, zIndex: 100 }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#0f0f0f' }}>
                    Cloze<span style={{ color: '#2a7c5a' }}>r</span>
                </span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem 1.2rem', border: '1px solid #e8e6e1', borderRadius: '99px', background: 'none', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", color: '#5c5a55', cursor: 'pointer' }}>Dashboard</button>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1.2rem', border: '1px solid #e8e6e1', borderRadius: '99px', background: 'none', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", color: '#5c5a55', cursor: 'pointer' }}>Log out</button>
                </div>
            </nav>

            <div style={{ maxWidth: '680px', margin: '2rem auto', padding: '0 2rem 4rem' }}>

                {/* Profile Card */}
                <div style={{ background: '#fafafa', border: '1px solid #e8e6e1', borderRadius: '20px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: avatarColor(profile.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 500, color: '#fff', fontFamily: "'DM Serif Display', serif", flexShrink: 0 }}>
                        {initials(profile.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', marginBottom: '0.3rem', letterSpacing: '-0.5px' }}>{profile.name}</h2>
                        <p style={{ fontSize: '0.88rem', color: '#9e9b94', marginBottom: '0.4rem' }}>{profile.email}</p>
                        <p style={{ fontSize: '0.92rem', color: '#5c5a55', lineHeight: 1.6, marginBottom: '0.4rem', fontWeight: 300 }}>{profile.bio || 'No bio yet.'}</p>
                        <p style={{ fontSize: '0.8rem', color: '#9e9b94' }}>Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setEditing(!editing)} style={{ padding: '0.5rem 1.4rem', border: 'none', borderRadius: '99px', background: '#0f0f0f', color: '#fafafa', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: 'pointer' }}>
                        {editing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {/* Edit Form */}
                {editing && (
                    <div style={{ background: '#fafafa', border: '1px solid #e8e6e1', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.25rem' }}>Edit Profile</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c5a55' }}>Name</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)}
                                    style={{ padding: '0.7rem 1rem', border: '1px solid #e8e6e1', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c5a55' }}>Bio</label>
                                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} maxLength={160} rows={3}
                                    placeholder="Tell people about yourself..."
                                    style={{ padding: '0.7rem 1rem', border: '1px solid #e8e6e1', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none' }} />
                            </div>
                            <button onClick={handleSave} style={{ padding: '0.85rem', borderRadius: '99px', background: '#0f0f0f', color: '#fafafa', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: 'pointer', border: 'none' }}>
                                Save changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[{ num: posts.length, label: 'Posts' }, { num: circles.length, label: 'Circles' }].map(stat => (
                        <div key={stat.label} style={{ background: '#fafafa', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', marginBottom: '0.2rem' }}>{stat.num}</div>
                            <div style={{ fontSize: '0.82rem', color: '#9e9b94', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* My Posts */}
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', marginBottom: '1rem' }}>My Posts</h3>
                {posts.length === 0 && <p style={{ color: '#9e9b94', fontSize: '0.9rem' }}>No posts yet. Go to dashboard and post something!</p>}
                {posts.map(post => (
                    <div key={post._id} style={{ background: '#fafafa', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.92rem', color: '#5c5a55', lineHeight: 1.65, fontWeight: 300, marginBottom: '0.75rem' }}>{post.content}</div>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            {post.circles.map(c => (
                                <span key={c._id} style={{ fontSize: '0.7rem', borderRadius: '99px', padding: '0.12rem 0.55rem', background: `${c.color}22`, color: c.color }}>{c.name}</span>
                            ))}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#9e9b94' }}>{timeAgo(post.createdAt)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}