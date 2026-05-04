import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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

    async function handleLogout() {
        await logout()
        navigate('/')
    }

    const s = {
        page: { background: '#f4f3f0', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
        nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #e8e6e1', background: '#fafafa', position: 'sticky', top: 0, zIndex: 100 },
        logo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#0f0f0f', textDecoration: 'none' },
        layout: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 65px)' },
        sidebar: { background: '#fafafa', borderRight: '1px solid #e8e6e1', padding: '1.5rem' },
        feed: { padding: '2rem', maxWidth: '680px' },
        card: { background: '#fafafa', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1rem' },
        btn: { padding: '0.5rem 1.2rem', border: '1px solid #e8e6e1', borderRadius: '99px', background: 'none', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", color: '#5c5a55', cursor: 'pointer' },
        btnPrimary: { padding: '0.5rem 1.4rem', border: 'none', borderRadius: '99px', background: '#0f0f0f', color: '#fafafa', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: 'pointer' },
        pill: (active) => ({ padding: '0.35rem 1rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', border: active ? 'none' : '1px solid #e8e6e1', background: active ? '#0f0f0f' : '#fafafa', color: active ? '#fafafa' : '#5c5a55', fontFamily: "'DM Sans', sans-serif' " }),
        overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
        modal: { background: '#fafafa', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' },
        input: { padding: '0.7rem 1rem', border: '1px solid #e8e6e1', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '100%' },
    }

    return (
        <div style={s.page}>
            {/* NAV */}
            <nav style={s.nav}>
                <span style={s.logo}>Cloze<span style={{ color: '#2a7c5a' }}>r</span></span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', color: '#5c5a55' }}>Hi, {user?.name}!</span>
                    <button style={s.btn} onClick={() => navigate('/profile')}>My Profile</button>
                    <button style={s.btn} onClick={handleLogout}>Log out</button>
                </div>
            </nav>

            <div style={s.layout}>
                {/* SIDEBAR */}
                <aside style={s.sidebar}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9e9b94' }}>
                        <span>My Circles</span>
                        <button onClick={() => setShowCircleModal(true)} style={{ background: 'none', border: '1px solid #e8e6e1', borderRadius: '6px', width: 24, height: 24, cursor: 'pointer', fontSize: '1rem', color: '#5c5a55' }}>+</button>
                    </div>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li onClick={() => setSelectedCircle('all')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer', background: selectedCircle === 'all' ? '#e4f0ea' : 'none', color: selectedCircle === 'all' ? '#2a7c5a' : '#5c5a55' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#888', flexShrink: 0 }}></span>
                            All circles
                        </li>
                        {circles.map(c => (
                            <li key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer', background: selectedCircle === c._id ? '#e4f0ea' : 'none', color: selectedCircle === c._id ? '#2a7c5a' : '#5c5a55' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} onClick={() => setSelectedCircle(c._id)}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }}></span>
                                    {c.name}
                                </div>
                                <button onClick={() => { setActiveCircle(c); setShowMemberModal(true) }} style={{ background: 'none', border: 'none', color: '#9e9b94', fontSize: '0.72rem', cursor: 'pointer' }}>manage</button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* MAIN FEED */}
                <main style={s.feed}>
                    {/* Compose */}
                    <div style={s.card}>
                        <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="What's on your mind?" maxLength={1000}
                            style={{ width: '100%', border: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', resize: 'none', minHeight: '80px', background: 'transparent' }} />
                        <div style={{ borderTop: '1px solid #e8e6e1', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.78rem', color: '#9e9b94', fontWeight: 500, marginBottom: '0.5rem' }}>Share to:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {circles.map(c => (
                                        <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer', padding: '0.3rem 0.7rem', border: selectedCirclesForPost.includes(c._id) ? `1px solid ${c.color}` : '1px solid #e8e6e1', borderRadius: '99px', color: selectedCirclesForPost.includes(c._id) ? c.color : '#5c5a55', background: selectedCirclesForPost.includes(c._id) ? `${c.color}15` : 'none' }}>
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

                    {/* Filter pills */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <button style={s.pill(selectedCircle === 'all')} onClick={() => setSelectedCircle('all')}>All circles</button>
                        {circles.map(c => (
                            <button key={c._id} style={s.pill(selectedCircle === c._id)} onClick={() => setSelectedCircle(c._id)}>{c.name}</button>
                        ))}
                    </div>

                    {/* Posts */}
                    {posts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9e9b94' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#5c5a55' }}>Nothing here yet</h3>
                            <p>Create a circle and post something!</p>
                        </div>
                    )}

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
                                <div style={{ fontSize: '0.78rem', color: '#9e9b94' }}>{timeAgo(post.createdAt)}</div>
                            </div>

                            <div style={{ fontSize: '0.92rem', color: '#5c5a55', lineHeight: 1.65, fontWeight: 300, marginBottom: '1rem' }}>{post.content}</div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button onClick={() => handleLike(post._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#9e9b94', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                                    ♥ {post.likes.length}
                                </button>
                                <button onClick={() => setOpenComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#9e9b94', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                                    💬 {post.comments.length}
                                </button>
                            </div>

                            {openComments[post._id] && (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid #e8e6e1', paddingTop: '0.85rem' }}>
                                    {post.comments.map((c, i) => (
                                        <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                            <strong>{c.author?.name}</strong>: {c.text}
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        <input value={commentTexts[post._id] || ''} onChange={e => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                                            placeholder="Add a comment..." style={{ flex: 1, border: '1px solid #e8e6e1', borderRadius: '99px', padding: '0.4rem 0.9rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', outline: 'none' }} />
                                        <button onClick={() => handleComment(post._id)} style={{ background: '#2a7c5a', color: '#fff', border: 'none', borderRadius: '99px', padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>Send</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </main>
            </div>

            {/* NEW CIRCLE MODAL */}
            {showCircleModal && (
                <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowCircleModal(false)}>
                    <div style={s.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>New circle</h3>
                            <button onClick={() => setShowCircleModal(false)} style={{ background: 'none', border: '1px solid #e8e6e1', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c5a55' }}>Circle name</label>
                            <input value={circleName} onChange={e => setCircleName(e.target.value)} placeholder="e.g. Close Friends" style={s.input} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c5a55' }}>Color</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {COLORS.map(color => (
                                    <div key={color} onClick={() => setCircleColor(color)} style={{ width: 28, height: 28, borderRadius: '50%', background: color, cursor: 'pointer', border: circleColor === color ? '2px solid #0f0f0f' : '2px solid transparent', transform: circleColor === color ? 'scale(1.15)' : 'scale(1)', transition: '0.15s' }} />
                                ))}
                            </div>
                        </div>
                        <button onClick={handleCreateCircle} style={{ ...s.btnPrimary, padding: '0.85rem', borderRadius: '99px', width: '100%' }}>Create circle</button>
                    </div>
                </div>
            )}

            {/* MANAGE MEMBERS MODAL */}
            {showMemberModal && activeCircle && (
                <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowMemberModal(false)}>
                    <div style={s.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Manage: {activeCircle.name}</h3>
                            <button onClick={() => setShowMemberModal(false)} style={{ background: 'none', border: '1px solid #e8e6e1', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ background: '#e4f0ea', borderRadius: '10px', padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#2a7c5a' }}>
                            {activeCircle.members.length} member{activeCircle.members.length !== 1 ? 's' : ''} in this circle
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c5a55' }}>Add member by email</label>
                            <input value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="friend@example.com" style={s.input} />
                        </div>
                        {memberError && <div style={{ background: '#fde8e8', color: '#c44b4b', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{memberError}</div>}
                        <button onClick={handleAddMember} style={{ ...s.btnPrimary, padding: '0.85rem', borderRadius: '99px', width: '100%' }}>Add member</button>

                        {activeCircle.members.length > 0 && (
                            <div>
                                <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9e9b94', marginBottom: '0.5rem' }}>Members</p>
                                {activeCircle.members.map(m => (
                                    <div key={m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #e8e6e1' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(m.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 500, color: '#fff' }}>{initials(m.name)}</div>
                                            <div>
                                                <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{m.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#9e9b94' }}>{m.email}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveMember(m._id)} style={{ background: 'none', border: 'none', color: '#c44b4b', fontSize: '0.8rem', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={handleDeleteCircle} style={{ padding: '0.7rem', border: '1px solid #f5c5c5', borderRadius: '99px', background: 'none', color: '#c44b4b', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', width: '100%' }}>
                            Delete this circle
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
