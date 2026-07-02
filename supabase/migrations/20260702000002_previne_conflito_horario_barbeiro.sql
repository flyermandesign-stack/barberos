-- Nao existia nenhuma trava no banco contra dois agendamentos com o
-- mesmo barbeiro em horarios sobrepostos -- so havia um indice comum
-- (idx_agendamentos_barbeiro_inicio), que ajuda em performance mas nao
-- impede duplicatas. btree_gist permite usar "=" (igualdade) dentro de
-- um indice GiST, necessario para combinar barbeiro_id com overlap de
-- intervalo na mesma EXCLUDE constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- So considera conflito para agendamentos ativos (pendente/confirmado).
-- Agendamentos cancelados ou concluidos nao devem bloquear o horario.
-- Usa intervalo semiaberto [inicio, fim) para que um agendamento que
-- termina as 10:00 nao conflite com outro que comeca as 10:00.
ALTER TABLE agendamentos
  ADD CONSTRAINT agendamentos_sem_conflito_barbeiro
  EXCLUDE USING gist (
    barbeiro_id WITH =,
    tstzrange(inicio, fim, '[)') WITH &&
  )
  WHERE (status IN ('pendente', 'confirmado'));
