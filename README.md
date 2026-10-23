# Site Patrimóvel ADM (front end)

React 18 + Vite + Tailwind. O backend é o mesmo projeto Supabase do CRM: a vitrine vem do `imoveis-vitrine`, os formulários viram lead pelo `site-leads` e a conta do anunciante usa Supabase Auth com as tabelas `site_*` (ver [Backend](#backend)).

## Rodar

```bash
npm install
npm run dev
```

`npm run build` gera a pasta `dist/` (site estático). O `vercel.json` já tem os redirecionamentos 301 das URLs antigas da Arbo (`/imovel/{tipo}/{negocio}/{cidade}/{uf}/{bairro}/{CODIGO}` vira `/imovel/{CODIGO}`) e a regra de SPA.

## Páginas

| Rota | O que é |
|---|---|
| `/` | Home com busca, destaques, bairros, comerciais e administração |
| `/alugar`, `/comprar` (+ `/:bairro`) | Busca com filtros na URL, ordenação e custo mensal total |
| `/imovel/:codigo` | Ficha: fotos, vídeo, custo total, agendar visita, WhatsApp com código, parecidos |
| `/administracao` | Página do proprietário, com formulário, inclusões, passos, troca de administradora e perguntas frequentes |
| `/vender` | Captação para venda |
| `/bairros`, `/bairros/:bairro` | Guia do bairro com mediana do m² calculada dos anúncios |
| `/sobre`, `/contato`, `/area-do-cliente`, `/favoritos`, `/privacidade` | Institucionais |

## Conta do anunciante

Telas equivalentes às do app atual da Arbo, gravando no Supabase do CRM.

| Rota | O que faz |
|---|---|
| `/entrar` | Entrar, criar conta (com confirmação por e-mail) e "esqueci minha senha" com link por e-mail |
| `/conta/perfil` | Dados cadastrais: CPF com validação, RG, estado civil, nascimento e endereço pelo CEP (ViaCEP) |
| `/conta/imoveis` | Imóveis anunciados: filtro Para alugar/Para vender e por status, continuar rascunho, editar, pausar, reativar, excluir |
| `/conta/termos` | Aceite de termos e renovação: vigência, aviso 30 dias antes de vencer, ler termo, renovar |
| `/anunciar` e `/anunciar/:id` | Cadastro do imóvel em 8 etapas: finalidade; tipo, fase e ano; endereço com CEP e mapa com pino (Leaflet + OpenStreetMap); cômodos; comodidades; fotos (envio, capa, ordem, exclusão); valores; revisão e termo |

- O menu do usuário no cabeçalho tem: Meu perfil, Imóveis anunciados, Aceite de termos e renovação, Imóveis curtidos, Área do cliente e Sair.
- Favoritos continuam só no navegador (sem login).
- **Mapa no ar:** os tiles públicos do OpenStreetMap servem para começar. Com volume, use um provedor de mapas com chave (Mapbox, MapTiler ou similar).

## Backend

Tudo roda no projeto Supabase do CRM (`tdjvryuublqixpzqnzvs`). Os arquivos ficam neste repositório, em `supabase/`, e já estão aplicados lá.

| Peça | Onde | O que faz |
|---|---|---|
| Conta | Supabase Auth (e-mail e senha) + `site_anunciantes` | Perfil do proprietário. Ele não entra em `public.users`, então não enxerga nada do CRM |
| Anúncios | `site_anuncios` | Etapa, dados do formulário (`dados` jsonb), status e termo. O navegador só grava `etapa` e `dados`; status e termo mudam por RPC |
| Fotos | bucket público `site-anuncios`, pasta `<usuario>/<anuncio>/` | Cada um só envia e apaga na própria pasta. A URL pública vai para o imóvel do CRM |
| Ações | RPCs `site_enviar_anuncio`, `site_pausar_anuncio`, `site_reativar_anuncio`, `site_renovar_termo`, `site_excluir_anuncio` | Conferem se o anúncio é de quem chamou |
| Formulários | edge function `site-leads` (pública) | Cria ou atualiza o contato no funil da Patrimóvel (`source = site`), gira a roleta e avisa |
| Termo vencido | cron `site-termos-vencidos` (06h30 de Brasília) | Tira do ar os anúncios com termo vencido até o proprietário renovar |

**Fluxo do anúncio com a equipe (sem tela nova no CRM):**

1. O proprietário envia. O anúncio fica **Em aprovação**, e o CRM ganha um imóvel com o mesmo código (`ANU-0001`), **inativo**, sem portais, com `origem = site`, o proprietário ligado e os detalhes extras nas observações internas. O gestor da org recebe aviso no sininho, e o proprietário entra como lead de captação.
2. **Aprovar:** no CRM, mudar o imóvel para **Disponível**. O anúncio vai para **No ar** e o imóvel ganha o portal **Site** (aparece na vitrine). ZAP, Viva Real e OLX a equipe marca se quiser.
3. **Recusar:** excluir o imóvel no CRM enquanto ele está em aprovação. O anúncio vira **Recusado**, e o proprietário pode corrigir e enviar de novo.
4. **Tirar do ar:** mudar o imóvel para inativo, alugado ou vendido. O anúncio fica **Pausado pela equipe**, e só a equipe reativa (voltando para Disponível).
5. Quando o proprietário pausa, reativa, renova ou exclui no site, o imóvel do CRM acompanha. Excluir no site não apaga nada do CRM: o imóvel fica inativo, sai do site e ganha uma nota nas observações.

**Testes:** `deno test supabase/functions/site-leads/lead.test.ts`.

## Dados

- `VITE_VITRINE_URL`: endpoint `imoveis-vitrine` do CRM. Só mostra imóveis disponíveis marcados como **Site**.
- Hoje a vitrine volta vazia, porque nenhum imóvel está marcado como Site no CRM. Com `VITE_VITRINE_FALLBACK=true`, o site usa `public/data/vitrine-exemplo.json`: os 131 anúncios públicos da Arbo em 20/10/2026, convertidos com a mesma regra do CRM (sem endereço). **No ar, use `false`.**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_SITE_ORG_ID`: projeto e org do CRM. Já têm padrão no código (`src/config.ts`); a chave é a publicável.
- Formulários: com `VITE_LEADS_URL` vazio, vão para o `site-leads` do CRM. Com `VITE_LEADS_URL=whatsapp`, abrem o WhatsApp com a mensagem pronta. O POST é em JSON (`origem`, `nome`, `telefone`, `email`, `mensagem`, `imovel_codigo`, `negocio`, `bairro`, `data_visita`, `periodo_visita`, `pagina`).
- `VITE_GTM_ID`: carrega o GTM só depois do aceite no aviso de cookies. Os eventos vão para o `dataLayer`: `generate_lead`, `whatsapp_click`, `phone_click` e `page_view_spa`.

## Configurar no Supabase antes de abrir o cadastro

Estes ajustes ficam no painel do Supabase (Authentication), fora do código:

- **URL Configuration > Redirect URLs:** incluir o domínio do site (ex.: `https://www.patrimoveladm.com.br/**`) e `http://localhost:5173/**`. Sem isso, os links de confirmação e de senha nova abrem o CRM em vez do site.
- **SMTP próprio:** o envio padrão do Supabase tem limite baixo de e-mails por hora. Com o site no ar, configure um SMTP (Resend, SES ou similar) com remetente da Patrimóvel.
- **Templates de e-mail:** os textos de confirmação e de senha nova são os mesmos do CRM. Vale trocar para a marca da Patrimóvel, ou usar o `{{ .RedirectTo }}` para identificar de onde veio.

## Confirmar com a Patrimóvel ADM antes de publicar

Tudo está marcado com `CONFIRMAR` em `src/config.ts`, `src/content.ts` e `src/pages/Institucionais.tsx`.

- Número de WhatsApp. O site atual usa (21) 96456-3479 e o CRM tem (21) 92367-3097.
- Lista do que está incluso na administração, garantias aceitas e respostas das perguntas frequentes.
- Taxa de administração (`taxaAdministracao`). Enquanto for `null`, o simulador "Quanto você recebe" fica escondido.
- Links do portal da Superlógica para proprietário e inquilino (`areaDoCliente`). Sem eles, a página mostra o WhatsApp do atendimento.
- "46 anos de mercado" do Grupo Patrimóvel na página Sobre.
- Texto da política de privacidade e dos termos de uso.
- Texto do termo de autorização de divulgação (`TEXTO_TERMO` em `src/content-anuncio.ts`) e a validade em dias (`validadeTermoDias` em `src/config.ts`, hoje 180).

## Limites conhecidos

- **Sem mapa:** a vitrine não devolve coordenadas.
- **Sem nome do condomínio:** a vitrine também não devolve esse campo.
- **Só 5 a 7 fotos por imóvel**, com a marca d'água central da Arbo, porque é isso que a sincronização traz.
- **Robôs veem pouco texto antes do JavaScript.** Títulos e descrições já mudam por página, mas o conteúdo só aparece depois que o JavaScript roda. Para SEO completo vale publicar com pré-renderização.
