-- Backend do site da Patrimóvel ADM, no mesmo projeto Supabase do CRM.
--
-- Conta do anunciante: Supabase Auth (e-mail e senha). O anunciante NÃO tem
-- linha em public.users, então current_org_id() volta nulo e nenhuma regra do
-- CRM libera dado para ele. Ele só enxerga o próprio perfil e os próprios anúncios.
--
-- Fluxo do anúncio:
--   rascunho -> (site_enviar_anuncio) -> em_aprovacao: cria o imóvel no CRM
--   como "inativo", sem portais, com origem = 'site', e avisa o gestor.
--   Equipe muda o imóvel para "disponivel" no CRM -> anúncio "ativo" e o imóvel
--   ganha o portal "site" (aparece na vitrine).
--   Equipe exclui o imóvel no CRM enquanto está em aprovação -> anúncio "recusado".
--   Imóvel sai de "disponivel" no CRM -> anúncio "pausado" (pela equipe).
--   Termo vencido -> pausado (pelo termo) até o anunciante renovar.

-- ---------- Orgs com site público ----------

alter table public.orgs add column if not exists site_publico boolean not null default false;
comment on column public.orgs.site_publico is 'Org aceita conta de anunciante e leads do site público (site-leads).';
update public.orgs set site_publico = true where id = '284ccccb-2ea3-464b-a89f-8185b732b38f'; -- Patrimóvel

create or replace function public.site_org_aceita(p_org uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.orgs where id = p_org and site_publico);
$$;

-- Versão e validade do termo de autorização de divulgação. Mudar aqui e em
-- src/config.ts (validadeTermoDias) e src/lib/conta.ts (VERSAO_TERMO) juntos.
create or replace function public.site_termo_versao() returns text language sql immutable set search_path to 'public' as $$ select '2026.1' $$;
create or replace function public.site_termo_validade() returns interval language sql immutable set search_path to 'public' as $$ select interval '180 days' $$;

-- ---------- Anunciantes ----------

create table public.site_anunciantes (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  nome text not null default '' check (char_length(nome) <= 120),
  email text not null default '',
  telefone text not null default '' check (char_length(telefone) <= 30),
  rg text not null default '' check (char_length(rg) <= 30),
  cpf text not null default '' check (char_length(cpf) <= 20),
  estado_civil text not null default '' check (char_length(estado_civil) <= 40),
  nascimento text not null default '' check (nascimento = '' or nascimento ~ '^\d{4}-\d{2}-\d{2}$'),
  cep text not null default '' check (char_length(cep) <= 10),
  rua text not null default '' check (char_length(rua) <= 160),
  numero text not null default '' check (char_length(numero) <= 20),
  complemento text not null default '' check (char_length(complemento) <= 80),
  bairro text not null default '' check (char_length(bairro) <= 80),
  cidade text not null default '' check (char_length(cidade) <= 80),
  uf text not null default '' check (char_length(uf) <= 2),
  proprietario_id uuid references public.proprietarios(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
comment on table public.site_anunciantes is 'Proprietários com conta no site público. Não são usuários do CRM.';

-- E-mail sempre o do login, nunca o que o navegador mandar.
create or replace function public.site_anunciantes_antes()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  NEW.email := coalesce((select lower(email) from auth.users where id = NEW.id), '');
  NEW.atualizado_em := now();
  return NEW;
end;
$$;
create trigger trg_site_anunciantes_antes before insert or update on public.site_anunciantes
  for each row execute function public.site_anunciantes_antes();

alter table public.site_anunciantes enable row level security;
revoke all on public.site_anunciantes from anon, authenticated;
grant select on public.site_anunciantes to authenticated;
grant insert (id, org_id, nome, telefone, rg, cpf, estado_civil, nascimento, cep, rua, numero, complemento, bairro, cidade, uf)
  on public.site_anunciantes to authenticated;
grant update (nome, telefone, rg, cpf, estado_civil, nascimento, cep, rua, numero, complemento, bairro, cidade, uf)
  on public.site_anunciantes to authenticated;

create policy site_anunciante_le_o_seu on public.site_anunciantes for select to authenticated
  using (id = auth.uid());
create policy site_anunciante_cria_o_seu on public.site_anunciantes for insert to authenticated
  with check (id = auth.uid() and public.site_org_aceita(org_id));
create policy site_anunciante_altera_o_seu on public.site_anunciantes for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------- Anúncios ----------

create sequence public.site_anuncios_codigo_seq;

create table public.site_anuncios (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  anunciante_id uuid not null references public.site_anunciantes(id) on delete cascade,
  codigo text not null unique default ('ANU-' || lpad(nextval('public.site_anuncios_codigo_seq')::text, 4, '0')),
  status text not null default 'rascunho' check (status in ('rascunho', 'em_aprovacao', 'ativo', 'pausado', 'recusado')),
  pausado_por text check (pausado_por in ('anunciante', 'equipe', 'termo')),
  etapa integer not null default 1 check (etapa between 1 and 8),
  -- Campos do formulário de 8 etapas (tipo Anuncio do site, sem os campos de controle).
  dados jsonb not null default '{}'::jsonb check (jsonb_typeof(dados) = 'object' and pg_column_size(dados) < 200000),
  termo_versao text,
  termo_aceito_em timestamptz,
  termo_valido_ate timestamptz,
  enviado_em timestamptz,
  aprovado_em timestamptz,
  recusado_em timestamptz,
  imovel_id uuid references public.imoveis(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index site_anuncios_anunciante_idx on public.site_anuncios (anunciante_id);
create index site_anuncios_imovel_idx on public.site_anuncios (imovel_id);
create index site_anuncios_termo_idx on public.site_anuncios (termo_valido_ate) where status = 'ativo';
comment on table public.site_anuncios is 'Imóveis cadastrados pelo proprietário no site. Viram imóvel do CRM ao serem enviados.';

create or replace function public.site_anuncios_antes()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if TG_OP = 'INSERT' then
    NEW.org_id := (select org_id from public.site_anunciantes where id = NEW.anunciante_id);
  end if;
  NEW.atualizado_em := now();
  return NEW;
end;
$$;
create trigger trg_site_anuncios_antes before insert or update on public.site_anuncios
  for each row execute function public.site_anuncios_antes();

alter table public.site_anuncios enable row level security;
revoke all on public.site_anuncios from anon, authenticated;
grant select on public.site_anuncios to authenticated;
grant insert (id, anunciante_id, etapa, dados) on public.site_anuncios to authenticated;
grant update (etapa, dados) on public.site_anuncios to authenticated;
revoke all on sequence public.site_anuncios_codigo_seq from anon;
grant usage on sequence public.site_anuncios_codigo_seq to authenticated;

create policy site_anuncio_le_os_seus on public.site_anuncios for select to authenticated
  using (anunciante_id = auth.uid());
create policy site_anuncio_cria_os_seus on public.site_anuncios for insert to authenticated
  with check (anunciante_id = auth.uid());
-- Depois de aprovado, o anúncio só muda pela equipe no CRM.
create policy site_anuncio_edita_os_seus on public.site_anuncios for update to authenticated
  using (anunciante_id = auth.uid() and status in ('rascunho', 'em_aprovacao', 'recusado'))
  with check (anunciante_id = auth.uid());

-- ---------- Fotos ----------
-- Bucket público para a vitrine mostrar as fotos depois de aprovado. Caminho
-- <auth.uid>/<anuncio>/<foto>.jpg. Sem policy de leitura geral: ninguém lista
-- as pastas dos outros, só abre a URL pública de quem já tem o link.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-anuncios', 'site-anuncios', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy site_anuncios_fotos_envio on storage.objects for insert to authenticated
  with check (bucket_id = 'site-anuncios' and (storage.foldername(name))[1] = auth.uid()::text);
create policy site_anuncios_fotos_leitura_dono on storage.objects for select to authenticated
  using (bucket_id = 'site-anuncios' and (storage.foldername(name))[1] = auth.uid()::text);
create policy site_anuncios_fotos_remocao on storage.objects for delete to authenticated
  using (bucket_id = 'site-anuncios' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- Conversão para o imóvel do CRM ----------

create or replace function public.site_num(p text)
returns numeric language plpgsql immutable set search_path to 'public' as $$
begin
  return nullif(replace(btrim(coalesce(p, '')), ',', '.'), '')::numeric;
exception when others then
  return null;
end;
$$;

create or replace function public.site_txt(d jsonb, k text)
returns text language sql immutable set search_path to 'public' as $$ select nullif(btrim(coalesce(d ->> k, '')), '') $$;

-- Tudo do formulário que não tem coluna própria em imoveis vai para as observações internas.
create or replace function public.site_resumo_interno(a public.site_anuncios, u public.site_anunciantes)
returns text language sql stable set search_path to 'public' as $$
  select concat_ws(E'\n',
    format('Enviado pelo site (%s) por %s, %s, %s, em %s.', a.codigo, u.nome, u.telefone, u.email,
           to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')),
    'Termo de divulgação: versão ' || a.termo_versao || ', válido até ' || to_char(a.termo_valido_ate at time zone 'America/Sao_Paulo', 'DD/MM/YYYY') || '.',
    'Finalidade: ' || public.site_txt(a.dados, 'finalidade'),
    'Fase: ' || public.site_txt(a.dados, 'fase') || coalesce(' (entrega ' || public.site_txt(a.dados, 'previsaoConclusao') || ')', ''),
    'Ano de construção: ' || public.site_txt(a.dados, 'anoConstrucao'),
    'Padrão: ' || public.site_txt(a.dados, 'padrao'),
    'Ocupação: ' || public.site_txt(a.dados, 'ocupacao'),
    'Chaves: ' || public.site_txt(a.dados, 'localChaves'),
    'Bloco: ' || public.site_txt(a.dados, 'bloco'),
    'Andar: ' || public.site_txt(a.dados, 'andar'),
    'Lavabos: ' || public.site_txt(a.dados, 'lavabos'),
    'Salas: ' || public.site_txt(a.dados, 'salas'),
    'Área privativa: ' || public.site_txt(a.dados, 'areaPrivativa') || ' m²',
    'Área comum: ' || public.site_txt(a.dados, 'areaComum') || ' m²',
    'Mobiliado: ' || public.site_txt(a.dados, 'mobiliado'),
    'Face: ' || public.site_txt(a.dados, 'face'),
    'Posição solar: ' || public.site_txt(a.dados, 'posicaoSolar'),
    'IPTU informado: ' || public.site_txt(a.dados, 'valorIptu') || ' (' || coalesce(public.site_txt(a.dados, 'iptuPeriodo'), 'mensal') || ')',
    case when (a.dados ->> 'ocultarEndereco')::boolean is false then 'Proprietário aceita mostrar o endereço.' else 'Proprietário pediu para não mostrar o endereço.' end,
    'Mapa: ' || public.site_txt(a.dados, 'lat') || ', ' || public.site_txt(a.dados, 'lng')
  );
$$;

create or replace function public.site_grava_imovel(a public.site_anuncios, u public.site_anunciantes, p_proprietario uuid)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare
  d jsonb := a.dados;
  v_iptu numeric := public.site_num(d ->> 'valorIptu');
  v_fotos text[] := array(select f ->> 'url' from jsonb_array_elements(coalesce(d -> 'fotos', '[]'::jsonb)) f where coalesce(f ->> 'url', '') <> '');
  v_comodidades text[] := array(select jsonb_array_elements_text(coalesce(d -> 'comodidades', '[]'::jsonb)));
  v_negocio text := coalesce(public.site_txt(d, 'negocio'), 'venda');
  v_id uuid := a.imovel_id;
  v_titulo text := coalesce(public.site_txt(d, 'titulo'),
    concat_ws(' em ', coalesce(public.site_txt(d, 'tipo'), 'Imóvel'), public.site_txt(d, 'bairro')));
  v_endereco text := concat_ws(', ', public.site_txt(d, 'logradouro'), public.site_txt(d, 'numero'),
    public.site_txt(d, 'complemento'), 'bloco ' || public.site_txt(d, 'bloco'), 'andar ' || public.site_txt(d, 'andar'));
begin
  if public.site_txt(d, 'iptuPeriodo') = 'anual' and v_iptu is not null then v_iptu := round(v_iptu / 12, 2); end if;
  if v_negocio not in ('venda', 'locacao', 'venda_locacao') then v_negocio := 'venda'; end if;

  if v_id is not null and exists (select 1 from public.imoveis where id = v_id) then
    -- Reenvio de anúncio ainda em aprovação: atualiza o que veio do site, mantém status e portais.
    update public.imoveis set
      titulo = v_titulo, finalidade = v_negocio, tipo = public.site_txt(d, 'tipo'),
      bairro = public.site_txt(d, 'bairro'), cidade = public.site_txt(d, 'cidade'), uf = public.site_txt(d, 'uf'),
      cep = public.site_txt(d, 'cep'), endereco = v_endereco, condominio_nome = public.site_txt(d, 'condominio'),
      valor_venda = public.site_num(d ->> 'valorVenda'), valor_locacao = public.site_num(d ->> 'valorLocacao'),
      condominio = public.site_num(d ->> 'valorCondominio'), iptu = v_iptu,
      quartos = public.site_num(d ->> 'dormitorios')::int, suites = public.site_num(d ->> 'suites')::int,
      banheiros = public.site_num(d ->> 'banheiros')::int, vagas = public.site_num(d ->> 'vagas')::int,
      area_util_m2 = public.site_num(d ->> 'areaUtil'), area_total_m2 = public.site_num(d ->> 'areaTotal'),
      caracteristicas = v_comodidades, descricao = public.site_txt(d, 'descricao'), fotos = v_fotos,
      aceita_financiamento = coalesce((d ->> 'aceitaFinanciamento')::boolean, false),
      aceita_permuta = coalesce((d ->> 'aceitaPermuta')::boolean, false),
      proprietario_id = coalesce(proprietario_id, p_proprietario),
      observacoes_internas = public.site_resumo_interno(a, u),
      origem_atualizado_em = now()
    where id = v_id;
    return v_id;
  end if;

  insert into public.imoveis (
    org_id, codigo, titulo, finalidade, tipo, bairro, cidade, uf, cep, endereco, condominio_nome,
    valor_venda, valor_locacao, condominio, iptu, quartos, suites, banheiros, vagas, area_util_m2, area_total_m2,
    caracteristicas, descricao, fotos, aceita_financiamento, aceita_permuta,
    status, publicar_portais, portais, proprietario_id, observacoes_internas, origem, origem_id, origem_atualizado_em
  ) values (
    a.org_id, a.codigo, v_titulo, v_negocio, public.site_txt(d, 'tipo'), public.site_txt(d, 'bairro'),
    public.site_txt(d, 'cidade'), public.site_txt(d, 'uf'), public.site_txt(d, 'cep'), v_endereco, public.site_txt(d, 'condominio'),
    public.site_num(d ->> 'valorVenda'), public.site_num(d ->> 'valorLocacao'), public.site_num(d ->> 'valorCondominio'), v_iptu,
    public.site_num(d ->> 'dormitorios')::int, public.site_num(d ->> 'suites')::int, public.site_num(d ->> 'banheiros')::int,
    public.site_num(d ->> 'vagas')::int, public.site_num(d ->> 'areaUtil'), public.site_num(d ->> 'areaTotal'),
    v_comodidades, public.site_txt(d, 'descricao'), v_fotos,
    coalesce((d ->> 'aceitaFinanciamento')::boolean, false), coalesce((d ->> 'aceitaPermuta')::boolean, false),
    'inativo', false, '{}', p_proprietario, public.site_resumo_interno(a, u), 'site', a.id::text, now()
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- Aviso no sininho do CRM para os gestores da org (sem gestor: para todos da org).
create or replace function public.site_avisar_equipe(p_org uuid, p_titulo text, p_corpo text, p_dados jsonb)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  insert into public.notifications (org_id, user_id, type, title, body, data)
  select p_org, u.id, 'imovel_site', p_titulo, p_corpo, p_dados
  from public.users u
  where u.org_id = p_org
    and (u.can_manage_corretores or not exists (select 1 from public.users g where g.org_id = p_org and g.can_manage_corretores));
end;
$$;

-- ---------- Ações do anunciante ----------

create or replace function public.site_meu_anuncio(p_id uuid)
returns public.site_anuncios language plpgsql security definer set search_path to 'public' as $$
declare a public.site_anuncios;
begin
  select * into a from public.site_anuncios where id = p_id and anunciante_id = auth.uid() for update;
  if not found then raise exception 'Anúncio não encontrado' using errcode = 'P0002'; end if;
  return a;
end;
$$;

create or replace function public.site_enviar_anuncio(p_id uuid)
returns public.site_anuncios language plpgsql security definer set search_path to 'public' as $$
declare
  a public.site_anuncios := public.site_meu_anuncio(p_id);
  u public.site_anunciantes;
  d jsonb := a.dados;
  v_faltam text[] := '{}';
  v_prop uuid;
  v_novo boolean := a.imovel_id is null;
begin
  if a.status not in ('rascunho', 'em_aprovacao', 'recusado') then
    raise exception 'Este anúncio já foi aprovado. Para mudar, fale com o atendimento.' using errcode = '22023';
  end if;
  select * into u from public.site_anunciantes where id = a.anunciante_id;

  -- Mesmo mínimo que o formulário pede (src/pages/anunciar/Anunciar.tsx, validar).
  if public.site_txt(d, 'finalidade') is null then v_faltam := array_append(v_faltam, 'finalidade'); end if;
  if public.site_txt(d, 'tipo') is null then v_faltam := array_append(v_faltam, 'tipo'); end if;
  if public.site_txt(d, 'logradouro') is null or public.site_txt(d, 'numero') is null then v_faltam := array_append(v_faltam, 'endereço'); end if;
  if public.site_txt(d, 'bairro') is null or public.site_txt(d, 'cidade') is null or public.site_txt(d, 'uf') is null then v_faltam := array_append(v_faltam, 'bairro e cidade'); end if;
  if public.site_num(d ->> 'areaUtil') is null then v_faltam := array_append(v_faltam, 'área útil'); end if;
  if public.site_txt(d, 'negocio') is null then v_faltam := array_append(v_faltam, 'venda ou locação'); end if;
  if public.site_txt(d, 'negocio') in ('venda', 'venda_locacao') and public.site_num(d ->> 'valorVenda') is null then v_faltam := array_append(v_faltam, 'valor de venda'); end if;
  if public.site_txt(d, 'negocio') in ('locacao', 'venda_locacao') and public.site_num(d ->> 'valorLocacao') is null then v_faltam := array_append(v_faltam, 'valor do aluguel'); end if;
  if cardinality(v_faltam) > 0 then
    raise exception 'Falta preencher: %', array_to_string(v_faltam, ', ') using errcode = '22023';
  end if;

  -- Enviar é o aceite do termo. Reenvio mantém o termo que ainda vale.
  if a.termo_valido_ate is null or a.termo_valido_ate < now() or a.termo_versao is distinct from public.site_termo_versao() then
    a.termo_versao := public.site_termo_versao();
    a.termo_aceito_em := now();
    a.termo_valido_ate := now() + public.site_termo_validade();
  end if;

  -- Proprietário no CRM: o mesmo para todos os anúncios da conta.
  v_prop := u.proprietario_id;
  if v_prop is null or not exists (select 1 from public.proprietarios where id = v_prop) then
    insert into public.proprietarios (org_id, nome, telefone, email, documento, observacoes)
    values (u.org_id, nullif(u.nome, ''), nullif(u.telefone, ''), nullif(u.email, ''), nullif(u.cpf, ''), 'Conta criada no site.')
    returning id into v_prop;
    update public.site_anunciantes set proprietario_id = v_prop where id = u.id;
  end if;

  a.imovel_id := public.site_grava_imovel(a, u, v_prop);

  update public.site_anuncios set
    status = 'em_aprovacao', pausado_por = null, etapa = 8, enviado_em = now(), recusado_em = null,
    termo_versao = a.termo_versao, termo_aceito_em = a.termo_aceito_em, termo_valido_ate = a.termo_valido_ate,
    imovel_id = a.imovel_id
  where id = a.id
  returning * into a;

  perform public.site_avisar_equipe(a.org_id,
    case when v_novo then 'Imóvel novo enviado pelo site' else 'Imóvel do site atualizado' end,
    format('%s · %s · %s', a.codigo, coalesce(public.site_txt(d, 'tipo'), 'Imóvel'), coalesce(public.site_txt(d, 'bairro'), '')),
    jsonb_build_object('imovel_id', a.imovel_id, 'codigo', a.codigo,
      'url', format('/imoveis?org=%s&codigo=%s', a.org_id, a.codigo)));
  return a;
end;
$$;

create or replace function public.site_pausar_anuncio(p_id uuid)
returns public.site_anuncios language plpgsql security definer set search_path to 'public' as $$
declare a public.site_anuncios := public.site_meu_anuncio(p_id);
begin
  if a.status <> 'ativo' then raise exception 'Só dá para pausar um anúncio no ar.' using errcode = '22023'; end if;
  update public.site_anuncios set status = 'pausado', pausado_por = 'anunciante' where id = a.id returning * into a;
  update public.imoveis set status = 'inativo' where id = a.imovel_id and status = 'disponivel';
  return a;
end;
$$;

create or replace function public.site_reativar_anuncio(p_id uuid)
returns public.site_anuncios language plpgsql security definer set search_path to 'public' as $$
declare a public.site_anuncios := public.site_meu_anuncio(p_id);
begin
  if a.status <> 'pausado' then raise exception 'Este anúncio não está pausado.' using errcode = '22023'; end if;
  if a.pausado_por = 'equipe' then raise exception 'Este anúncio foi pausado pela nossa equipe. Fale com o atendimento.' using errcode = '22023'; end if;
  if a.termo_valido_ate is null or a.termo_valido_ate < now() then raise exception 'Renove o termo de autorização antes de reativar.' using errcode = '22023'; end if;
  if a.imovel_id is null then raise exception 'Este imóvel saiu do nosso cadastro. Fale com o atendimento.' using errcode = '22023'; end if;
  update public.site_anuncios set status = 'ativo', pausado_por = null where id = a.id returning * into a;
  update public.imoveis set status = 'disponivel' where id = a.imovel_id and status = 'inativo';
  return a;
end;
$$;

create or replace function public.site_renovar_termo(p_id uuid)
returns public.site_anuncios language plpgsql security definer set search_path to 'public' as $$
declare a public.site_anuncios := public.site_meu_anuncio(p_id);
begin
  if a.status = 'rascunho' then raise exception 'O termo é aceito no envio do anúncio.' using errcode = '22023'; end if;
  update public.site_anuncios set
    termo_versao = public.site_termo_versao(), termo_aceito_em = now(), termo_valido_ate = now() + public.site_termo_validade()
  where id = a.id returning * into a;
  if a.status = 'pausado' and a.pausado_por = 'termo' and a.imovel_id is not null then
    update public.site_anuncios set status = 'ativo', pausado_por = null where id = a.id returning * into a;
    update public.imoveis set status = 'disponivel' where id = a.imovel_id and status = 'inativo';
  end if;
  return a;
end;
$$;

-- Excluir no site não apaga nada do CRM: o imóvel fica inativo, fora do site, com o registro nas observações.
create or replace function public.site_excluir_anuncio(p_id uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
declare a public.site_anuncios := public.site_meu_anuncio(p_id);
begin
  delete from public.site_anuncios where id = a.id;
  if a.imovel_id is not null then
    update public.imoveis set
      status = 'inativo',
      portais = array_remove(portais, 'site'),
      observacoes_internas = concat_ws(E'\n', observacoes_internas,
        format('Proprietário excluiu o anúncio %s no site em %s.', a.codigo, to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')))
    where id = a.imovel_id;
    perform public.site_avisar_equipe(a.org_id, 'Proprietário excluiu um anúncio do site', a.codigo || ' ficou inativo no CRM.',
      jsonb_build_object('imovel_id', a.imovel_id, 'codigo', a.codigo, 'url', format('/imoveis?org=%s&codigo=%s', a.org_id, a.codigo)));
  end if;
end;
$$;

revoke all on function public.site_org_aceita(uuid), public.site_grava_imovel(public.site_anuncios, public.site_anunciantes, uuid),
  public.site_avisar_equipe(uuid, text, text, jsonb), public.site_meu_anuncio(uuid), public.site_enviar_anuncio(uuid),
  public.site_pausar_anuncio(uuid), public.site_reativar_anuncio(uuid), public.site_renovar_termo(uuid),
  public.site_excluir_anuncio(uuid), public.site_anunciantes_antes(), public.site_anuncios_antes()
  from public, anon, authenticated;
grant execute on function public.site_org_aceita(uuid), public.site_enviar_anuncio(uuid), public.site_pausar_anuncio(uuid),
  public.site_reativar_anuncio(uuid), public.site_renovar_termo(uuid), public.site_excluir_anuncio(uuid)
  to authenticated;

-- ---------- Decisões da equipe no CRM voltam para o anúncio ----------

create or replace function public.imoveis_site_anuncio()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare a public.site_anuncios;
begin
  if TG_OP = 'DELETE' then
    update public.site_anuncios set
      status = case when status in ('em_aprovacao', 'rascunho') then 'recusado' else 'pausado' end,
      pausado_por = case when status in ('em_aprovacao', 'rascunho') then null else 'equipe' end,
      recusado_em = case when status in ('em_aprovacao', 'rascunho') then now() else recusado_em end
    where imovel_id = OLD.id;
    return OLD;
  end if;

  if NEW.status is not distinct from OLD.status then return NEW; end if;
  select * into a from public.site_anuncios where imovel_id = NEW.id for update;
  if not found then return NEW; end if;

  if NEW.status = 'disponivel' then
    if a.status = 'em_aprovacao' then
      -- Aprovação: o proprietário pediu para anunciar no site.
      update public.site_anuncios set status = 'ativo', pausado_por = null, aprovado_em = now() where id = a.id;
      NEW.portais := array(select distinct unnest(coalesce(NEW.portais, '{}') || array['site']) order by 1);
    elsif a.status = 'pausado' and a.pausado_por is distinct from 'termo' then
      update public.site_anuncios set status = 'ativo', pausado_por = null where id = a.id;
    end if;
  elsif a.status = 'ativo' then
    update public.site_anuncios set status = 'pausado', pausado_por = 'equipe' where id = a.id;
  end if;
  return NEW;
end;
$$;
revoke all on function public.imoveis_site_anuncio() from public, anon, authenticated;

create trigger trg_imoveis_site_anuncio before update of status or delete on public.imoveis
  for each row when (OLD.origem = 'site') execute function public.imoveis_site_anuncio();

-- ---------- Termo vencido tira o anúncio do ar ----------

create or replace function public.site_pausar_termos_vencidos()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare v_n integer := 0; a record;
begin
  for a in select id, imovel_id from public.site_anuncios where status = 'ativo' and termo_valido_ate < now() for update loop
    update public.site_anuncios set status = 'pausado', pausado_por = 'termo' where id = a.id;
    update public.imoveis set status = 'inativo' where id = a.imovel_id and status = 'disponivel';
    v_n := v_n + 1;
  end loop;
  return v_n;
end;
$$;
revoke all on function public.site_pausar_termos_vencidos() from public, anon, authenticated;

select cron.schedule('site-termos-vencidos', '30 9 * * *', $$select public.site_pausar_termos_vencidos()$$);

-- ---------- Fecha brecha que a conta pública abriria ----------
-- As policies do bucket lead-presentations liberavam qualquer login. Com
-- anunciante logado no mesmo projeto, isso exporia as apresentações dos leads.
-- Agora exigem um usuário do CRM (linha em public.users).

drop policy if exists "org members can read lead presentations" on storage.objects;
drop policy if exists "org members can upload lead presentations" on storage.objects;
drop policy if exists "org members can update lead presentations" on storage.objects;
drop policy if exists "org members can delete lead presentations" on storage.objects;
create policy "org members can read lead presentations" on storage.objects for select to authenticated
  using (bucket_id = 'lead-presentations' and exists (select 1 from public.users u where u.id = auth.uid()));
create policy "org members can upload lead presentations" on storage.objects for insert to authenticated
  with check (bucket_id = 'lead-presentations' and exists (select 1 from public.users u where u.id = auth.uid()));
create policy "org members can update lead presentations" on storage.objects for update to authenticated
  using (bucket_id = 'lead-presentations' and exists (select 1 from public.users u where u.id = auth.uid()));
create policy "org members can delete lead presentations" on storage.objects for delete to authenticated
  using (bucket_id = 'lead-presentations' and exists (select 1 from public.users u where u.id = auth.uid()));
