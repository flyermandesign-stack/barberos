import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export default async function BarbeariePage({ params }: Props) {
  const supabase = createClient()

  const { data: estabelecimento } = await supabase
    .from('estabelecimentos')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!estabelecimento) notFound()

  const { data: servicos } = await supabase
    .from('servicos')
    .select('*')
    .eq('estabelecimento_id', estabelecimento.id)
    .eq('ativo', true)

  const { data: barbeiros } = await supabase
    .from('barbeiros')
    .select('*')
    .eq('estabelecimento_id', estabelecimento.id)
    .eq('ativo', true)

  return (
    <main style={{ background: '#080808', minHeight: '100vh', color: '#ede8e0', fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
      <h1 style={{ color: '#b4913c', fontSize: '2rem', marginBottom: '0.25rem' }}>{estabelecimento.nome}</h1>
      <p style={{ color: '#5a5550', fontSize: '0.85rem', marginBottom: '2rem' }}>{estabelecimento.endereco}</p>

      <h2 style={{ color: '#b4913c', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>Serviços</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        {servicos?.map(s => (
          <div key={s.id} style={{ background: '#181818', border: '1px solid #252525', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{s.nome}</div>
              <div style={{ color: '#5a5550', fontSize: '0.75rem' }}>{s.duracao_min} min</div>
            </div>
            <div style={{ color: '#b4913c', fontWeight: 700 }}>R$ {Number(s.preco).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <h2 style={{ color: '#b4913c', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>Barbeiros</h2>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {barbeiros?.map(b => (
          <div key={b.id} style={{ background: '#181818', border: '1px solid #252525', borderRadius: '8px', padding: '1rem', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,145,60,0.1)', border: '1px solid rgba(180,145,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: 700, color: '#b4913c' }}>
              {b.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{b.nome}</div>
          </div>
        ))}
      </div>
    </main>
  )
}