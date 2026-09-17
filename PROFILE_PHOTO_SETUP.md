# Foto de perfil

O perfil oferece Minha foto (seleção ou arrastar e soltar) e Avatar padrão. A alteração é aplicada ao salvar o perfil. Fotos existentes permanecem enquanto não houver nova seleção ou escolha do avatar padrão.

- Entrada: uma imagem JPG, PNG ou WebP estática, até 3 × 1024 × 1024 bytes. O limite é validado no cliente e no servidor antes da compressão.
- Decodificação: valida o conteúdo real e limita a 25 milhões de pixels. Arquivos corrompidos, SVG e animações são rejeitados.
- Saída: WebP qualidade 80, orientação corrigida, sem EXIF/GPS, até 768 px por lado, sem ampliar imagens pequenas. Reduz a dimensão se necessário para ficar até 256 KB.
- O arquivo original chega ao servidor da aplicação; apenas a versão processada é enviada ao R2 em `avatars/<id-do-usuário>/<ano>/<uuid>.webp`.
- Usa as variáveis R2 já existentes. Não exige alteração de schema ou credenciais públicas novas.
- O servidor verifica a sessão e atualiza somente o perfil autenticado. URLs enviadas pelo formulário não são usadas. Se o banco rejeita a atualização, tenta remover o objeto recém-enviado. Fotos anteriores não são excluídas automaticamente, evitando quebrar referências existentes; continuam consumindo armazenamento.

Verificação em 17/09/2026: oito testes em `tests/avatar-upload.test.mjs`, build de produção e lint sem erros. Teste real de upload/leitura no R2 com imagem sintética: entrada 16.031 bytes, saída 874 bytes; objeto temporário removido. Interface e alternância de abas conferidas no navegador. Não foi substituída a foto de nenhuma pessoa durante a validação.

As mudanças estão locais, aguardando publicação. Para e-mails, seguir `RESEND_SETUP.md`; o SMTP ainda depende do domínio verificado e da chave da nova conta Resend no painel Supabase.
