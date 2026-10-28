-- O que cada visitante do site olhou (ficha aberta, favorito, clique no
-- WhatsApp ou no telefone). Anonimo ate a pessoa mandar um formulario: ai o
-- visitante fica ligado ao contato e as visitas dele, antes e depois, aparecem
-- para o corretor (Meus leads, no CRM).
-- Ja aplicada no projeto remoto (migration site_visualizacoes_de_imoveis).
create table public.site_visitantes (
  visitante_id uuid not null,
  org_id uuid not null references public.orgs(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  ligado_em timestamptz,
  primeira_visita timestamptz not null default now(),
  ultima_visita timestamptz not null default now(),
  primary key (org_id, visitante_id)
);
create index site_visitantes_contato on public.site_visitantes(contact_id) where contact_id is not null;

create table public.imovel_visualizacoes (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.orgs(id) on delete cascade,
  visitante_id uuid not null,
  contact_id uuid references public.contacts(id) on delete cascade,
  imovel_id uuid references public.imoveis(id) on delete set null,
  imovel_codigo text not null,
  evento text not null check (evento in ('visualizou','favoritou','desfavoritou','whatsapp','telefone','formulario')),
  pagina text,
  created_at timestamptz not null default now()
);
create index imovel_visualizacoes_contato on public.imovel_visualizacoes(contact_id, created_at desc) where contact_id is not null;
create index imovel_visualizacoes_visitante on public.imovel_visualizacoes(org_id, visitante_id);

alter table public.site_visitantes enable row level security;
alter table public.imovel_visualizacoes enable row level security;

-- Quem ve o lead (regras de contacts, inclusive corretor so os seus) ve o que ele olhou.
create policy visualizacoes_de_quem_ve_o_lead on public.imovel_visualizacoes for select to authenticated
  using (contact_id is not null and exists (select 1 from public.contacts c where c.id = imovel_visualizacoes.contact_id));

-- Liga o visitante ao contato e passa as visitas anonimas dele para o lead.
create or replace function public.ligar_visitante_ao_contato(p_org_id uuid, p_visitante uuid, p_contact_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into site_visitantes (visitante_id, org_id, contact_id, ligado_em)
  values (p_visitante, p_org_id, p_contact_id, now())
  on conflict (org_id, visitante_id) do update set contact_id = excluded.contact_id, ligado_em = now(), ultima_visita = now();
  update imovel_visualizacoes set contact_id = p_contact_id
   where org_id = p_org_id and visitante_id = p_visitante and contact_id is distinct from p_contact_id;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.ligar_visitante_ao_contato(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.ligar_visitante_ao_contato(uuid, uuid, uuid) to service_role;

-- Resumo por lead: quantos imoveis viu e quando foi a ultima vez.
create or replace function public.interesse_no_site(p_contact_ids uuid[])
returns table(contact_id uuid, imoveis_vistos integer, favoritos integer, ultima_visita timestamptz, codigos text[])
language sql stable security invoker set search_path = public as $$
  select v.contact_id,
         count(distinct v.imovel_codigo) filter (where v.evento = 'visualizou')::integer,
         count(distinct v.imovel_codigo) filter (where v.evento = 'favoritou')::integer,
         max(v.created_at),
         (array_agg(distinct v.imovel_codigo))[1:30]
  from imovel_visualizacoes v
  where v.contact_id = any (p_contact_ids)
  group by v.contact_id
$$;
grant execute on function public.interesse_no_site(uuid[]) to authenticated;
