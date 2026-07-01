-- ============================================================
-- Fix 1: clientes — policies de SELECT/UPDATE existiam mas eram
-- inalcancaveis porque faltava o GRANT de tabela para authenticated
-- (so havia GRANT INSERT). Sem esse grant, o Postgres nega o
-- acesso antes mesmo de avaliar a RLS.
-- ============================================================
GRANT SELECT, UPDATE ON TABLE clientes TO authenticated;

-- Permite que o dono da barbearia veja os dados (nome/telefone/email)
-- dos clientes que tem agendamento na sua barbearia. Sem essa policy,
-- o join clientes(nome, telefone, email) usado no painel admin
-- retornava null (mascarado pelo fallback 'Cliente' no front-end).
DROP POLICY IF EXISTS "donos_veem_clientes_da_barbearia" ON clientes;
CREATE POLICY "donos_veem_clientes_da_barbearia"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM agendamentos a
      JOIN estabelecimentos e ON e.id = a.estabelecimento_id
      WHERE a.cliente_id = clientes.id
        AND e.owner_email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- ============================================================
-- Fix 2: agendamentos — a policy "agendamentos_insert_anon" tinha
-- WITH CHECK (true), permitindo que qualquer requisicao (mesmo sem
-- login, so com a anon key) inserisse agendamentos com qualquer
-- cliente_id, contornando completamente a autenticacao da aplicacao.
-- A policy "cliente_gerencia_proprios_agendamentos" (auth.uid() =
-- cliente_id) ja cobre o caso legitimo de insercao por usuario
-- autenticado, entao a policy permissiva de anon pode ser removida.
-- ============================================================
DROP POLICY IF EXISTS "agendamentos_insert_anon" ON agendamentos;
REVOKE INSERT ON TABLE agendamentos FROM anon;
