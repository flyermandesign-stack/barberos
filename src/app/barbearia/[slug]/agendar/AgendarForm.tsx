'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Servico {
  id: string
  nome: string
  preco: number
  duracao_min: number
  descricao: string
}

interface Barbeiro {
  id: string
  nome: string
  especialidades: string[]
}

interface Props {
  slug: string
  estabelecimentoId: string
  servicos: Servico[]
  barbeiros: Barbeiro[]
  servicoPreSelecionado?: string
  clienteId: string
}

export default function AgendarForm({ slug, estabelecimentoId, servicos, barbeiros, servicoPreSelecionado, clienteId }: Props) {
  const router = useRouter()
  const [servicoId, setServicoId] = useState(servicoPreSelecionado || '')
  const [barbeiroId, setBarbeiroId] = useState('')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const servico = servicos.find(s => s.id === servicoId)

  // Gera horários disponíveis das 08:00 às 18:00
  const horarios = []
  for (let h = 8; h < 18; h++) {
    horarios.push(`${String(h).padStart(2, '0')}:00`)
    horarios.push(`${String(h).padStart(2, '0')}:30`)
  }

  async function confirmar() {
    if (!servicoId || !barbeiroId || !data || !horario || !servico) return
    setLoading(true)

    const inicio = new Date(`${data}T${horario}:00`)
    const fim = new Date(inicio.getTime() + servico.duracao_min * 60000)

    const supabase = createClient()
    const { error } = await supabase.from('agendamentos').insert({
      estabelecimento_id: estabelecimentoId,
      barbeiro_id: barbeiroId,
      servico_id: servicoId,
      cliente_id: clienteId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      valor_cobrado: servico.preco,
      status: 'confirmado',
    })

    setLoading(false)
    if (!error) setSucesso(true)
  }

  if (sucesso) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(58,110,82,0.12)', border: '1px solid rgba(58,110,82,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1.5rem' }}>✓</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>Agendado!</div>
        <div style={{ color: '#5a5550', fontSize: '0.8rem', marginBottom: '2rem' }}>Seu horário está confirmado</div>
        <div style={{ background: 'rgba(180,145,60,0.04)', border: '1px solid rgba(180,145,60,0.3)', borderRadius: '10px', padding: '1.25rem', maxWidth: '320px', margin: '0 auto 2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #252525', fontSize: '0.78rem' }}>
            <span style={{ color: '#5a5550' }}>Serviço</span>
            <span style={{ fontWeight: 600 }}>{servico?.nome}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #252525', fontSize: '0.78rem' }}>
            <span style={{ color: '#5a5550' }}>Data</span>
            <span style={{ fontWeight: 600 }}>{data} às {horario}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.78rem' }}>
            <span style={{ color: '#5a5550' }}>Total</span>
            <span style={{ fontWeight: 600, color: '#b4913c' }}>R$ {Number(servico?.preco).toFixed(2)}</span>
          </div>
        </div>
        <button onClick={() => router.push(`/barbearia/${slug}`)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #252525', background: 'transparent', color: '#ede8e0', cursor: 'pointer', fontSize: '0.8rem' }}>
          Voltar para a barbearia
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* SERVIÇO */}
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Serviço <span style={{ flex: 1, height: '1px', background: '#252525', display: 'inline-block' }}></span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {servicos.map(s => (
            <div key={s.id} onClick={() => setServicoId(s.id)} style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: `1px solid ${servicoId === s.id ? 'rgba(180,145,60,0.5)' : '#252525'}`, background: servicoId === s.id ? 'rgba(180,145,60,0.05)' : '#111', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.nome}</div>
                <div style={{ color: '#5a5550', fontSize: '0.7rem' }}>{s.duracao_min} min</div>
              </div>
              <span style={{ color: '#b4913c', fontWeight: 700 }}>R$ {Number(s.preco).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BARBEIRO */}
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Barbeiro <span style={{ flex: 1, height: '1px', background: '#252525', display: 'inline-block' }}></span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {barbeiros.map(b => (
            <div key={b.id} onClick={() => setBarbeiroId(b.id)} style={{ padding: '0.9rem 0.75rem', borderRadius: '8px', border: `1px solid ${barbeiroId === b.id ? 'rgba(180,145,60,0.5)' : '#252525'}`, background: barbeiroId === b.id ? 'rgba(180,145,60,0.05)' : '#111', cursor: 'pointer', textAlign: 'center', minWidth: '100px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(180,145,60,0.1)', border: '1px solid rgba(180,145,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: 700, color: '#b4913c', fontSize: '0.75rem' }}>
                {b.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{b.nome}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DATA */}
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Data <span style={{ flex: 1, height: '1px', background: '#252525', display: 'inline-block' }}></span>
        </div>
        <input type="date" value={data} onChange={e => setData(e.target.value)} min={new Date().toISOString().split('T')[0]}
          style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #252525', background: '#111', color: '#ede8e0', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
      </div>

      {/* HORÁRIO */}
      {data && (
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#b4913c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Horário <span style={{ flex: 1, height: '1px', background: '#252525', display: 'inline-block' }}></span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {horarios.map(h => (
              <div key={h} onClick={() => setHorario(h)} style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', border: `1px solid ${horario === h ? '#b4913c' : '#252525'}`, background: horario === h ? 'rgba(180,145,60,0.06)' : '#111', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: horario === h ? '#b4913c' : '#ede8e0' }}>
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRMAR */}
      {servicoId && barbeiroId && data && horario && (
        <button onClick={confirmar} disabled={loading} style={{ padding: '0.85rem', borderRadius: '8px', border: 'none', background: loading ? '#3a3020' : '#b4913c', color: loading ? '#6b5520' : '#080808', fontWeight: 700, fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.5rem' }}>
          {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
        </button>
      )}
    </div>
  )
}