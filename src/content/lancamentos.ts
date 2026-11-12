// Lançamentos que estavam no site antigo (Wix): patrimoveladm.com.br/lancamentos,
// /orlaipanema, /belavistaipanema, /vistaipanema e /786prudente. Os endereços
// foram mantidos iguais para não perder link nem Google. Fotos em
// public/img/lancamentos/{slug}/ (hero, logo, foto-NN, planta-N, mapa).

export interface ItemConceito {
  titulo: string;
  texto: string;
}

export interface Tipologia {
  nome: string;
  detalhe: string;
}

export interface Secao {
  rotulo: string;
  titulo: string;
  textos: string[];
}

export interface Lancamento {
  slug: string;
  nome: string;
  /** Selo do cartão na página de lançamentos. */
  selo: string;
  endereco: string;
  /** Linha de metragens do topo da página. */
  chamada: string;
  /** Texto e itens do cartão em /lancamentos. */
  resumo: string;
  itensCartao: string[];
  intro: { rotulo: string; textos: string[] };
  conceito: { titulo: string; itens: ItemConceito[] };
  lazer: { rotulo: string; titulo: string; itens: string[] };
  tipologias: { titulo: string; itens: Tipologia[]; nota?: string };
  secoes: Secao[];
  fichaTecnica: string[];
  investimento: { titulo: string; valor: string; referencia?: string };
  aviso: string;
  /** Quantas fotos (foto-01...) e plantas (planta-1...) existem na pasta. */
  fotos: number;
  /** Fotos repetidas da capa, que não entram na galeria. */
  pularFotos?: number[];
  plantas: number;
  mapa: boolean;
  post?: string;
}

const AVISO_PADRAO =
  "As imagens, perspectivas, plantas e textos apresentados têm caráter meramente ilustrativo e podem sofrer alterações sem aviso prévio, não constituindo parte de qualquer instrumento jurídico. Valores, condições de pagamento e disponibilidade das unidades estão sujeitos a alteração conforme tabela vigente, sem aviso prévio. Acabamentos, mobiliário e objetos de decoração exibidos são sugestões e não fazem parte do memorial descritivo; a entrega ocorrerá conforme especificações contratuais. Para informações completas, consulte o Instrumento Particular de Promessa de Compra e Venda e o Memorial Descritivo do empreendimento.";

export const lancamentos: Lancamento[] = [
  {
    slug: "orlaipanema",
    nome: "Orla Ipanema",
    selo: "Lançamento oficial",
    endereco: "Rua Prudente de Morais, 1788 · Ipanema",
    chamada: "34 a 69 m² · Studios, Quarto e sala, Gardens e Coberturas",
    resumo:
      "Entre a praia, a Lagoa e o Country Club, o Orla Ipanema reúne exclusividade, lazer e investimento em um dos metros quadrados mais valorizados do Brasil.",
    itensCartao: [
      "Prudente de Morais, 1788",
      "34 a 69 m² · Studios · 1 quarto (Double Suíte) · Gardens · Coberturas",
      "Rooftop social · Piscina · Academia · Sauna",
      "Arquitetura Alexandre Feu | Interiores Ana Lúcia Jucá",
    ],
    intro: {
      rotulo: "A descontração da orla e a sofisticação de Ipanema",
      textos: [
        "Onde o mar encosta, nasce uma linha que é curva, é movimento, é orla.",
        "A poucos passos da praia, algumas pedaladas da Lagoa Rodrigo de Freitas e ao lado do clube mais exclusivo do Rio, o Country Club, nasce o Orla Ipanema na Prudente de Morais, 1788.",
        "Um ativo raro em um dos metros quadrados mais valorizados do Brasil, cercado por ícones como o Shopping Leblon, Cap Ferrat e Itacuruçá.",
      ],
    },
    conceito: {
      titulo: "Para você morar ou investir",
      itens: [
        { titulo: "Localização", texto: "Uma das vistas mais privilegiadas de Ipanema. Exclusividade rara que se traduz em liquidez imediata." },
        { titulo: "Valorização", texto: "Proteção patrimonial com alto potencial de crescimento em um mercado sólido e exclusivo." },
        { titulo: "Rentabilidade", texto: "Tipologias ideais para short ou long stay, com conveniências que ampliam a atratividade e o retorno do investimento." },
      ],
    },
    lazer: {
      rotulo: "Rooftop social",
      titulo: "Tudo o que você precisa para se sentir nas nuvens",
      itens: ["Sauna a vapor", "Piscina com deck molhado", "Academia integrada", "Solarium", "Hall de entrada", "Rooftop com vista excepcional"],
    },
    tipologias: {
      titulo: "Plantas inteligentes",
      itens: [
        { nome: "Studios", detalhe: "34 a 42 m² · 28 unidades" },
        { nome: "Sala e 1 quarto", detalhe: "50 a 55 m² · 16 unidades (opção Double Suíte)" },
        { nome: "Double Gardens", detalhe: "66 a 69 m² · 2 unidades" },
        { nome: "Coberturas", detalhe: "34 a 55 m² · 6 unidades" },
      ],
      nota: "Mix total: 52 unidades residenciais e 2 lojas comerciais. Plantas flexíveis, projetadas para funcionalidade, conforto e valorização.",
    },
    secoes: [
      {
        rotulo: "Design e história",
        titulo: "Arquitetura que interpreta a orla",
        textos: [
          "Na calçada, um ícone. Na fachada, uma referência. As curvas do caminho sobem, ganham altura e mudam o novo horizonte. A arquitetura não imita, interpreta.",
          "Arquitetura: Alexandre Feu. Arquitetura legal: Bassan Arquitetura.",
        ],
      },
      {
        rotulo: "Rooftop social",
        titulo: "Entre o agito da praia e a tranquilidade do seu rooftop, fique com os dois",
        textos: [
          "Lazer e bem-estar em um rooftop com vista excepcional, piscina com deck molhado, solarium e sauna a vapor para depois de um mergulho.",
          "Viver no Orla Ipanema é ter o privilégio de escolher: treinar na praia, na Lagoa ou na academia integrada ao seu rooftop.",
        ],
      },
      {
        rotulo: "Interiores",
        titulo: "Projeto exclusivo",
        textos: [
          "Conceito de bem-estar que dialoga com a descontração da orla e a sofisticação de Ipanema. Um projeto exclusivo para transformar o cotidiano em arte.",
          "Interiores: Ana Jucá.",
        ],
      },
      {
        rotulo: "Infraestrutura",
        titulo: "Tecnologia, segurança e mais praticidade na rotina",
        textos: [
          "Portaria inteligente, segurança integrada, lavanderia colaborativa e delivery center exclusivo.",
          "Comodidades que simplificam o dia a dia e aumentam a atratividade para short ou long stay.",
        ],
      },
    ],
    fichaTecnica: [
      "Rua Prudente de Morais, 1788 · Ipanema",
      "52 unidades residenciais e 2 lojas comerciais",
      "Arquitetura Alexandre Feu | Arquitetura legal Bassan Arquitetura | Interiores Ana Lúcia Jucá",
    ],
    investimento: {
      titulo: "Lançamento em primeira mão, onde escolher é privilégio",
      valor: "Studios a partir de R$ 1.400.000 e Double Suítes a partir de R$ 1.930.000",
      referencia:
        "O Orla Ipanema reúne exclusividade arquitetônica, localização insubstituível e alta atratividade para locação, seja short ou long stay. São unidades raras em um dos metros quadrados mais valorizados do Brasil. Uma oportunidade única de proteger patrimônio e capturar valorização em longo prazo.",
    },
    aviso:
      "Imagens, perspectivas, plantas e textos apresentados têm caráter meramente ilustrativo e podem sofrer alterações sem aviso prévio, não constituindo parte de nenhum instrumento jurídico; informações, condições e disponibilidade das unidades serão divulgadas na abertura oficial; mobiliário, equipamentos e objetos de decoração exibidos são sugestões de ambientação e não integram o memorial descritivo. Para informações completas, consulte o Instrumento Particular de Promessa de Compra e Venda e o Memorial Descritivo do empreendimento.",
    fotos: 21,
    pularFotos: [1],
    plantas: 5,
    mapa: false,
    post: "orla-ipanema-exclusividade-bem-estar-e-uma-das-vistas-mais-privilegiadas-do-rio",
  },
  {
    slug: "belavistaipanema",
    nome: "Belavista Ipanema",
    selo: "Última unidade",
    endereco: "Rua Prudente de Morais, 1050 · Ipanema",
    chamada: "303 m² · 4 suítes master · Varanda com vidro retrátil · Vista 360° do Dois Irmãos à Lagoa",
    resumo:
      "Um andar inteiro só seu na quadra da praia. Vidros piso-teto abraçam mar, Dois Irmãos e Lagoa, enquanto spa, piscina aquecida e gym Bodytech elevam o dia a dia. Exclusividade absoluta: resta apenas um apartamento.",
    itensCartao: ["Prudente de Morais, 1050 · Ipanema", "303 m² · 4 suítes master · 3 vagas", "Vista 360° | um por andar", "Wellness floor by Bodytech"],
    intro: {
      rotulo: "A cidade encontra o seu lar",
      textos: [
        "A beleza de Ipanema vai além do cenário: vive na leveza dos dias ao ar livre, na elegância natural das pessoas e no encontro genuíno entre mar, cultura e alta gastronomia. Por isso, é o metro quadrado mais desejado do país.",
        "Hermès, Louis Vuitton, Fasano, Bodytech: tudo a poucos passos, com ciclovia na porta.",
      ],
    },
    conceito: {
      titulo: "Escolha viver de todos os ângulos",
      itens: [
        { titulo: "360º de transparência", texto: "Vidros piso-teto contornam todo o perímetro, sem “costas” para a cidade." },
        { titulo: "Assinatura Cité", texto: "Conceito inspirado no ritmo das marés e nas linhas do horizonte." },
        { titulo: "Interiores e arte", texto: "Quiet luxury por Studio Roca e esculturas orgânicas do Estudio Manus no lobby." },
      ],
    },
    lazer: {
      rotulo: "Wellness",
      titulo: "Bem-estar começa em casa",
      itens: ["Gym by Bodytech", "Piscinas aquecidas", "Terraço gourmet", "Sala de massagem", "Spa Relaxing", "Saunas", "Spa Vitality", "Sala de Pilates", "Espaço kids", "Salão social"],
    },
    tipologias: {
      titulo: "Um andar inteiro para chamar de seu",
      itens: [{ nome: "Apartamento padrão", detalhe: "303 m² privativos · 4 suítes · varanda com vidro retrátil · suíte máster panorâmica · 3 vagas" }],
      nota: "Programa My Choice para personalizar layout e acabamentos.",
    },
    secoes: [
      {
        rotulo: "Segurança e tecnologia",
        titulo: "Segurança e tecnologia que libertam o seu tempo",
        textos: [
          "Guarita blindada, controle de pedestres por reconhecimento facial, TAG veicular, monitoramento 24 h e gerador de emergência.",
          "Tomadas para carros e bikes elétricas em todas as garagens. App de gestão condominial e Wi-Fi nas áreas comuns.",
          "Concierge, meeting room, courier e serviços pay-per-use (personal trainer, spa).",
        ],
      },
      {
        rotulo: "Sustentabilidade",
        titulo: "Elegância que respeita o planeta",
        textos: [
          "Fachada de baixa manutenção, caixilhos de alumínio de alta estanqueidade e iluminação inteligente nas garagens. Medidores individuais, coleta seletiva e reuso de água nas áreas comuns.",
        ],
      },
    ],
    fichaTecnica: [
      "Rua Prudente de Morais, 1050 · Ipanema",
      "19 unidades (17 standard de 303 m², 1 up garden de 513 m², 1 penthouse de 608 m²) | 3 vagas por unidade",
      "Arquitetura Cité Arquitetura | Interiores Studio Roca | Arte Estudio Manus | Wellness Bodytech / The Wellness Lab",
      "Segurança Haganá | Engenharia SIG | Realização Opportunity Fundo de Investimento Imobiliário",
    ],
    investimento: {
      titulo: "Agende sua visita e descubra como é viver Ipanema em 360°",
      valor: "Valor sob consulta",
      referencia: "Referência julho/25: faixa de R$ 10,9 mi a R$ 11,5 mi, sujeito a alteração conforme tabela vigente.",
    },
    aviso: AVISO_PADRAO,
    fotos: 20,
    plantas: 5,
    mapa: true,
    post: "belavista-ipanema-exclusividade-de-um-andar-inteiro-para-chamar-de-seu",
  },
  {
    slug: "vistaipanema",
    nome: "Vista Ipanema",
    selo: "Escolha a sua planta",
    endereco: "Rua Prudente de Morais, 281 · Ipanema",
    chamada: "173 a 346 m² · até 4 suítes · 3 a 6 vagas · Meio-andar e andar inteiro",
    resumo:
      "Vidros curvos entregam horizonte de nascer a pôr do sol. Arquitetura Cité, interiores Fernanda Marques e arte urbana criam quiet luxury carioca. Sauna, piscina com deck e fitness exclusivo completam o lifestyle.",
    itensCartao: [
      "Prudente de Morais, 281 · Ipanema",
      "173 a 346 m² · a partir de 3 suítes · 3 a 6 vagas",
      "Vista 180° | meio-andar e andar inteiro",
      "Up Garden, Apartamentos e Cobertura duplex",
    ],
    intro: {
      rotulo: "Vista para o Arpoador",
      textos: [
        "De um lado, o mar, o sal e o pôr do sol que colore o Arpoador; do outro, a cidade que pulsa com arte, gastronomia e noites inesquecíveis. Ipanema é essa síntese rara entre natureza e efervescência: basta atravessar a rua para trocar a prancha pelo espresso no Fasano, o pedal na ciclovia pelo jantar no Satyricon.",
        "Aqui, tudo é visto e tudo é vista. Morar no Vista Ipanema é viver essa dualidade icônica todos os dias.",
      ],
    },
    conceito: {
      titulo: "Aqui tudo é visto, tudo é vista",
      itens: [
        { titulo: "180º de panorama", texto: "Curvas da fachada capturam do nascer ao pôr do sol em Ipanema." },
        { titulo: "Assinatura Cité", texto: "Leveza, filtros e movimento na cortina d'água do embasamento." },
        { titulo: "Interiores e arte", texto: "Interiores por Fernanda Marques e curadoria de arte por Paola Fabres e Bruna Bailune." },
      ],
    },
    lazer: {
      rotulo: "Lazer único na Zona Sul",
      titulo: "Bem-estar sem sair de casa",
      itens: ["Piscina com deck molhado", "Terraço gourmet", "Salão gourmet", "Fitness", "Wellness", "Sala de reunião", "Lobby", "Espaço kids", "Bicicletário"],
    },
    tipologias: {
      titulo: "Escolha o tamanho da sua vista",
      itens: [
        { nome: "Up Garden", detalhe: "304 m² · 3 suítes · terraço privativo · 3 vagas" },
        { nome: "Meio-andar", detalhe: "173 m² · 3 suítes · até 3 vagas" },
        { nome: "Andar inteiro", detalhe: "346 m² · 4 quartos ou 4 suítes · até 6 vagas" },
        { nome: "Cobertura duplex", detalhe: "344 m² · 6 vagas" },
      ],
      nota: "Cada unidade conta com um box exclusivo e infraestrutura para adega climatizada.",
    },
    secoes: [
      {
        rotulo: "Segurança Haganá",
        titulo: "Segurança que valoriza seu tempo",
        textos: [
          "Guarita blindada, reconhecimento facial para pedestres e veículos, ante-câmara de acesso e monitoramento 24 h, com a excelência Haganá desde 1997.",
          "Gerador emergencial, app condominial, Wi-Fi nas áreas comuns e 35 pontos para recarga de carros elétricos.",
        ],
      },
      {
        rotulo: "Sustentabilidade",
        titulo: "Vista que respeita o meio ambiente",
        textos: ["Fachada de baixa manutenção, reaproveitamento de água da chuva, medição individual, LED e sensores nas garagens e previsão de 35 carregadores para carros elétricos."],
      },
    ],
    fichaTecnica: [
      "Rua Prudente de Morais, 281 · Ipanema",
      "18 pavimentos de uso privativo | 1 a 2 unidades por andar",
      "173 m² a 346 m² | a partir de 3 suítes, com opções de meio-andar ou andar inteiro",
      "Arquitetura e fachada Cité Arquitetura | Interiores Fernanda Marques | Curadoria de arte Paola Fabres & Bruna Bailune",
      "Segurança Haganá | Construtora Belassiano Engenharia | Realização Opportunity Fundo de Investimento Imobiliário",
    ],
    investimento: {
      titulo: "Invista na sua nova vista",
      valor: "Valor sob consulta",
      referencia: "Referência julho/25: faixa de R$ 6,1 mi (173 m²) a R$ 19,6 mi (344 m²), sujeito a alteração conforme tabela vigente.",
    },
    aviso: AVISO_PADRAO,
    fotos: 18,
    plantas: 4,
    mapa: true,
    post: "vista-ipanema-onde-tudo-é-visto-tudo-é-vista",
  },
  {
    slug: "786prudente",
    nome: "786 Prudente",
    selo: "Apartamentos disponíveis",
    endereco: "Rua Prudente de Morais, 786 · Ipanema",
    chamada: "167 a 330 m² · 3 suítes · até 3 vagas · Na quadra da praia",
    resumo:
      "Volumes que evocam pedra sobre pedra levam a assinatura Cité. Townhouses, up gardens, apartamentos e coberturas duplex unem design contemporâneo, lazer completo e segurança Haganá, tudo a poucos passos da praia de Ipanema.",
    itensCartao: ["Prudente de Morais, 786 · Ipanema", "167 a 330 m² · 3 suítes · até 3 vagas · Quadra da praia", "My Choice: layout e acabamento sob medida"],
    intro: {
      rotulo: "Mar ao sul, Lagoa ao norte",
      textos: [
        "Tomar um brunch no Fasano, pedalar até a Lagoa, jantar no Satyricon: tudo cabe em três quadras quando seu endereço é a Prudente de Morais, a síntese perfeita de natureza e efervescência urbana.",
      ],
    },
    conceito: {
      titulo: "Pedra sobre pedra, andar após andar",
      itens: [
        { titulo: "Volumetria Cité", texto: "Blocos empilhados criam varandas que flutuam sobre as copas de Ipanema." },
        { titulo: "Interiores PKB", texto: "Luxo leve, texturas naturais e marcenaria autoral nas áreas comuns." },
        { titulo: "Arte contemporânea", texto: "Curadoria Paola Fabres & Bruna Bailune integra obras ao lobby e aos jardins." },
      ],
    },
    lazer: {
      rotulo: "Bem-estar e social",
      titulo: "Lazer que prolonga a brisa",
      itens: [
        "Sala de massagem",
        "Salão de beleza",
        "Piscina com deck molhado",
        "Espaço fitness",
        "Espaço gourmet",
        "Terraço gourmet",
        "Espaço delivery",
        "Sala de reunião",
        "Sauna a vapor com repouso",
        "Lounge",
        "Espaço teen e kids",
      ],
    },
    tipologias: {
      titulo: "Quatro tipologias para quatro estilos de vida",
      itens: [
        { nome: "Apartamento tipo", detalhe: "167 m² · 3 suítes · até 3 vagas" },
        { nome: "Townhouse duplex", detalhe: "196 a 207 m² · 3 suítes · 3 vagas" },
        { nome: "Up Garden", detalhe: "229 a 284 m² · 3 suítes · 2 vagas · terraço privativo" },
        { nome: "Cobertura duplex", detalhe: "330 m² · 3 suítes · 3 vagas · vista Lagoa e mar" },
      ],
    },
    secoes: [
      {
        rotulo: "Programa My Choice",
        titulo: "Seu layout, seu acabamento",
        textos: ["Escolha on-line entre três opções de layout e acabamentos como pisos, bancadas e marcenaria premium, tudo durante a obra, com garantia de prazo e qualidade."],
      },
      {
        rotulo: "Segurança e tecnologia",
        titulo: "Proteção que acompanha a elegância",
        textos: [
          "Guarita blindada, reconhecimento facial, ante-câmara de acesso, monitoramento 24 h e botão SOS na piscina: projeto Haganá, excelência desde 1997.",
          "Gerador, Wi-Fi nas áreas comuns, app condominial, tomada para carro elétrico em cada pavimento e bicicletário com recarga.",
        ],
      },
      {
        rotulo: "Sustentabilidade",
        titulo: "Elegância sustentável",
        textos: ["Reuso de água da chuva, LED com sensores, medição individual, fachada de baixa manutenção e coleta seletiva reduzem custos e pegada ambiental."],
      },
    ],
    fichaTecnica: [
      "Rua Prudente de Morais, 786 · Ipanema",
      "42 unidades: 2 townhouses duplex de 196 a 207 m² · 2 up gardens de 229 a 284 m² · 2 coberturas de 330 m² · 36 apartamentos tipo de 167 m²",
      "Arquitetura Cité Arquitetura | Interiores PKB Arquitetura | Curadoria de arte Paola Fabres & Bruna Bailune",
      "Segurança Haganá | Construção Belassiano Engenharia | Realização Opportunity Fundo de Investimento Imobiliário",
    ],
    investimento: {
      titulo: "Viva a vida por inteiro",
      valor: "Valor sob consulta",
      referencia: "Referência julho/25: faixa de R$ 5,96 mi a R$ 9,75 mi (167 m²), sujeito a alteração conforme tabela vigente.",
    },
    aviso:
      "Imagens, perspectivas, plantas e textos apresentados têm caráter meramente ilustrativo e podem sofrer alterações sem aviso prévio, não constituindo parte de nenhum instrumento jurídico. Valores, condições de pagamento e disponibilidade das unidades estão sujeitos a mudança conforme a tabela vigente, sem aviso prévio. Mobiliário, equipamentos e objetos de decoração exibidos são sugestões de ambientação e não integram o memorial descritivo, cuja entrega ocorrerá de acordo com as especificações contratuais. Para informações completas, consulte o Instrumento Particular de Promessa de Compra e Venda e o Memorial Descritivo do empreendimento 786 Prudente.",
    fotos: 21,
    plantas: 3,
    mapa: true,
    post: "786-prudente-volumes-de-pedra-sobre-pedra-no-coração-de-ipanema",
  },
];

export const textoLancamentos = {
  titulo: "Novos horizontes em Ipanema",
  subtitulo: "Endereços selecionados para quem valoriza quiet luxury, liquidez patrimonial e a vista mais famosa do Rio.",
  textos: [
    "Ipanema concentra o metro quadrado mais desejado da cidade, e não à toa: aqui, mar, cultura e alta gastronomia se encontram a poucos passos. Nesta página você encontra lançamentos exclusivos na Rua Prudente de Morais, todos com curadoria da Patrimóvel ADM.",
    "Cada projeto oferece vistas livres, amenidades premium e um padrão construtivo que garante alta valorização no tempo. Escolha abaixo o endereço que combina com seu estilo de vida ou portfólio de investimentos e converse com nosso time para receber a apresentação completa.",
  ],
  aviso: "Imagens ilustrativas. Valores, características e disponibilidade podem ser alterados sem aviso prévio.",
};

export function lancamentoPorSlug(slug: string) {
  return lancamentos.find((l) => l.slug === slug) ?? null;
}

export const pastaLancamento = (slug: string) => `/img/lancamentos/${slug}`;

export function fotosDoLancamento(l: Lancamento): string[] {
  const pular = new Set(l.pularFotos ?? []);
  const base = pastaLancamento(l.slug);
  return [
    `${base}/hero.webp`,
    ...Array.from({ length: l.fotos }, (_, i) => i + 1).filter((n) => !pular.has(n)).map((n) => `${base}/foto-${String(n).padStart(2, "0")}.webp`),
  ];
}

export function plantasDoLancamento(l: Lancamento): string[] {
  return Array.from({ length: l.plantas }, (_, i) => `${pastaLancamento(l.slug)}/planta-${i + 1}.webp`);
}
