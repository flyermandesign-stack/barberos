import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import AgendarForm from './AgendarForm'

interface Props {
  params: { slug: string }
  searchParams: { servico?: string }
}

export default async function AgendarPage({ params, searchParams }: Props) {
  const supabase = createClient()

  // Verifica se está logado
  const { data: { session } } = await supabase.auth.getSession()
  //if (!session) {
    //redirect(`/login?next=/barbearia/${params.slug}/agendar`)
  //}

  // Busca dados do estabelecimento
  const { data: estabelecimento } = await supabase
    .from('estabelecimentos')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!estabelecimento) notFound()

  // Busca serviços e barbeiros
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
      <div style={{ borderBottom: '1px solid #252525', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href={`/barbearia/${params.slug}`} style={{ color: '#5a5550', textDecoration: 'none', fontSize: '0.8rem' }}>← Voltar</a>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', letterSpacing: '2px', color: '#b4913c' }}>
          {estabelecimento.nome}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Agendar Horário</h1>
        <p style={{ color: '#5a5550', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2rem' }}>
          Escolha o serviço, barbeiro e horário
        </p>

        <AgendarForm
          slug={params.slug}
          estabelecimentoId={estabelecimento.id}
          servicos={servicos || []}
          barbeiros={barbeiros || []}
          servicoPreSelecionado={searchParams.servico}
clienteId={session?.user?.id || '7e5485f9-18f2-4992-b625-20499888500e'}        />
      </div>
    </main>
  )
}