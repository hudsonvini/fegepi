# Configuração do Supabase

1. Crie um projeto gratuito no Supabase e, no **SQL Editor**, execute primeiro `supabase/schema.sql`, depois `supabase/role-protection.sql` e, por fim, `supabase/seed.sql`.
   - Em um projeto que já possua o schema antigo, execute `supabase/content-integration.sql` antes de `supabase/seed.sql`.
2. Em **Authentication > URL Configuration**, inclua `http://localhost:3000/auth/callback` e `https://seu-dominio.vercel.app/auth/callback` como URLs de redirecionamento. Ajuste também a Site URL de produção.
3. Copie `.env.example` para `.env.local` e preencha os valores. Na Vercel, crie as mesmas variáveis em Production, Preview e Development.
4. Crie a primeira conta pela página `/cadastro`. No SQL Editor, promova-a uma única vez com o comando comentado ao final de `schema.sql`. A partir daí, a gestão de conteúdo acontece em `/admin`.

O projeto usa Supabase Auth e Postgres. O envio de imagens, vídeos e escudos é feito pelo Cloudflare R2, com distribuição pelo domínio CDN configurado em `CLOUDFLARE_R2_PUBLIC_URL`. Siga [CLOUDFLARE_R2_SETUP.md](./CLOUDFLARE_R2_SETUP.md) para conectar o bucket. Não há `service_role` no frontend ou na Vercel; as permissões são aplicadas por Row Level Security no banco.
