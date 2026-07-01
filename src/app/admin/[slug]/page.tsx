import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export default async function AdminPage({ params }: Props) {
  const supabase = createClient()

  // Verifica sessão
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin/' + params.slug)

  // Busca estabelecimento
  const { data: estabelecimento } = await supabase
    .from('estabelecimentos')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!estabelecimento) notFound()

  // Verifica se é o dono
  if (estabelecimento.owner_email !== user.email) {
    redirect('/')
  }

  // Busca agendamentos de hoje
  const hoje = new Date()
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()

  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select(`
      *,
      barbeiros(nome),
      servicos(nome, preco),
      clientes(nome, telefone, email)
    `)
    .eq('estabelecimento_id', estabelecimento.id)
    .gte('inicio', inicioHoje)
    .lt('inicio', fimHoje)
    .order('inicio')

  // Busca próximos agendamentos (próximos 7 dias)
  const proximos = await supabase
    .from('agendamentos')
    .select(`
      *,
      barbeiros(nome),
      servicos(nome, preco),
      clientes(nome, telefone, email)
    `)
    .eq('estabelecimento_id', estabelecimento.id)
    .gte('inicio', fimHoje)
    .order('inicio')
    .limit(10)

  function formatHora(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  function formatData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
  }

  const totalHoje = agendamentos?.reduce((acc, a) => acc + Number(a.valor_cobrado), 0) || 0

  return (
    <main style={{ background: '#080808', minHeight: '100vh', color: '#ede8e0', fontFamily: 'Inter, sans-serif' }}>

      {/* HEADER */}
      <div style={{ borderBottom: '1px solid #252525', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,8,0.96)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', letterSpacing: '4px', color: '#b4913c' }}>
          BARBER<span style={{ color: '#c8d0d8' }}>OS</span>
          <span style={{ color: '#252525', margin: '0 0.75rem' }}>|</span>
          <span style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#5a5550' }}>{estabelecimento.nome}</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#5a5550' }}>Admin · {user.email}</div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 2rem' }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ background: '#181818', border: '1px solid #252525', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#5a5550', marginBottom: '0.4rem' }}>Hoje</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#ede8e0' }}>{agendamentos?.length || 0}</div>
            <div style={{ fontSize: '0.65rem', color: '#b4913c', marginTop: '0.25rem' }}>agendamentos</div>
          </div>
          <div style={{ background: '#181818', border: '1px solid #252525', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#5a5550', marginBottom: '0.4rem' }}>Faturamento</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#ede8e0' }}>R$ {totalHoje.toFixed(0)}</div>
            <div style={{ fontSize: '0.65rem', color: '#b4913c', marginTop: '0.25rem' }}>hoje</div>
          </div>
          <div style={{ background: '#181818', border: '1px solid #252525', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#5a5550', marginBottom: '0.4rem' }}>Próximos</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#ede8e0' }}>{proximos.data?.length || 0}</div>
            <div style={{ fontSize: '0.65rem', color: '#b4913c', marginTop: '0.25rem' }}>agendamentos</div>
          </div>
        </div>

        {/* AGENDA DE HOJE */}
        <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Agenda de Hoje
          <span style={{ flex: 1, height: '1px', background: '#252525', display: 'inline-block' }}></span>
        </div>

        {agendamentos?.length === 0 ? (
          <div style={{ background: '#181818', border: '1px solid #252525', borderRadius: '10px', padding: '2rem', textAlign: 'center', color: '#5a5550', marginBottom: '2rem' }}>
            Nenhum agendamento para hoje
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {agendamentos?.map(a => (
              <div key={a.id} style={{ background: '#181818', border: '1px solid #252525', borderRadius: '10px', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#b4913c', width: '52px', flexShrink: 0 }}>
                  {formatHora(a.inicio)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.clientes?.nome || a.clientes?.email || 'Cliente'}</div>
                  <div style={{ color: '#5a5550', fontSize: '0.7rem' }}>{a.servicos?.nome} · {a.barbeiros?.nome}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#b4913c', fontWeight: 700, fontSize: '0.85rem' }}>R$ {Number(a.valor_cobrado).toFixed(2)}</div>
                  <div style={{ fontSize: '0.65rem', color: '#5a5550', marginTop: '0.15rem' }}>{a.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRÓXIMOS */}
        {(proximos.data?.length || 0) > 0 && (
          <>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              Próximos Agendamentos
              <span style={{ flex: 1, height: '1px', background: '#252525', display: 'inline-block' }}></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {proximos.data?.map(a => (
                <div key={a.id} style={{ background: '#181818', border: '1px solid #252525', borderRadius: '10px', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flexShrink: 0, textAlign: 'center', width: '64px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#5a5550' }}>{formatData(a.inicio)}</div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#b4913c' }}>{formatHora(a.inicio)}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.clientes?.nome || a.clientes?.email || 'Cliente'}</div>
                    <div style={{ color: '#5a5550', fontSize: '0.7rem' }}>{a.servicos?.nome} · {a.barbeiros?.nome}</div>
                  </div>
                  <div style={{ color: '#b4913c', fontWeight: 700, fontSize: '0.85rem' }}>R$ {Number(a.valor_cobrado).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </main>
  )
}