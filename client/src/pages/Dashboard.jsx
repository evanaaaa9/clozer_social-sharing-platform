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

function timeAgo(date) {
    const diff = (Date.now() - new Date(date)) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
    return Math.floor(diff / 86400) + 'd ago'
}

export default function Dashboard() {
    const [editingPost, setEditingPost] = useState(null)
    const [editContent, setEditContent] = useState('')
    const { user, logout } = useAuth()
    const navigate = useNavigate()
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
    const [openComments, setOpenComments] = useState({})
    const [commentTexts, setCommentTexts] = useState({})
    const { dark, toggleTheme } = useTheme()

    useEffect(() => { loadCircles() }, [])
    useEffect(() => { loadFeed() }, [selectedCircle])

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
        if (!postContent.trim()) return alert('Write something first!')
        if (!selectedCirclesForPost.length) return alert('Select at least one circle!')
        await axios.post('/api/posts', { content: postContent, circles: selectedCirclesForPost })
        setPostContent('')
        setSelectedCirclesForPost([])
        loadFeed()
    }

    async function handleLike(postId) {
        await axios.post(`/api/posts/${postId}/like`)
        loadFeed()
    }

    async function handleComment(postId) {
        const text = commentTexts[postId]?.trim()
        if (!text) return
        await axios.post(`/api/posts/${postId}/comments`, { text })
        setCommentTexts(prev => ({ ...prev, [postId]: '' }))
        loadFeed()
    }

    async function handleCreateCircle() {
        if (!circleName.trim()) return
        await axios.post('/api/circles', { name: circleName, color: circleColor })
        setCircleName('')
        setCircleColor('#2a7c5a')
        setShowCircleModal(false)
        loadCircles()
    }

    async function handleAddMember() {
        setMemberError('')
        try {
            await axios.post(`/api/circles/${activeCircle._id}/members`, { email: memberEmail })
            setMemberEmail('')
            loadCircles()
            const res = await axios.get('/api/circles')
            setActiveCircle(res.data.find(c => c._id === activeCircle._id))
        } catch (err) {
            setMemberError(err.response?.data?.error || 'Could not add member')
        }
    }

    async function handleRemoveMember(userId) {
        await axios.delete(`/api/circles/${activeCircle._id}/members/${userId}`)
        loadCircles()
        const res = await axios.get('/api/circles')
        setActiveCircle(res.data.find(c => c._id === activeCircle._id))
    }

    async function handleDeleteCircle() {
        if (!window.confirm('Delete this circle?')) return
        await axios.delete(`/api/circles/${activeCircle._id}`)
        setShowMemberModal(false)
        setActiveCircle(null)
        loadCircles()
        loadFeed()
    }

    async function handleEditPost(post) {
        setEditingPost(post._id)
        setEditContent(post.content)
    }

    async function handleSaveEdit(postId) {
        await axios.put(`/api/posts/${postId}`, { content: editContent })
        setEditingPost(null)
        loadFeed()
    }

    async function handleDeletePost(postId) {
        if (!window.confirm('Delete this post?')) return
        await axios.delete(`/api/posts/${postId}`)
        loadFeed()
    }

    async function handleLogout() {
        await logout()
        navigate('/')
    }

    const s = {
        page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: 'var(--text)' },
        nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 100 },
        logo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: 'var(--text)', textDecoration: 'none' },
        layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 65px)' },
        sidebar: { background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '1.5rem' },
        feed: { padding: '2rem', maxWidth: '680px' },
        card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1rem', color: 'var(--text)' },
        btn: { padding: '0.5rem 1.2rem', border: '1px solid var(--border)', borderRadius: '99px', background: 'none', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)', cursor: 'pointer' },
        btnPrimary: { padding: '0.5rem 1.4rem', border: 'none', borderRadius: '99px', background: 'var(--accent)', color: '#fff', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: 'pointer' },
        pill: (active) => ({ padding: '0.35rem 1rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', border: active ? 'none' : '1px solid var(--border)', background: active ? 'var(--accent)' : 'var(--bg-card)', color: active ? '#fff' : 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }),
        overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
        modal: { background: 'var(--bg-card)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' },
        input: { padding: '0.7rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '100%', background: 'var(--bg)', color: 'var(--text)' },
    }

    return (
        <div style={s.page}>
            <nav style={s.nav}>
                <span style={s.logo}>Cloze<span style={{ color: '#2a7c5a' }}>r</span></span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Hi, {user?.name}!</span>
                    <button style={s.btn} onClick={() => navigate('/profile')}>My Profile</button>
                    <button onClick={toggleTheme} style={{ ...s.btn, fontSize: '1.2rem', padding: '0.5rem 1rem' }}>
                        {dark ? '☀️' : '🌙'}
                    </button>
                    <button style={s.btn} onClick={handleLogout}>Log out</button>
                </div>
            </nav>

            <div style={s.layout}>
                <aside style={s.sidebar}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        <span>My Circles</span>
                        <button onClick={() => setShowCircleModal(true)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', width: 24, height: 24, cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}>+</button>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li onClick={() => setSelectedCircle('all')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer', background: selectedCircle === 'all' ? 'var(--bg)' : 'none', color: selectedCircle === 'all' ? 'var(--accent)' : 'var(--text-muted)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#888', flexShrink: 0 }}></span>
                            All circles
                        </li>
                        {circles.map(c => (
                            <li key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer', background: selectedCircle === c._id ? 'var(--bg)' : 'none', color: selectedCircle === c._id ? 'var(--accent)' : 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} onClick={() => setSelectedCircle(c._id)}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }}></span>
                                    {c.name}
                                </div>
                                <button onClick={() => { setActiveCircle(c); setShowMemberModal(true) }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}>manage</button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main style={s.feed}>
                    <div style={s.card}>
                        <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="What's on your mind?" maxLength={1000}
                            style={{ width: '100%', border: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', resize: 'none', minHeight: '80px', background: 'transparent', color: 'var(--text)' }} />
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Share to:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {circles.map(c => (
                                        <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer', padding: '0.3rem 0.7rem', border: selectedCirclesForPost.includes(c._id) ? `1px solid ${c.color}` : '1px solid var(--border)', borderRadius: '99px', color: selectedCirclesForPost.includes(c._id) ? c.color : 'var(--text-muted)', background: selectedCirclesForPost.includes(c._id) ? `${c.color}15` : 'none' }}>
                                            <input type="checkbox" style={{ display: 'none' }} checked={selectedCirclesForPost.includes(c._id)}
                                                onChange={e => setSelectedCirclesForPost(prev => e.target.checked ? [...prev, c._id] : prev.filter(id => id !== c._id))} />
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color }}></span>
                                            {c.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handlePost} style={s.btnPrimary}>Post</button>
                        </div>
                    </div>

                    {posts.map(post => (
                        <div key={post._id} style={s.card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColor(post.author.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 500, color: '#fff', flexShrink: 0 }}>
                                    {initials(post.author.name)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{post.author.name}</div>
                                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                                        {post.circles.map(c => (
                                            <span key={c._id} style={{ fontSize: '0.7rem', borderRadius: '99px', padding: '0.12rem 0.55rem', background: `${c.color}22`, color: c.color }}>{c.name}</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                    <div>{timeAgo(post.createdAt)}</div>
                                    {post.updatedAt !== post.createdAt && (
                                        <div style={{ fontSize: '0.72rem', fontStyle: 'italic' }}>edited {timeAgo(post.updatedAt)}</div>
                                    )}
                                </div>
                            </div>

                            {editingPost === post._id ? (
                                <div>
                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                                        style={{ ...s.input, minHeight: '80px', marginBottom: '0.5rem' }} />
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleSaveEdit(post._id)} style={s.btnPrimary}>Save</button>
                                        <button onClick={() => setEditingPost(null)} style={s.btn}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1rem' }}>{post.content}</div>
                            )}

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button onClick={() => handleLike(post._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    ♥ {post.likes.length}
                                </button>
                                <button onClick={() => setOpenComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    💬 {post.comments.length}
                                </button>
                                {post.author._id === user?._id && (
                                    <>
                                        <button onClick={() => handleEditPost(post)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✏️ Edit</button>
                                        <button onClick={() => handleDeletePost(post._id)} style={{ background: 'none', border: 'none', color: '#d85b5b', cursor: 'pointer' }}>🗑️ Delete</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </main>
            </div>

            {showCircleModal && (
                <div style={s.overlay} onClick={() => setShowCircleModal(false)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>New circle</h3>
                            <button onClick={() => setShowCircleModal(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}>✕</button>
                        </div>
                        <input value={circleName} onChange={e => setCircleName(e.target.value)} placeholder="Circle name" style={s.input} />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            {COLORS.map(color => (
                                <div key={color} onClick={() => setCircleColor(color)} style={{ width: 28, height: 28, borderRadius: '50%', background: color, cursor: 'pointer', border: circleColor === color ? '2px solid var(--text)' : '2px solid transparent', transform: circleColor === color ? 'scale(1.1)' : 'scale(1)', transition: '0.2s' }} />
                            ))}
                        </div>
                        <button onClick={handleCreateCircle} style={s.btnPrimary}>Create Circle</button>
                    </div>
                </div>
            )}

            {showMemberModal && activeCircle && (
                <div style={s.overlay} onClick={() => setShowMemberModal(false)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem' }}>Manage {activeCircle.name}</h3>
                            <button onClick={() => setShowMemberModal(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="Friend's email" style={s.input} />
                            <button onClick={handleAddMember} style={s.btnPrimary}>Add</button>
                        </div>
                        {memberError && <p style={{ color: '#d85b5b', fontSize: '0.8rem' }}>{memberError}</p>}
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {activeCircle.members.map(m => (
                                <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{m.name}</span>
                                    <button onClick={() => handleRemoveMember(m._id)} style={{ background: 'none', border: 'none', color: '#d85b5b', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleDeleteCircle} style={{ ...s.btn, color: '#d85b5b', borderColor: '#d85b5b', marginTop: '1rem' }}>Delete Circle</button>
                    </div>
                </div>
            )}
        </div>
    )
}