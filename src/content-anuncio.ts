// Opções do cadastro de imóvel. Mesmos campos do formulário atual da Arbo, com rótulos revisados.

export const FINALIDADES = [
  { valor: "residencial", rotulo: "Residencial", icone: "casa", texto: "Apartamento, casa, cobertura, flat" },
  { valor: "comercial", rotulo: "Comercial", icone: "loja", texto: "Sala, loja, conjunto, ponto comercial" },
  { valor: "corporativa", rotulo: "Corporativa", icone: "predio", texto: "Andar ou laje corporativa, prédio" },
  { valor: "industrial", rotulo: "Industrial", icone: "galpao", texto: "Galpão, terreno ou prédio industrial" },
  { valor: "rural", rotulo: "Rural", icone: "rural", texto: "Fazenda, sítio, chácara" },
] as const;

export const TIPOS_POR_FINALIDADE: Record<string, string[]> = {
  residencial: ["Apartamento", "Apartamento garden", "Cobertura", "Cobertura duplex", "Casa", "Casa em condomínio", "Flat", "Studio", "Kitnet", "Loft", "Terreno"],
  comercial: ["Sala", "Conjunto comercial", "Loja", "Ponto comercial", "Galpão", "Prédio", "Terreno"],
  corporativa: ["Andar corporativo", "Laje corporativa", "Sala", "Prédio"],
  industrial: ["Galpão", "Prédio industrial", "Terreno industrial"],
  rural: ["Fazenda", "Sítio", "Chácara", "Terreno rural"],
};

export const FASES = ["Pronto para morar", "Em construção", "Na planta"];
export const LOCAL_CHAVES = ["Imobiliária", "Portaria", "Com o proprietário", "Com o inquilino", "Outro"];
export const OCUPACAO = ["Desocupado", "Ocupado pelo proprietário", "Alugado"];
export const PADRAO = ["Não informado", "Econômico", "Médio", "Alto", "Luxo"];
export const MOBILIADO = ["Não", "Sim", "Semimobiliado"];
export const FACE = ["Frente", "Fundos", "Lateral", "Interno"];
export const POSICAO_SOLAR = ["Nascente", "Poente", "Norte", "Sul", "Nascente e norte", "Poente e norte"];
export const ESTADO_CIVIL = ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)"];
export const UFS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];

export const GRUPOS_COMODIDADES: { titulo: string; itens: string[] }[] = [
  {
    titulo: "O imóvel tem",
    itens: ["Sala de estar", "Sala de jantar", "Copa", "Cozinha", "Despensa", "Escritório", "Lavanderia", "Quarto de serviço", "Mezanino", "Sacada", "Sacada com skin glass", "Elevador privativo", "Ar-condicionado", "Alarme", "Laje técnica"],
  },
  {
    titulo: "Características",
    itens: ["Andar alto", "Vista para o mar", "Quadra da praia", "Varanda", "Decorado", "Aceita pet"],
  },
  {
    titulo: "Lazer no imóvel",
    itens: ["Piscina privativa", "Churrasqueira privativa", "Espaço gourmet", "Jardim de inverno", "Hidromassagem", "Sauna privativa", "Ofurô", "Adega", "Lareira", "Home cinema"],
  },
  {
    titulo: "Armários",
    itens: ["Closet", "Armário na cozinha", "Armário nos quartos", "Armário na suíte", "Armário no banheiro", "Armário no escritório", "Armário na área de serviço", "Armário no quarto de serviço", "Armário de home theater"],
  },
  {
    titulo: "Aquecimento",
    itens: ["Aquecimento a gás", "Aquecimento solar", "Aquecimento elétrico"],
  },
  {
    titulo: "Lazer do condomínio",
    itens: ["Piscina", "Piscina aquecida", "Piscina infantil", "Piscina com raia", "Academia", "Sala de pilates", "Spa", "Sauna seca", "Sauna úmida", "Sala de massagem", "Salão de festas", "Salão gourmet", "Churrasqueira", "Salão de jogos", "Cinema", "Brinquedoteca", "Playground", "Quadra poliesportiva", "Quadra de tênis", "Quadra de squash", "Pista de cooper", "Pista de skate", "Boliche", "Espaço de leitura", "Pet place", "Beach point", "Restaurante"],
  },
  {
    titulo: "Infraestrutura do condomínio",
    itens: ["Portaria 24h", "Guarita com segurança", "Guarita blindada", "Circuito interno de TV", "Portão eletrônico", "Entrada lateral", "Elevador", "Elevador com gerador", "Lavanderia coletiva", "Tomada para carro elétrico", "Painel solar", "Heliponto"],
  },
];

export const ETAPAS = [
  { pergunta: "Qual a finalidade do imóvel?", nome: "Informações gerais" },
  { pergunta: "Detalhes do imóvel", nome: "Tipo, fase e ano" },
  { pergunta: "Onde fica?", nome: "Localização e endereço" },
  { pergunta: "Quais são os cômodos do seu imóvel?", nome: "Cômodos" },
  { pergunta: "O que o imóvel e o condomínio oferecem?", nome: "Comodidades" },
  { pergunta: "Fotos do imóvel", nome: "Fotos" },
  { pergunta: "Quanto você quer pelo imóvel?", nome: "Valores" },
  { pergunta: "Revise e envie", nome: "Revisão e termo" },
] as const;

// CONFIRMAR: texto do termo de autorização de divulgação com o jurídico da Patrimóvel ADM.
export const TEXTO_TERMO = [
  "Autorizo a Patrimóvel Administradora (CRECI 0005083) a divulgar o imóvel cadastrado no seu site e nos portais imobiliários com os quais trabalha, usando as fotos e informações que enviei.",
  "Declaro que sou proprietário do imóvel ou que tenho autorização do proprietário para anunciá-lo, e que as informações enviadas são verdadeiras.",
  "Os valores de venda, aluguel, condomínio e IPTU podem ser revisados em conjunto com a equipe da Patrimóvel ADM antes da publicação.",
  "Esta autorização vale pelo prazo indicado e pode ser renovada ou cancelada a qualquer momento pela área do anunciante.",
];
