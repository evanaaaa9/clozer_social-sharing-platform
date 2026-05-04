import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Landing() {
    const { user } = useAuth()
    if (user) return <Navigate to="/dashboard" />

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#fafafa' }}>

            {/* NAV */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', borderBottom: '1px solid #e8e6e1', background: '#fafafa', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: '#0f0f0f' }}>
                    Cloze<span style={{ color: '#2a7c5a' }}>r</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/login" style={{ padding: '0.5rem 1.2rem', border: '1px solid #e8e6e1', borderRadius: '99px', textDecoration: 'none', fontSize: '0.88rem', color: '#5c5a55' }}>Log in</Link>
                    <Link to="/register" style={{ padding: '0.5rem 1.4rem', border: 'none', borderRadius: '99px', background: '#0f0f0f', color: '#fafafa', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Get started</Link>
                </div>
            </nav>

            {/* HERO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '4rem', padding: '6rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e4f0ea', color: '#2a7c5a', fontSize: '0.8rem', fontWeight: 500, padding: '0.3rem 0.9rem', borderRadius: '99px', marginBottom: '1.5rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2a7c5a', display: 'inline-block' }}></span>
                        Circle-based social sharing
                    </div>
                    <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '3.6rem', lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: '1.5rem' }}>
                        Share with the people who <em style={{ color: '#2a7c5a' }}>matter.</em>
                    </h1>
                    <p style={{ fontSize: '1.05rem', color: '#5c5a55', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 300 }}>
                        Create private circles and share posts only with the people you choose. No algorithms. No noise. Just intentional sharing.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/register" style={{ padding: '0.85rem 2rem', borderRadius: '99px', background: '#0f0f0f', color: '#fafafa', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>
                            Create your first circle
                        </Link>
                        <span style={{ fontSize: '0.88rem', color: '#5c5a55' }}>No account needed to explore →</span>
                    </div>
                </div>

                {/* Circle Visual */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 300, height: 300, position: 'relative' }}>
                        {[300, 220, 140].map((size, i) => (
                            <div key={i} style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: '1px dashed #e8e6e1', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                        ))}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 70, height: 70, borderRadius: '50%', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fafafa', fontFamily: "'DM Serif Display', serif", fontSize: '1rem', zIndex: 5, boxShadow: '0 0 0 8px #fafafa, 0 0 0 9px #e8e6e1' }}>You</div>
                        {[
                            { label: 'A', color: '#2a7c5a', top: '10%', left: '50%' },
                            { label: 'R', color: '#5b4fd8', top: '50%', left: '8%' },
                            { label: 'M', color: '#d85b5b', top: '85%', left: '50%' },
                            { label: 'S', color: '#c47d1a', top: '50%', left: '88%' },
                            { label: 'J', color: '#1a7fb5', top: '15%', left: '25%' },
                            { label: 'K', color: '#a854a8', top: '15%', left: '72%' },
                        ].map((av, i) => (
                            <div key={i} style={{ position: 'absolute', width: 38, height: 38, borderRadius: '50%', background: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 500, top: av.top, left: av.left, transform: 'translate(-50%, -50%)' }}>{av.label}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <div style={{ padding: '5rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2a7c5a', marginBottom: '0.75rem' }}>How it works</div>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', marginBottom: '3rem' }}>Three steps to intentional sharing</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    {[
                        { num: '01', title: 'Create a circle', desc: 'Group people the way you think about them — close friends, family, colleagues.' },
                        { num: '02', title: 'Post with control', desc: 'Every post lets you choose exactly which circles can see it.' },
                        { num: '03', title: 'Stay connected', desc: 'Your circles see only what you share. Meaningful updates, not endless noise.' },
                    ].map(step => (
                        <div key={step.num} style={{ padding: '2rem', border: '1px solid #e8e6e1', borderRadius: '16px' }}>
                            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#e8e6e1', marginBottom: '1rem' }}>{step.num}</div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>{step.title}</h3>
                            <p style={{ fontSize: '0.88rem', color: '#5c5a55', lineHeight: 1.6, fontWeight: 300 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div style={{ background: '#0f0f0f', padding: '6rem 3rem', textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '3rem', color: '#fafafa', marginBottom: '1rem' }}>
                    Ready to get <em style={{ color: '#4daa80' }}>closer?</em>
                </h2>
                <p style={{ color: '#888', fontSize: '1rem', marginBottom: '2.5rem', fontWeight: 300 }}>Join thousands sharing intentionally.</p>
                <Link to="/register" style={{ padding: '0.9rem 2.5rem', borderRadius: '99px', background: '#fafafa', color: '#0f0f0f', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>
                    Create your account — it's free
                </Link>
            </div>

            {/* FOOTER */}
            <footer style={{ borderTop: '1px solid #e8e6e1', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem' }}>Cloze<span style={{ color: '#2a7c5a' }}>r</span></div>
                <p style={{ fontSize: '0.82rem', color: '#9e9b94' }}>© 2025 Clozer. All rights reserved.</p>
            </footer>

        </div>
    )
}