# Correção do erro 500 no perfil

O log de produção indicou que o binário Linux do Sharp não encontrou `libvips-cpp.so.8.18.3`. A importação ocorria ao carregar a página de perfil, antes mesmo de enviar uma foto.

- `.npmrc` inclui dependências opcionais, necessárias aos binários do Sharp.
- `next.config.ts` inclui explicitamente Sharp e os pacotes Linux x64 de codec e libvips nos arquivos das funções.
- `compressAvatar` carrega Sharp somente quando uma foto é enviada, com erro controlado se o carregamento falhar.

## Publicação

1. Publique os arquivos alterados no repositório usado pela Vercel, incluindo `.npmrc` e `next.config.ts`.
2. Faça um novo deploy sem reutilizar o cache de build anterior. Se houver Install Command personalizado, use `npm ci --include=optional`.
3. Verifique `/perfil` sem sessão: deve redirecionar para `/login`, sem erro 500.
4. Entre em uma conta e envie uma foto JPG, PNG ou WebP de até 3 MB. Confira a compressão e gravação da foto.
5. Solicite um novo e-mail de recuperação; links antigos continuam apontando para o domínio anterior.

Os testes locais cobrem compressão real, limites, ausência do codec, autorização do upload e os links de autenticação. A execução nativa em Linux e a entrega do pacote na Vercel precisam ser confirmadas após o novo deploy.
