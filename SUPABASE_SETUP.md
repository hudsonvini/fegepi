# Configuração do Supabase

1. Crie um projeto gratuito no Supabase e, no **SQL Editor**, execute primeiro `supabase/schema.sql` e depois `supabase/role-protection.sql`.
2. Em **Authentication > URL Configuration**, inclua `http://localhost:3000/auth/callback` e `https://seu-dominio.vercel.app/auth/callback` como URLs de redirecionamento. Ajuste também a Site URL de produção.
3. Copie `.env.example` para `.env.local` e preencha os valores. Na Vercel, crie as mesmas variáveis em Production, Preview e Development.
4. Crie a primeira conta pela página `/cadastro`. No SQL Editor, promova-a uma única vez com o comando comentado ao final de `schema.sql`. A partir daí, a gestão de conteúdo acontece em `/admin`.

O projeto usa Supabase Auth, Postgres e Storage. Não há `service_role` no frontend ou na Vercel; as permissões são aplicadas por Row Level Security no banco.
