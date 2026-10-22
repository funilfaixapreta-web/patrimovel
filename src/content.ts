// Textos editáveis do site. O que estiver com CONFIRMAR é proposta e precisa do ok do cliente.

export const textosBairros: Record<string, { chamada: string; texto: string }> = {
  "barra-da-tijuca": {
    chamada: "Condomínios com lazer completo e praia de 18 km",
    texto:
      "Apartamentos e coberturas em condomínios com portaria, piscina e área verde, além de salas e andares corporativos perto da Av. das Américas. É também onde fica o nosso escritório.",
  },
  leblon: {
    chamada: "Ruas arborizadas, praia e tudo a pé",
    texto:
      "Prédios baixos, comércio de rua, restaurantes da Dias Ferreira e escolas tradicionais. Bairro procurado por famílias e por quem quer morar perto da praia sem depender de carro.",
  },
  ipanema: {
    chamada: "Entre o Arpoador e o Jardim de Alah",
    texto:
      "Apartamentos de todos os tamanhos a poucas quadras da praia, metrô na Praça General Osório e na Nossa Senhora da Paz e uma vida de bairro que funciona a pé.",
  },
  copacabana: {
    chamada: "O bairro mais procurado para alugar no Rio",
    texto:
      "Muita oferta de apartamentos de um e dois quartos, três estações de metrô, comércio 24 horas e a orla do Leme ao Posto 6.",
  },
  botafogo: {
    chamada: "Metrô, escritórios e vista para o Pão de Açúcar",
    texto:
      "Bairro de quem trabalha na Zona Sul e no Centro. Concentra andares corporativos modernos, prédios residenciais e a Praia de Botafogo.",
  },
  centro: {
    chamada: "Lajes e andares corporativos no coração da cidade",
    texto:
      "Andares inteiros, salas e prédios comerciais perto do metrô, do VLT e da Rio Branco, com plantas para escritórios de todos os portes.",
  },
  "recreio-dos-bandeirantes": {
    chamada: "Mais espaço por metro quadrado, perto da praia",
    texto:
      "Apartamentos amplos e coberturas em condomínios novos, com acesso rápido à Barra pela Av. das Américas e pelo BRT.",
  },
  gavea: {
    chamada: "Tranquilo, verde e perto da PUC",
    texto: "Ruas calmas ao pé da Floresta da Tijuca, colégios e universidade, a cinco minutos do Leblon.",
  },
  lagoa: {
    chamada: "Vista para a Lagoa Rodrigo de Freitas",
    texto: "Apartamentos amplos com vista para a Lagoa e o Cristo, ciclovia de 7,5 km na porta e acesso fácil a Ipanema e Leblon.",
  },
  "jardim-botanico": {
    chamada: "Casas e prédios baixos cercados de verde",
    texto: "Bairro residencial ao lado do Jardim Botânico e do Parque Lage, com restaurantes e escolas na vizinhança.",
  },
  itaipava: {
    chamada: "Região serrana de Petrópolis",
    texto: "Apartamentos, casas e lojas em Itaipava, a pouco mais de uma hora do Rio pela BR-040.",
  },
};

// CONFIRMAR todos os itens abaixo com a Patrimóvel ADM.
export const incluso = [
  ["Avaliação do aluguel", "Comparamos seu imóvel com os anúncios e contratos da região para chegar ao valor certo."],
  ["Anúncio e visitas", "Fotos, vídeo, publicação no site e nos portais ZAP, Viva Real e OLX. Um corretor acompanha cada visita."],
  ["Análise do inquilino", "Conferimos renda, cadastro e documentos antes de aprovar qualquer proposta."],
  ["Contrato e garantia", "Contrato feito pela nossa equipe, com a garantia escolhida junto com você."],
  ["Vistoria de entrada e saída", "Laudo com fotos de cada cômodo, assinado pelas duas partes."],
  ["Cobrança mensal", "Boleto para o inquilino, acompanhamento de atraso e cobrança quando necessário."],
  ["Repasse e extrato", "O aluguel cai na sua conta com extrato mostrando cada desconto."],
  ["Informe para o Imposto de Renda", "Relatório anual com tudo que você recebeu e pagou pelo imóvel."],
] as const;

export const passosAdministracao = [
  ["Conversa e avaliação", "Visitamos o imóvel, entendemos o que você espera e apresentamos o valor de aluguel e a nossa proposta por escrito."],
  ["Anúncio e visitas", "Publicamos o imóvel e levamos os interessados. Você recebe o retorno de cada visita."],
  ["Contrato assinado", "Aprovado o inquilino, fazemos vistoria, contrato e garantia. A chave só sai depois disso."],
  ["Todo mês", "Cobramos, repassamos e resolvemos o que aparecer, da manutenção à renovação do contrato."],
] as const;

export const faqAdministracao = [
  ["Quanto custa a administração?", "A taxa é apresentada por escrito na avaliação, antes de você assinar qualquer coisa. Anunciar o imóvel não tem custo."],
  ["Meu imóvel já está alugado. Vocês assumem o contrato?", "Sim. Pegamos o contrato em andamento, avisamos o inquilino e passamos a cuidar da cobrança e do repasse a partir do mês seguinte."],
  ["Quais garantias vocês aceitam?", "Seguro fiança, título de capitalização e caução. A escolha é feita com você, de acordo com o perfil do inquilino."],
  ["E se o inquilino atrasar?", "A cobrança é com a gente, do primeiro contato até a cobrança formal se for preciso. Você acompanha tudo pelo atendimento."],
  ["Quem paga a manutenção?", "Depende do que for. Reparos do dia a dia são do inquilino; estrutura e itens da lei são do proprietário. Avisamos antes de qualquer gasto seu."],
  ["Posso anunciar o imóvel para venda e aluguel ao mesmo tempo?", "Pode. Muitos imóveis da nossa carteira estão anunciados das duas formas."],
] as const;

export const passosVenda = [
  ["Avaliação", "Um corretor visita o imóvel e apresenta o valor de mercado com base em vendas recentes da região."],
  ["Divulgação", "Fotos, vídeo e anúncio no site e nos portais ZAP, Viva Real e OLX, além da nossa carteira de compradores."],
  ["Visitas e propostas", "Acompanhamos cada visita e trazemos as propostas por escrito."],
  ["Documentação e escritura", "Organizamos certidões, contrato e escritura até a entrega das chaves."],
] as const;
