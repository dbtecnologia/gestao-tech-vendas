import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { message } = await request.json();
  if (!message || typeof message !== "string") return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!groqKey && !openAiKey) return NextResponse.json({ error: "Configure GROQ_API_KEY ou OPENAI_API_KEY no ambiente para ativar a IA." }, { status: 503 });
  const system = "Você é o assistente comercial da Gestão Vendas Tech. Responda em português, seja objetivo e nunca invente dados. Quando não houver dados reais disponíveis, diga claramente que a integração do módulo ainda precisa ser configurada.";
  const [customers, visits, followUps, opportunities] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("visits").select("id", { count: "exact", head: true }),
    supabase.from("follow_ups").select("id", { count: "exact", head: true }),
    supabase.from("opportunities").select("id", { count: "exact", head: true }),
  ]);
  const dataContext = `Dados disponíveis no tenant autenticado: clientes=${customers.count ?? 0}, visitas=${visits.count ?? 0}, follow-ups=${followUps.count ?? 0}, oportunidades=${opportunities.count ?? 0}. Use somente estes dados e deixe claro quando ainda não houver registros.`;
  const response = groqKey
    ? await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-20b", messages: [{ role: "system", content: `${system} ${dataContext}` }, { role: "user", content: message }] }) })
    : await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiKey}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", input: [{ role: "system", content: `${system} ${dataContext}` }, { role: "user", content: message }] }) });
  if (!response.ok) {
    const providerError = await response.text();
    console.error("AI provider error", response.status, providerError.slice(0, 500));
    if (response.status === 401) return NextResponse.json({ error: "A chave Groq foi rejeitada. Gere uma nova chave e atualize o .env.local." }, { status: 502 });
    return NextResponse.json({ error: "O provedor de IA recusou a solicitação. Verifique a chave e o modelo configurados." }, { status: 502 });
  }
  const data = await response.json();
  return NextResponse.json({ answer: data.output_text || data.choices?.[0]?.message?.content || "Não recebi uma resposta do provedor." });
}
