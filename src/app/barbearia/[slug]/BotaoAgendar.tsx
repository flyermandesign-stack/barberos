'use client'

import { useRouter } from 'next/navigation'

interface Props {
  slug: string
  servicoId: string
  logado: boolean
}

export default function BotaoAgendar({ slug, servicoId, logado }: Props) {
  const router = useRouter()

  function handleClick() {
    if (!logado) {
      router.push(`/login?next=/barbearia/${slug}/agendar?servico=${servicoId}`)
    } else {
      router.push(`/barbearia/${slug}/agendar?servico=${servicoId}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '0.45rem 1rem',
        borderRadius: '6px',
        border: '1px solid #b4913c',
        background: 'transparent',
        color: '#b4913c',
        fontSize: '0.72rem',
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}
    >
      Agendar
    </button>
  )
}