'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    setEnviado(true)
    setLoading(false)
  }

  return (
    <main style={{ background: '#080808', minHeight: '100vh', color: '#ede8e0', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '4px', color: '#b4913c', marginBottom: '0.25rem' }}>
            BARBER<span style={{ color: '#c8d0d8' }}>OS</span>
          </div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#5a5550' }}>
            Acesse sua conta
          </div>
        </div>

        {!enviado ? (
          <div style={{ background: '#181818', border: '1px solid #252525', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '1rem' }}>
              Seu email
            </div>
            <input
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #252525', background: '#111', color: '#ede8e0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
            />
            <button
              onClick={handleLogin}
              disabled={loading || !email}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: loading || !email ? '#3a3020' : '#b4913c', color: loading || !email ? '#6b5520' : '#080808', fontWeight: 700, fontSize: '0.85rem', cursor: loading || !email ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              {loading ? 'Enviando...' : 'Enviar link de acesso'}
            </button>
          </div>
        ) : (
          <div style={{ background: '#181818', border: '1px solid rgba(58,110,82,0.4)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Link enviado!</div>
            <div style={{ color: '#5a5550', fontSize: '0.8rem', lineHeight: 1.6 }}>
              Abrimos um link de acesso para<br />
              <span style={{ color: '#b4913c' }}>{email}</span><br />
              Clique no link para entrar.
            </div>
          </div>
        )}

      </div>
    </main>
  )
}