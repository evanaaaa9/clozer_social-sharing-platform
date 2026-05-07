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
  const [selectedCircle, setSelectedCircle] = useState('all') // 'all' or circleId
  const [postContent, setPostContent] = useState('')
  const [showCircleModal, setShowCircleModal] = useState(false)
  const [circleName, setCircleName] = useState('')
  const [circleColor, setCircleColor] = useState('#2a7c5a')
  const [now, setNow] = useState(Date.now())

  // 1. Initial Load and Auto-Refresh Logic
  useEffect(() => { loadCircles() }, [])
  useEffect(() => {
    loadFeed()
    const interval = setInterval(() => {
      setNow(Date.now()) // Refresh timers
      loadFeed()         // Refresh content
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
    if (selectedCircle === 'all') return alert('Enter a specific circle to whisper!')

    await axios.post('/api/posts', {
      content: postContent,
      circles: [selectedCircle] // WhatsApp style: Post to the active room
    })
    setPostContent('')
    loadFeed()
  }

  async function handleLike(postId) {
    await axios.post(`/api/posts/${postId}/like`)
    loadFeed()
  }

  async function handleCreateCircle() {
    if (!circleName.trim()) return
    await axios.post('/api/circles', { name: circleName, color: circleColor })
    setCircleName('')
    setShowCircleModal(false)
    loadCircles()
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  // Styles
  const s = {
    page: { background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', transition: '0.3s', fontFamily: "'DM Sans', sans-serif" },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 100 },
    layout: { display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 65px)' },
    sidebar: { background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '1.5rem' },
    feed: { padding: '2rem', maxWidth: '700px', margin: '0 auto', width: '100%' },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem' },
    inputArea: { width: '100%', border: 'none', background: 'var(--bg)', color: 'var(--text)', padding: '1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none', resize: 'none', marginBottom: '1rem' },
    btnPrimary: { padding: '0.6rem 1.5rem', borderRadius: '99px', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' },
    roomHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }
  }

  const currentCircle = circles.find(c => c._id === selectedCircle)

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem' }}>Cloze<span style={{ color: 'var(--accent)' }}>r</span></span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>{dark ? '☀️' : '🌙'}</button>
          <button style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer' }} onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Circles</span>
            <button onClick={() => setShowCircleModal(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}>+ New</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li onClick={() => setSelectedCircle('all')} style={{ padding: '0.8rem', borderRadius: '10px', cursor: 'pointer', background: selectedCircle === 'all' ? 'var(--bg)' : 'transparent', color: selectedCircle === 'all' ? 'var(--accent)' : 'var(--text-muted)', marginBottom: '5px' }}>
              🌍 Global Feed
            </li>
            {circles.map(c => (
              <li key={c._id} onClick={() => setSelectedCircle(c._id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.8rem', borderRadius: '10px', cursor: 'pointer', background: selectedCircle === c._id ? 'var(--bg)' : 'transparent', marginBottom: '5px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                <span style={{ color: selectedCircle === c._id ? 'var(--text)' : 'var(--text-muted)' }}>{c.name}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main style={s.feed}>
          {/* Room Header */}
          <div style={s.roomHeader}>
            <div style={{ width: 15, height: 15, borderRadius: '50%', background: selectedCircle === 'all' ? '#888' : currentCircle?.color }} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
              {selectedCircle === 'all' ? 'Everything' : currentCircle?.name}
            </h2>
          </div>

          {/* Whisper Input - WhatsApp Style */}
          {selectedCircle !== 'all' ? (
            <div style={s.card}>
              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                placeholder={`Whisper to ${currentCircle?.name}...`}
                style={s.inputArea}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handlePost} style={s.btnPrimary}>Send Whisper</button>
              </div>
            </div>
          ) : (
            <div style={{ ...s.card, textAlign: 'center', borderStyle: 'dashed', opacity: 0.6 }}>
              <p>Enter a specific circle to whisper.</p>
            </div>
          )}

          {/* Feed */}
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
              <div style={{ fontSize: '3rem' }}>🤫</div>
              <p>The silence is loud. Say something.</p>
            </div>
          ) : (
            posts.map(post => {
              const expiresAt = post.expiresAt ? new Date(post.expiresAt) : new Date(new Date(post.createdAt).getTime() + 10 * 60000);
              const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
              const m = Math.floor(secondsLeft / 60);
              const s_left = secondsLeft % 60;

              return (
                <div key={post._id} style={{ ...s.card, borderLeft: `4px solid ${post.circles[0]?.color || '#888'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: 6, height: 6, background: '#ff4b4b', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                      LIVE WHISPER
                    </div>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 'bold', color: secondsLeft < 60 ? '#ff4b4b' : 'var(--text-muted)' }}>
                      VANISH IN {m}:{s_left < 10 ? '0' : ''}{s_left}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(post.author.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem' }}>
                      {initials(post.author.name)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{post.author.name}</span>
                  </div>

                  <div style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{post.content}</div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
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

      {/* Simple Circle Modal */}
      {showCircleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '20px', width: '350px' }}>
            <h3>New Circle</h3>
            <input value={circleName} onChange={e => setCircleName(e.target.value)} placeholder="Name" style={{ ...s.inputArea, background: 'var(--bg)' }} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', justifyContent: 'center' }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setCircleColor(c)} style={{ width: 25, height: 25, borderRadius: '50%', background: c, border: circleColor === c ? '3px solid white' : 'none', cursor: 'pointer' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCreateCircle} style={{ ...s.btnPrimary, flex: 1 }}>Create</button>
              <button onClick={() => setShowCircleModal(false)} style={{ ...s.btnPrimary, flex: 1, background: '#444' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
                @keyframes pulse {
                    0% { opacity: 0.4; }
                    50% { opacity: 1; }
                    100% { opacity: 0.4; }
                }
            `}</style>
    </div>
  )
}