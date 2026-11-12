// Posts do blog do site antigo (Wix), com os mesmos endereços:
// /post/{slug}, /blog e /blog/categories/{categoria}. Imagens em
// public/img/blog/{id}.webp. Texto em **negrito** vira <strong>.

export type Bloco =
  | { t: "h2" | "h3" | "p" | "cita"; x: string }
  | { t: "lista"; itens: string[] }
  | { t: "img"; src: string };

export interface Post {
  slug: string;
  titulo: string;
  resumo: string;
  data: string;
  capa: string;
  categorias: Categoria[];
  lancamento?: string;
  blocos: Bloco[];
}

export type Categoria = "imóveis" | "lançamentos" | "ipanema";

export const categorias: { slug: Categoria; nome: string }[] = [
  { slug: "imóveis", nome: "Imóveis" },
  { slug: "lançamentos", nome: "Lançamentos" },
  { slug: "ipanema", nome: "Ipanema" },
];

const img = (id: string): Bloco => ({ t: "img", src: `/img/blog/${id}.webp` });

export const posts: Post[] = [
  {
    slug: "orla-ipanema-exclusividade-bem-estar-e-uma-das-vistas-mais-privilegiadas-do-rio",
    titulo: "Orla Ipanema: exclusividade, bem-estar e uma das vistas mais privilegiadas do Rio",
    resumo: "Um lançamento raro entre o mar e a Lagoa, assinado por Alexandre Feu e Ana Lúcia Jucá.",
    data: "2025-09-01",
    capa: "/img/blog/5a0db178.webp",
    categorias: ["imóveis", "lançamentos", "ipanema"],
    lancamento: "orlaipanema",
    blocos: [
      { t: "cita", x: "Um **lançamento raro** entre o mar e a Lagoa, assinado por Alexandre Feu e Ana Lúcia Jucá." },
      img("29569c3d"),
      { t: "p", x: "Na Rua Prudente de Morais, 1788, entre a praia, a Lagoa e o Country Club, nasce o **Orla Ipanema**, um projeto que traduz o lifestyle carioca em arquitetura, design e exclusividade." },
      { t: "p", x: "Um endereço raro, em um dos metros quadrados mais valorizados do Brasil, onde viver é sinônimo de bem-estar e investir é sinônimo de visão." },
      { t: "h2", x: "Arquitetura que interpreta a orla" },
      { t: "p", x: "Assinado pelo arquiteto **Alexandre Feu**, o projeto foi pensado para dialogar com a paisagem e a leveza de Ipanema." },
      { t: "p", x: "Na calçada, um ícone. Na fachada, uma referência. As curvas do caminho sobem e mudam o horizonte." },
      { t: "p", x: "A arquitetura não imita: interpreta a orla, traduzindo movimento, luz e harmonia em cada detalhe." },
      img("5a0db178"),
      img("aabd866b"),
      { t: "h2", x: "Interiores: bem-estar e sofisticação" },
      { t: "p", x: "Com projeto de interiores da renomada **Ana Lúcia Jucá**, o Orla Ipanema combina conforto e elegância em medidas exatas." },
      { t: "p", x: "O conceito de bem-estar aparece nas escolhas de materiais, nas texturas e na paleta que reflete a atmosfera de Ipanema: sofisticada, leve e acolhedora." },
      { t: "p", x: "Um projeto exclusivo, onde cada ambiente foi pensado para transformar o cotidiano em arte." },
      img("602b7f0b"),
      { t: "h2", x: "Plantas inteligentes e flexíveis" },
      { t: "p", x: "O Orla oferece **52 unidades residenciais de 34 a 69 m²** e **2 lojas no térreo**, com tipologias que se adaptam a diferentes perfis:" },
      {
        t: "lista",
        itens: [
          "**Studios** | 34 a 42 m² · 28 unidades",
          "**1 Quarto (opção Double Suíte)** | 50 a 55 m² · 16 unidades",
          "**Double Gardens** | 66 a 69 m² · 2 unidades",
          "**Coberturas** | 34 a 55 m² · 6 unidades",
        ],
      },
      { t: "p", x: "Com layouts otimizados e plantas funcionais, o empreendimento combina design inteligente e praticidade, atendendo tanto quem busca um endereço exclusivo para morar quanto quem deseja investir com segurança e liquidez." },
      img("2761542d"),
      img("86880966"),
      img("a86ad7fc"),
      { t: "h2", x: "Rooftop social: um refúgio nas alturas" },
      { t: "p", x: "Entre o agito da praia e a tranquilidade da Lagoa, o rooftop do Orla é um verdadeiro refúgio suspenso." },
      { t: "p", x: "**Piscina com deck molhado**, **academia** integrada, **solarium** e **sauna a vapor** compõem um espaço de lazer que eleva o conceito de bem-estar." },
      { t: "p", x: "Tudo o que você precisa para se sentir nas nuvens, com uma das vistas mais privilegiadas de Ipanema." },
      { t: "h2", x: "Infraestrutura inteligente" },
      { t: "p", x: "O Orla Ipanema foi projetado para unir tecnologia, conforto e conveniência." },
      { t: "p", x: "Portaria inteligente, segurança integrada, lavanderia colaborativa e delivery center exclusivo trazem praticidade ao dia a dia e eficiência para quem investe." },
      { t: "p", x: "Soluções que simplificam a rotina e ampliam o valor do investimento, seja em locações de temporada ou long stay." },
      img("cb4c75e5"),
      { t: "h2", x: "Investimento: qualidade de vida e rentabilidade" },
      { t: "p", x: "Viver ou investir em Ipanema é estar no centro do desejo carioca. O Orla representa uma oportunidade rara de adquirir um imóvel na planta com alto potencial de valorização e liquidez imediata. Um endereço que combina **qualidade de vida, lazer e investimento** na medida certa para quem busca rentabilidade real e proteção patrimonial." },
      { t: "p", x: "Studios a partir de **R$ 1.400.000** e Double Suítes a partir de **R$ 1.930.000**." },
      { t: "p", x: "Um produto exclusivo, com condições especiais de lançamento." },
      { t: "p", x: "* Valor sujeito a alteração sem aviso prévio, conforme disponibilidade e tabela vigente." },
      { t: "h2", x: "Sobre a Patrimóvel ADM" },
      { t: "p", x: "Boutique imobiliária especializada em imóveis de alto padrão e lançamentos exclusivos no Rio de Janeiro." },
      { t: "p", x: "Na Patrimóvel ADM, cada endereço é selecionado com curadoria, autenticidade e propósito." },
      { t: "p", x: "**Aqui, escolher é um privilégio.**" },
    ],
  },
  {
    slug: "belavista-ipanema-exclusividade-de-um-andar-inteiro-para-chamar-de-seu",
    titulo: "Belavista Ipanema: exclusividade de um andar inteiro para chamar de seu",
    resumo: "Só 19 endereços, um por andar, e temos um disponível pra você!",
    data: "2025-09-01",
    capa: "/img/blog/ad2ffaa3.webp",
    categorias: ["imóveis", "lançamentos", "ipanema"],
    lancamento: "belavistaipanema",
    blocos: [
      { t: "h3", x: "Só 19 endereços, um por andar, e temos um **disponível pra você**!" },
      img("8bee662e"),
      { t: "h2", x: "Ipanema: viver bem de verdade" },
      { t: "p", x: "A beleza de Ipanema vai além do cenário: está na leveza dos dias ao ar livre, na elegância natural das pessoas e no encontro entre mar, cultura e alta gastronomia. Por isso, é o metro quadrado mais desejado do país. Hermès, Louis Vuitton, Fasano e Bodytech ficam a poucos passos, com ciclovia na porta." },
      { t: "h2", x: "Arquitetura que abraça o horizonte" },
      { t: "p", x: "Projetado pela **Cité Arquitetura**, o **Belavista** foi concebido para aproveitar a transparência, o ritmo das marés e as linhas contínuas do horizonte: todos os ambientes têm **vista 360 graus**, sem “fundos” voltados para a cidade. A fachada em vidro piso-teto contorna cada andar, diluindo limites entre interior e paisagem." },
      img("86f2a13c"),
      { t: "cita", x: "“Observar o oceano foi inspiração para um desenho que não vira as costas ao Rio.”" },
      { t: "h2", x: "Planta exclusiva e personalização" },
      { t: "p", x: "**Cada apartamento padrão oferece 303,64 m² privativos**, quatro suítes, varandas com vidro retrátil e suíte máster panorâmica. O programa **My Choice** permite escolher layout e acabamentos on-line, durante a obra, garantindo qualidade e prazos de entrega." },
      img("b3c88ba6"),
      { t: "h2", x: "Wellness floor by Bodytech" },
      { t: "p", x: "Um andar inteiro combina **hidroterapia**, **piscinas aquecidas** e circuitos **Vitality & Relaxing** para recuperação muscular personalizada. O **gym** assinado pela Bodytech/The Wellness Lab integra musculação, cardio e **Pilates** com tecnologia de ponta." },
      img("a7fe7b3d"),
      img("f74ffa4b"),
      { t: "h2", x: "Serviços, segurança e tecnologia" },
      {
        t: "lista",
        itens: [
          "Acesso facial, guarita blindada e monitoramento 24 h garantem tranquilidade",
          "Gerador para emergências, Wi-Fi nas áreas comuns e app condominial otimizam gestão e conforto",
          "Garagens com tomadas para carros e bikes elétricas reforçam praticidade e visão de futuro",
        ],
      },
      { t: "h2", x: "Sustentabilidade em cada detalhe" },
      { t: "p", x: "Iluminação inteligente, medidores individuais, coleta seletiva e uso de caixilhos de alumínio de alta estanqueidade reduzem consumo de recursos e custos de manutenção." },
      img("b929f27f"),
      { t: "h2", x: "Essa é a sua chance" },
      { t: "p", x: "São apenas 19 unidades no total. E temos uma disponível pra você." },
      { t: "p", x: "Um andar inteiro de 303 m² pronto para ser personalizado ao seu estilo de vida carioca." },
      { t: "p", x: "Investimento: **valor sob consulta***" },
      { t: "p", x: "Referência julho/25: faixa de R$ 10,9 mi a R$ 11,5 mi, sujeito a alteração conforme tabela vigente." },
      { t: "p", x: "* Valor sujeito a alteração sem aviso prévio, conforme disponibilidade e tabela vigente." },
      { t: "p", x: "Fale agora com o time da Patrimóvel ADM no WhatsApp e descubra como é **viver Ipanema em 360 graus**." },
    ],
  },
  {
    slug: "786-prudente-volumes-de-pedra-sobre-pedra-no-coração-de-ipanema",
    titulo: "786 Prudente: volumes de pedra sobre pedra no coração de Ipanema",
    resumo: "Viver inteiro é ter a praia, a Lagoa e a cidade, tudo a um passo de casa.",
    data: "2025-09-01",
    capa: "/img/blog/dca56c90.webp",
    categorias: ["imóveis", "lançamentos", "ipanema"],
    lancamento: "786prudente",
    blocos: [
      { t: "h3", x: "Viver inteiro é ter a praia, a Lagoa e a cidade, **tudo a um passo de casa.**" },
      img("d76d4c17"),
      { t: "h2", x: "A localização que nunca sai de moda" },
      { t: "p", x: "Fasano, Bodytech e Satyricon: o melhor de Ipanema cabe em três quadras. A **Rua Prudente de Morais** garante a leveza da orla e acesso rápido ao Leblon e à Lagoa." },
      { t: "h2", x: "Arquitetura pedra sobre pedra" },
      { t: "p", x: "A **Cité Arquitetura** desenha volumes que parecem empilhados como blocos naturais, criando varandas generosas e integração total entre interior e copas verdes. Nas áreas comuns do 786 Prudente, o luxo leve da **PKB Arquitetura** encontra a arte contemporânea de Paola Fabres & Bruna Bailune." },
      img("f8e79f63"),
      { t: "h2", x: "Quatro tipologias para quatro estilos de vida" },
      {
        t: "lista",
        itens: [
          "**Apartamento tipo** | 167 m² · 3 suítes · até 3 vagas",
          "**Townhouse duplex** | 196 a 207 m² · 3 suítes · 3 vagas",
          "**Up Garden** | 229 a 284 m² · 3 suítes · 2 vagas · Terraço privativo",
          "**Cobertura duplex** | 330 m² · 3 suítes · 3 vagas · vista Lagoa & mar",
        ],
      },
      { t: "h2", x: "My Choice: personalize antes de morar" },
      { t: "p", x: "A plataforma **My Choice** permite escolher entre quatro layouts e acabamentos premium on-line durante a obra, mantendo prazo e qualidade." },
      img("ade28ee6"),
      { t: "h2", x: "Lazer & bem-estar que abraçam todos" },
      { t: "p", x: "**Piscina aquecida** com **deck** molhado, infantil separada, **sauna a vapor** e sala de repouso, espaço **Fitness**, sala de yoga, **Lounge Gourmet com terraço**, Kids & Teen Lounge e salão de beleza." },
      img("58a0f9f8"),
      img("a1eb781b"),
      { t: "h2", x: "Segurança Haganá: excelência há 28 anos" },
      { t: "p", x: "Guarita blindada, reconhecimento facial, ante-câmara de acesso e monitoramento 24 h. Botão SOS na piscina e gerador para áreas críticas." },
      { t: "h2", x: "Tecnologia & sustentabilidade" },
      { t: "p", x: "App condominial, Wi-Fi nas áreas comuns, tomada para carro elétrico em cada pavimento, bicicletário com recarga, reuso de água da chuva, LED inteligente e medição individual." },
      img("f3cfc916"),
      { t: "h2", x: "Viva a vida por inteiro." },
      { t: "p", x: "Investimento: **valor sob consulta***" },
      { t: "p", x: "Referência julho/25: faixa de R$ 5,96 mi a R$ 9,75 mi (167 m²), sujeito a alteração conforme tabela vigente." },
      { t: "p", x: "* Valor sujeito a alteração sem aviso prévio, conforme disponibilidade e tabela vigente." },
      { t: "p", x: "Fale agora com o time da Patrimóvel ADM no WhatsApp e descubra como **viver (ou investir) no volume mais desejado de Ipanema**." },
    ],
  },
  {
    slug: "vista-ipanema-onde-tudo-é-visto-tudo-é-vista",
    titulo: "Vista Ipanema: onde tudo é visto, tudo é vista",
    resumo: "Aqui tudo é visto, tudo é Vista. Basta olhar.",
    data: "2025-09-01",
    capa: "/img/blog/8660464a.webp",
    categorias: ["imóveis", "lançamentos", "ipanema"],
    lancamento: "vistaipanema",
    blocos: [
      { t: "h3", x: "Aqui tudo é visto, tudo é Vista. Basta olhar." },
      img("8265c8a0"),
      { t: "h2", x: "Ipanema em dois ângulos" },
      { t: "p", x: "Do mar que nasce no Arpoador à noite vibrante da Prudente de Morais, Ipanema é o metro quadrado que une natureza e efervescência urbana. Fasano, Bodytech e Satyricon ficam a menos de três minutos a pé." },
      { t: "h2", x: "Arquitetura que abraça o horizonte" },
      { t: "p", x: "A fachada curva assinada pela **Cité Arquitetura** garante panorama de **180°** para cada unidade. Nas áreas comuns, o design minimalista de **Fernanda Marques** encontra a curadoria de arte urbana de **Paola Fabres & Bruna Bailune**, criando um lobby que reflete o quiet luxury carioca." },
      img("9e54fe01"),
      { t: "h2", x: "My Choice: sua planta, seu acabamento" },
      { t: "p", x: "O programa **My Choice** abre um portal on-line para você escolher entre quatro layouts e acabamentos premium durante a obra, com garantia de prazo e qualidade construtiva." },
      img("19a7d1c2"),
      { t: "h2", x: "Bem-estar sem sair de casa" },
      { t: "p", x: "**Sauna a vapor** com sala de repouso, **piscina com deck molhado** e solário, **fitness completo** de 85 m², além de **Salão & Terraço Gourmet** e Espaço Kids: um **lazer exclusivo na Zona Sul**." },
      img("85d5716f"),
      img("3cf51cf7"),
      img("b5decdce"),
      { t: "h2", x: "Segurança & tecnologia" },
      { t: "p", x: "Projeto integral **Haganá** com guarita blindada, reconhecimento facial e monitoramento 24 h. Gerador, app condominial, Wi-Fi nas áreas comuns e previsão de **35 carregadores para veículos elétricos** completam o pacote tecnológico." },
      { t: "h2", x: "Sustentabilidade que valoriza" },
      { t: "p", x: "Reuso de água, LED inteligente, medição individual e fachada de baixa manutenção reduzem custos e pegada ambiental." },
      img("8660464a"),
      { t: "h2", x: "Invista na sua nova vista" },
      { t: "p", x: "Investimento: **valor sob consulta***" },
      { t: "p", x: "Referência julho/25: faixa de R$ 6,1 mi (173 m²) a R$ 19,6 mi (344 m²), sujeito a alteração conforme tabela vigente." },
      { t: "p", x: "* Valor sujeito a alteração sem aviso prévio, conforme disponibilidade e tabela vigente." },
      { t: "p", x: "Fale agora com o time da Patrimóvel ADM no WhatsApp e descubra como é **ter a melhor vista de Ipanema.**" },
    ],
  },
];

export function postPorSlug(slug: string) {
  const alvo = slug.normalize("NFC").toLowerCase();
  return posts.find((p) => p.slug.normalize("NFC") === alvo) ?? null;
}
