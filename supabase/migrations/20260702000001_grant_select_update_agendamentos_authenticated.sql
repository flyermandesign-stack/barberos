-- authenticated so tinha GRANT INSERT em agendamentos. Sem SELECT/UPDATE,
-- as policies de RLS que dependem desses comandos (agendamentos_leitura_publica
-- para SELECT, cliente_gerencia_proprios_agendamentos para UPDATE) ficavam
-- inalcancaveis para usuarios logados -- o Postgres nega o acesso antes mesmo
-- de avaliar a RLS. Isso fazia o painel admin (rodando como authenticated)
-- receber sempre data: null ao consultar agendamentos, zerando os cards
-- "Hoje" e "Proximos" silenciosamente.
GRANT SELECT, UPDATE ON TABLE agendamentos TO authenticated;
