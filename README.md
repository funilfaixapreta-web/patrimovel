# Site Patrimóvel ADM (front end)

React 18 + Vite + Tailwind. Lê os imóveis do endpoint público da vitrine do CRM e não precisa de backend próprio.

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

## Protótipo da conta do anunciante

Telas equivalentes às do app atual da Arbo. Funcionam no navegador, mas **sem backend**: tudo fica salvo no `localStorage` e as fotos no IndexedDB do navegador. Nada chega à Patrimóvel ADM. As telas mostram um aviso de protótipo.

| Rota | O que faz |
|---|---|
| `/entrar` | Entrar e criar conta. A senha não é conferida nem guardada. |
| `/conta/perfil` | Dados cadastrais: CPF com validação, RG, estado civil, nascimento e endereço pelo CEP (ViaCEP) |
| `/conta/imoveis` | Imóveis anunciados: filtro Para alugar/Para vender e por status, continuar rascunho, editar, pausar, excluir |
| `/conta/termos` | Aceite de termos e renovação: vigência, aviso 30 dias antes de vencer, ler termo, renovar |
| `/anunciar` e `/anunciar/:id` | Cadastro do imóvel em 8 etapas: finalidade; tipo, fase e ano; endereço com CEP e mapa com pino (Leaflet + OpenStreetMap); cômodos; comodidades; fotos (envio, capa, ordem, exclusão); valores; revisão e termo |

- O menu do usuário no cabeçalho tem: Meu perfil, Imóveis anunciados, Aceite de termos e renovação, Imóveis curtidos, Área do cliente e Sair.
- Os botões tracejados "Simular aprovação" e "Simular vencimento" existem só para demonstrar os status. Saem quando houver backend.
- **Para ligar no backend:** troque as funções de `src/lib/conta.ts` e `src/lib/fotos.ts` por chamadas à API, mantendo as mesmas assinaturas. As telas não precisam mudar.
- **Mapa no ar:** os tiles públicos do OpenStreetMap servem para o protótipo. Em produção, use um provedor de mapas com chave (Mapbox, MapTiler ou similar).

## Dados

- `VITE_VITRINE_URL`: endpoint `imoveis-vitrine` do CRM. Só mostra imóveis disponíveis marcados como **Site**.
- Hoje a vitrine volta vazia, porque nenhum imóvel está marcado como Site no CRM. Com `VITE_VITRINE_FALLBACK=true`, o site usa `public/data/vitrine-exemplo.json`: os 131 anúncios públicos da Arbo em 20/10/2026, convertidos com a mesma regra do CRM (sem endereço). **No ar, use `false`.**
- Formulários: com `VITE_LEADS_URL` vazio, abrem o WhatsApp com a mensagem pronta. Com a URL definida, fazem POST em JSON (`origem`, `nome`, `telefone`, `email`, `mensagem`, `imovel_codigo`, `negocio`, `bairro`, `data_visita`, `periodo_visita`, `pagina`).
- `VITE_GTM_ID`: carrega o GTM só depois do aceite no aviso de cookies. Os eventos vão para o `dataLayer`: `generate_lead`, `whatsapp_click`, `phone_click` e `page_view_spa`.

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
