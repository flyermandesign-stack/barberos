-- Garante que RLS está habilitado na tabela
ALTER TABLE estabelecimentos ENABLE ROW LEVEL SECURITY;

-- Remove policy conflitante se existir, para evitar erro de duplicata
DROP POLICY IF EXISTS "Leitura pública de estabelecimentos" ON estabelecimentos;

-- Cria policy de leitura pública (anon + authenticated)
CREATE POLICY "Leitura pública de estabelecimentos"
  ON estabelecimentos
  FOR SELECT
  USING (true);

-- Garante GRANT de SELECT para as roles do Supabase
GRANT SELECT ON TABLE estabelecimentos TO anon;
GRANT SELECT ON TABLE estabelecimentos TO authenticated;
