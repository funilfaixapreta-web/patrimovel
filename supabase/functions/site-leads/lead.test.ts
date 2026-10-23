import { assertEquals } from "jsr:@std/assert@1.0.8";
import { lerLeadSite, mesclarObservacoes, telefoneE164, variantesDoTelefone, type LeadSite } from "./lead.ts";

Deno.test("telefone com máscara vira E.164 com DDI 55", () => {
  assertEquals(telefoneE164("(21) 99999-1234"), "+5521999991234");
  assertEquals(telefoneE164("+55 21 3152-5985"), "+552131525985");
  assertEquals(telefoneE164("123"), null);
});

Deno.test("variantes com e sem o 9º dígito", () => {
  assertEquals(variantesDoTelefone("+5521999991234").sort(), ["+552199991234", "+5521999991234"].sort());
  assertEquals(variantesDoTelefone("+552131525985").sort(), ["+552131525985", "+5521931525985"].sort());
});

Deno.test("formulário inválido é recusado", () => {
  assertEquals(lerLeadSite({ origem: "xpto", telefone: "21999991234" }), { erro: "origem inválida" });
  assertEquals(lerLeadSite({ origem: "contato", nome: "Ana" }), { erro: "Informe telefone ou e-mail" });
});

Deno.test("campos são cortados e normalizados", () => {
  const l = lerLeadSite({
    origem: "ficha_visita",
    nome: "  Ana Souza ",
    telefone: "(21) 99999-1234",
    email: "ANA@EXEMPLO.COM",
    imovel_codigo: "ap0135_rvsaoc",
    negocio: "alugar",
    mensagem: "x".repeat(5000),
    data_visita: "30/10/2026",
    periodo_visita: "manhã",
    pagina: "/imovel/AP0135_RVSAOC",
  }) as LeadSite;
  assertEquals(l.nome, "Ana Souza");
  assertEquals(l.email, "ana@exemplo.com");
  assertEquals(l.codigoImovel, "AP0135_RVSAOC");
  assertEquals(l.mensagem?.length, 2000);
  assertEquals(l.negocio, "alugar");
});

Deno.test("mesclar preserva o que a agente gravou e acumula imóveis", () => {
  const antes = JSON.stringify({ ai_fields: { imovel_origem: "AP0001", nome_preferido: "Ana" }, ai_internal: { x: 1 } });
  const l = lerLeadSite({ origem: "ficha_contato", telefone: "21999991234", imovel_codigo: "CA0002", negocio: "comprar" }) as LeadSite;
  const depois = JSON.parse(mesclarObservacoes(antes, l, "2026-10-23T12:00:00Z"));
  assertEquals(depois.ai_fields.imovel_origem, "AP0001");
  assertEquals(depois.ai_fields.imoveis_apresentados, "CA0002");
  assertEquals(depois.ai_fields.finalidade, "venda");
  assertEquals(depois.ai_fields.nome_preferido, "Ana");
  assertEquals(depois.ai_internal.x, 1);
  assertEquals(depois.ai_internal.site.length, 1);
});

Deno.test("observação em texto livre antigo vira notes", () => {
  const l = lerLeadSite({ origem: "contato", email: "a@b.com" }) as LeadSite;
  const depois = JSON.parse(mesclarObservacoes("cliente ligou", l, "2026-10-23T12:00:00Z"));
  assertEquals(depois.notes, "cliente ligou");
});
