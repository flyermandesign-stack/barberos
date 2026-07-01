import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BotaoAgendar from './BotaoAgendar'

interface Props {
  params: { slug: string }
}

export default async function BarbeariePage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: estabelecimento, error } = await supabase
    .from('estabelecimentos')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Supabase error: ${error.message}`)
  }

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
    <main style={{ background: '#080808', minHeight: '100vh', color: '#ede8e0', fontFamily: 'Inter, sans-serif' }}>

      <div style={{ position: 'relative', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0808 100%)', padding: '3rem 2rem 2rem', borderBottom: '1px solid #252525' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '24px', height: '1px', background: '#b4913c', display: 'inline-block' }}></span>
            São José dos Campos · SP
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: 700, color: '#ede8e0', lineHeight: 1.1, letterSpacing: '1px', marginBottom: '0.5rem' }}>
            {estabelecimento.nome}
          </h1>
          <p style={{ color: '#5a5550', fontSize: '0.8rem', letterSpacing: '1px' }}>
            {estabelecimento.endereco}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>

        <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Serviços
          <span style={{ flex: 1, height: '1px', background: '#252525', display: 'inline-block' }}></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {servicos?.map(s => (
            <div key={s.id} style={{ background: '#181818', border: '1px solid #252525', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{s.nome}</div>
                <div style={{ color: '#5a5550', fontSize: '0.7rem' }}>{s.duracao_min} min · {s.descricao}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#b4913c', fontWeight: 700, fontSize: '0.95rem' }}>R$ {Number(s.preco).toFixed(2)}</span>
                <BotaoAgendar
                  slug={params.slug}
                  servicoId={s.id}
                  logado={!!user}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Barbeiros
          <span style={{ flex: 1, height: '1px', background: '#252525', display: 'inline-block' }}></span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {barbeiros?.map(b => (
            <div key={b.id} style={{ background: '#181818', border: '1px solid #252525', borderRadius: '10px', padding: '1.25rem 1rem', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(180,145,60,0.1)', border: '1px solid rgba(180,145,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontWeight: 700, color: '#b4913c', fontSize: '0.9rem' }}>
                {b.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ede8e0' }}>{b.nome}</div>
              <div style={{ fontSize: '0.65rem', color: '#5a5550', marginTop: '0.25rem' }}>
                {b.especialidades?.join(' · ')}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}