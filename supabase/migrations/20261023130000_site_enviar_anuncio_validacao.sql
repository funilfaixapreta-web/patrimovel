-- Corrige a lista do que falta preencher (text[] || 'texto' era lido como array).

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
