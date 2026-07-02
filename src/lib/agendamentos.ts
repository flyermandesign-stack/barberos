// Status que contam como agendamento ativo (ocupam horario, entram em
// contagens/faturamento). Precisa ficar em sincronia com a constraint de
// exclusao no banco (20260702000002_previne_conflito_horario_barbeiro.sql).
export const STATUS_ATIVOS = ['pendente', 'confirmado'] as const
