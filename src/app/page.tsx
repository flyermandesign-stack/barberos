import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('estabelecimentos')
    .select('nome, slug')

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>BarberOS — conexão Supabase</h1>
      {error && <p style={{ color: 'red' }}>Erro: {error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </main>
  )
}