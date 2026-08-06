# Cloudflare R2 + CDN

O dashboard envia arquivos ao bucket R2 pelo servidor e salva no Supabase a URL pública do CDN. A home já lê essas URLs, portanto novos jogos, eventos, escudos e fotos passam a aparecer por `CLOUDFLARE_R2_PUBLIC_URL` automaticamente.

## Configuração no Cloudflare

1. Em **R2 Object Storage**, crie o bucket `fegepi-media` (ou escolha outro nome e use-o no ambiente).
2. Em **Manage API Tokens**, crie um token com **Object Read & Write**, limitado apenas a esse bucket. Copie o **Access Key ID** e o **Secret Access Key**.
3. Opcionalmente, no bucket, abra **Settings > Custom Domains**, conecte um domínio real e aguarde o status `Active`. Sem domínio público configurado, deixe `CLOUDFLARE_R2_PUBLIC_URL` vazio: a aplicação entrega os arquivos pela rota interna `/api/media`. Não use nesse campo o domínio da aplicação na Vercel.
4. Copie `.env.example` para `.env.local` e preencha todas as variáveis `CLOUDFLARE_R2_*`. Na Vercel, cadastre as mesmas variáveis em Production, Preview e Development.
5. Em **Settings > CORS Policy**, adapte `cloudflare/r2-cors.json` para o domínio final da aplicação e salve. O upload atual é feito pelo servidor, mas essa regra mantém o CDN pronto para consumo no navegador e futuras URLs pré-assinadas.

Não exponha `CLOUDFLARE_R2_ACCESS_KEY_ID` nem `CLOUDFLARE_R2_SECRET_ACCESS_KEY` em variáveis `NEXT_PUBLIC_*`.

## Como validar

Depois de preencher o ambiente e reiniciar a aplicação, entre como administrador e envie uma imagem em **Dashboard > Gestão de conteúdo**. Com um domínio real configurado, a URL gravada no Supabase começará com `CLOUDFLARE_R2_PUBLIC_URL`; sem ele, começará com `/api/media/`.
