# Gestão Vendas Tech

Base da plataforma SaaS de gestão comercial externa, com clientes, prospects, visitas,
follow-ups, oportunidades, rotas e despesas.

## Desenvolvimento local

1. Instale Node.js 20+ e execute `npm install`.
2. Copie `.env.example` para `.env.local` e preencha a URL e a chave publicável do Supabase.
3. Aplique `supabase/migrations/0001_initial_schema.sql` e depois `supabase/migrations/0002_commercial_saas.sql` no SQL Editor do projeto Supabase.
4. Execute `npm run dev`.

A chave `service_role` nunca deve ser colocada no frontend ou em variáveis `NEXT_PUBLIC_*`.

## Estado atual e pendências de produção

Crie um projeto Supabase, habilite Email/Password em Authentication e execute as migrations
em ordem. A migration comercial habilita RLS e isola todos os registros por `company_id`.

O login e a Assistente IA já usam Supabase/Groq. Os formulários comerciais ainda estão em
modo de protótipo e salvam no `localStorage` do navegador; antes de usar em produção, é
obrigatório trocar esse armazenamento pelas tabelas do Supabase e criar o vínculo inicial
`company_users` no cadastro da empresa. Assim os dados serão persistentes, multiusuário e
seguros entre dispositivos.

## Deploy

Na Vercel, importe o repositório, configure as variáveis do `.env.example` e execute o build
com `pnpm run build`. Não configure `SUPABASE_SERVICE_ROLE_KEY` como variável pública. O
workflow em `.github/workflows/ci.yml` valida typecheck e build a cada push/PR.

### Ativar IA com Groq

Crie uma chave no painel da Groq e adicione localmente ao `.env.local`:

```env
GROQ_API_KEY=sua_chave_groq
GROQ_MODEL=openai/gpt-oss-20b
```

Nunca envie a chave pelo chat, GitHub ou por variáveis `NEXT_PUBLIC_*`. Reinicie o servidor
depois de alterar o arquivo.
