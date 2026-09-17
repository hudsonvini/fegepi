# Configuração do Supabase

1. Crie um projeto gratuito no Supabase e, no **SQL Editor**, execute nesta ordem: `supabase/schema.sql`, `supabase/role-protection.sql`, `supabase/seed.sql` e `supabase/ranking-results.sql`.
   - Em um projeto que já possua o schema antigo, execute `supabase/content-integration.sql` antes de `supabase/seed.sql`.
2. Em **Authentication > URL Configuration**, defina a Site URL como o domínio HTTPS público (sem barra final). Autorize as URLs completas `https://SEU-DOMINIO/auth/callback?next=/perfil` e `https://SEU-DOMINIO/auth/callback?next=/redefinir-senha`. Para desenvolvimento, autorize também as versões em `http://localhost:3000`. Configure `NEXT_PUBLIC_SITE_URL` com o domínio público no ambiente de produção; localhost é apenas para desenvolvimento.
3. Copie `.env.example` para `.env.local` e preencha os valores. Na Vercel, crie as mesmas variáveis em Production, Preview e Development.
4. Crie a primeira conta pela página `/cadastro`. No SQL Editor, promova-a uma única vez com o comando comentado ao final de `schema.sql`. A partir daí, a gestão de conteúdo acontece em `/admin`.
5. Antes de abrir cadastros ao público, configure SMTP próprio em **Authentication > Emails**, valide o domínio remetente no provedor e aplique os [modelos de autenticação](supabase/email-templates/README.md). O envio padrão do Supabase é limitado à equipe do projeto e não serve para entrega em produção. Veja o [parecer de e-mail](EMAIL_AUTH_REPORT.md).
6. Para elencos por nick com conta opcional, execute `supabase/nickname-rosters.sql` após `supabase/game-team-ecosystem.sql`. A versão atual de `supabase/championships.sql` calcula pontos do 1º ao 8º lugar: 250, 200, 100, 80, 60, 40, 20 e 10. Essas atualizações já foram aplicadas ao projeto FEGEPI conectado.

O projeto usa Supabase Auth e Postgres. O envio de imagens, vídeos e escudos é feito pelo Cloudflare R2, com distribuição pelo domínio CDN configurado em `CLOUDFLARE_R2_PUBLIC_URL`. Siga [CLOUDFLARE_R2_SETUP.md](./CLOUDFLARE_R2_SETUP.md) para conectar o bucket. Não há `service_role` no frontend ou na Vercel; as permissões são aplicadas por Row Level Security no banco.
