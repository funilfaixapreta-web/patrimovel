-- Endereços que caíram na página "não encontrada" do site, para achar e
-- corrigir links que chegam de fora (WhatsApp, Google, portais).
-- O navegador só grava (sem ler); a equipe consulta pelo SQL ou pelo painel.

create table public.site_nao_encontradas (
  id bigint generated always as identity primary key,
  caminho text not null check (char_length(caminho) between 1 and 500),
  referencia text check (char_length(referencia) <= 500),
  criado_em timestamptz not null default now()
);
create index site_nao_encontradas_criado_idx on public.site_nao_encontradas (criado_em desc);

alter table public.site_nao_encontradas enable row level security;
revoke all on public.site_nao_encontradas from anon, authenticated;
grant insert (caminho, referencia) on public.site_nao_encontradas to anon, authenticated;
create policy site_nao_encontradas_grava on public.site_nao_encontradas for insert to anon, authenticated
  with check (true);

-- Limpeza: guarda só 90 dias.
select cron.schedule('site-nao-encontradas-limpeza', '45 9 * * *',
  $$delete from public.site_nao_encontradas where criado_em < now() - interval '90 days'$$);
