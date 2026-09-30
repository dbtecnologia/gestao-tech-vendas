import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const allowedModules = new Set(["Clientes", "Prospects", "Oportunidades", "Visitas", "Agenda", "Follow-ups", "Despesas", "Relatórios", "Equipe", "Configurações"]);

async function authenticated() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

export async function GET(request: Request) {
  try {
    const session = await authenticated();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const module = new URL(request.url).searchParams.get("module") || "";
    if (!allowedModules.has(module)) return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
    const { data, error } = await session.supabase.from("tempo_records").select("id,module,name,detail,status,extra,created_at,updated_at").eq("module", module).order("updated_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error("[api/records] GET failed", error);
    return NextResponse.json({ error: "Não foi possível carregar os registros." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await authenticated();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body || !allowedModules.has(body.module) || typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Registro inválido" }, { status: 400 });
    const { data, error } = await session.supabase.from("tempo_records").insert({ user_id: session.user.id, module: body.module, name: body.name.trim(), detail: typeof body.detail === "string" ? body.detail : "", status: typeof body.status === "string" ? body.status : "ATIVO", extra: body.extra && typeof body.extra === "object" ? body.extra : {} }).select("id,module,name,detail,status,extra,created_at,updated_at").single();
    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error("[api/records] POST failed", error);
    return NextResponse.json({ error: "Não foi possível salvar o registro." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await authenticated();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body?.id || !allowedModules.has(body.module) || typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Registro inválido" }, { status: 400 });
    const { data, error } = await session.supabase.from("tempo_records").update({ name: body.name.trim(), detail: typeof body.detail === "string" ? body.detail : "", status: typeof body.status === "string" ? body.status : "ATIVO", extra: body.extra && typeof body.extra === "object" ? body.extra : {}, updated_at: new Date().toISOString() }).eq("id", body.id).eq("module", body.module).select("id,module,name,detail,status,extra,created_at,updated_at").single();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[api/records] PATCH failed", error);
    return NextResponse.json({ error: "Não foi possível atualizar o registro." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await authenticated();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body?.id || !allowedModules.has(body.module)) return NextResponse.json({ error: "Registro inválido" }, { status: 400 });
    const { error } = await session.supabase.from("tempo_records").delete().eq("id", body.id).eq("module", body.module);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/records] DELETE failed", error);
    return NextResponse.json({ error: "Não foi possível excluir o registro." }, { status: 500 });
  }
}
