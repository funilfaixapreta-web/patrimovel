-- Carteira da Arbo no site novo (pedido da Patrimóvel em 23/10/2026).
-- 1. Os imóveis disponíveis que vieram da Arbo ganham o portal "site".
-- 2. Imóvel novo da Arbo já entra com "site", e um que volta a ficar
--    disponível na sincronização também. A equipe pode tirar no CRM depois.
-- O portal "site" não faz parte do grupo OLX, então publicar_portais não muda.

update public.imoveis
set portais = array(select distinct unnest(portais || array['site']) order by 1)
where org_id = '284ccccb-2ea3-464b-a89f-8185b732b38f' -- Patrimóvel
  and origem = 'arbo'
  and status = 'disponivel'
  and not ('site' = any(portais));

create or replace function public.imoveis_arbo_no_site()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if NEW.origem = 'arbo' and NEW.status = 'disponivel' and public.site_org_aceita(NEW.org_id)
     and not ('site' = any(coalesce(NEW.portais, '{}')))
     and (TG_OP = 'INSERT' or OLD.status is distinct from 'disponivel') then
    NEW.portais := array(select distinct unnest(coalesce(NEW.portais, '{}') || array['site']) order by 1);
  end if;
  return NEW;
end;
$$;
revoke all on function public.imoveis_arbo_no_site() from public, anon, authenticated;

-- "zz" para rodar depois de trg_imoveis_sincroniza_portais (ordem alfabética).
create trigger trg_imoveis_zz_arbo_no_site before insert or update of status on public.imoveis
  for each row execute function public.imoveis_arbo_no_site();
