# Parecer: cadastro e recuperação de senha

Data: 16/09/2026. Estado: correções locais implementadas; ativação de envio em produção pendente de SMTP, acesso administrativo e publicação.

## Diagnóstico

- O responsável informou que usa o remetente padrão do Supabase, sem SMTP próprio, e não tem acesso ao DNS nem a um provedor transacional.
- A API pública de configuração do projeto respondeu HTTP 200: cadastro habilitado, autenticação por e-mail habilitada e `mailer_autoconfirm=false`. Portanto, novos cadastros exigem confirmação.
- O remetente padrão só envia aos endereços da equipe do projeto e limita o envio a 2 mensagens por hora. Não tem garantia de entrega. Isso é incompatível com cadastro público e recuperação de senha de usuários externos.
- O código ocultava o motivo de falha da recuperação com uma mensagem genérica. No login, e-mail ainda não confirmado aparecia como credenciais inválidas. Não havia reenvio dedicado da confirmação.
- Os modelos locais usavam `ConfirmationURL` e a aplicação só aceitava código PKCE: abrir em outro navegador poderia falhar por falta do cookie que iniciou o pedido. Esse problema é distinto da entrega do e-mail.
- `.env.local` aponta a Site URL para `http://localhost:3000`, adequado apenas ao desenvolvimento. Não foi possível consultar a variável em produção, os logs do serviço Auth, os modelos publicados ou o painel SMTP. Não foi realizado envio para contas reais nem teste de chegada na caixa postal.

### Verificação após conexão do Supabase

- A conexão administrativa foi confirmada para o projeto `fegepi` (`vyrdqnaxvesqjjcswdbr`), em estado `ACTIVE_HEALTHY`.
- Consulta agregada de `auth.users`: 17 contas, 2 sem confirmação de e-mail, 16 com `confirmation_sent_at` preenchido e 2 com `recovery_sent_at` preenchido. Último registro de solicitação de confirmação: 16/09/2026 03:34:14 UTC; de recuperação: 11/08/2026 21:45:29 UTC.
- Esses campos registram etapas do fluxo de autenticação; não comprovam entrega na caixa postal nem permitem atribuir a falha de cada tentativa a uma causa específica.
- A consulta dos últimos sete dias de `auth.audit_log_entries` retornou zero eventos. Essa tabela não substitui os logs do serviço Auth nem os logs de entrega do provedor.
- A integração instalada permite consultar o projeto e o banco, mas não disponibiliza ferramentas para ler/alterar SMTP, modelos de e-mail ou consultar logs do serviço Auth nesta sessão. Portanto, o uso do remetente padrão permanece fundamentado na informação do responsável, não em inspeção direta do painel SMTP.
- Nenhuma conta, senha, configuração remota ou dado de usuário foi alterado. A conexão resolve o acesso de diagnóstico ao banco, mas não fornece um provedor SMTP ou controle do DNS.

## Correções implementadas

- Mensagens distintas para limite de envio, excesso de solicitações e indisponibilidade; logs com operação, código e status, sem e-mail, senha ou token.
- Página `/confirmar-email` com reenvio, acesso pelo login e tratamento de conta não confirmada.
- Cadastro com sessão já emitida segue para o perfil; resposta sem sessão orienta a confirmação sem afirmar entrega ou revelar se o endereço já possui conta.
- Links usam a URL configurada; produção exige HTTPS público e não utiliza Origin do pedido como destino arbitrário.
- Callback aceita tokens verificados pelo Supabase, com destino fixo por tipo, cookies de sessão, `no-store` e `no-referrer`. Mantém compatibilidade com códigos PKCE anteriores.
- Modelos locais preparados para token hash, permitindo abertura em outro navegador após publicação e aplicação no painel.

## O que o administrador precisa executar

1. Identificar o domínio público da aplicação e o responsável pelo DNS. Disponibilizar acesso administrativo ao projeto Supabase pelos mecanismos de conexão, sem compartilhar senhas em mensagens.
2. Contratar ou ativar um provedor SMTP transacional e verificar um domínio remetente. O responsável pelo DNS deve publicar os registros exigidos pelo provedor (SPF/DKIM e política DMARC conforme orientação do serviço). Verificar cotas, aprovação para produção e eventuais restrições de sandbox do provedor.
3. Em Supabase > Authentication > Emails > SMTP, configurar host, porta, usuário, senha SMTP, endereço remetente verificado e nome FEGEPI. Guardar a credencial no painel, nunca no frontend nem no Git. Desativar rastreamento de cliques no provedor.
4. Configurar Site URL e `NEXT_PUBLIC_SITE_URL` com o domínio HTTPS real e autorizar os dois callbacks descritos em `SUPABASE_SETUP.md`. Ajustar o limite de envio no Supabase à capacidade do provedor; SMTP personalizado também tem cota (inicialmente 30 mensagens/hora segundo a documentação consultada).
5. Publicar a aplicação corrigida. Só depois aplicar os HTMLs de `supabase/email-templates/` no painel. Alterar os arquivos no Git não altera os modelos hospedados.
6. Com um endereço de teste autorizado fora da equipe Supabase, verificar cadastro, chegada da confirmação, abertura em outro navegador, login, reenvio, recuperação e uso da nova senha. Verificar também link expirado/reutilizado e os logs de entrega/bounce no provedor.

## Limites e evidências

Código não remove restrições do remetente Supabase. Desabilitar confirmação não corrige a recuperação de senha. SMTP próprio permite entrega ao público, mas não garante caixa de entrada: há cotas, spam, endereços inválidos, rejeições e reputação do remetente. Links expiram, são de uso único e podem ser consumidos por scanners que abrem links; desabilitar rastreamento não elimina todos esses casos.

Validação: compilação de produção (`npm run build`), TypeScript, lint dos arquivos alterados e seis testes locais de regressão (`node tests/auth-email.test.mjs`). Os testes cobrem URL de produção, fluxo de token sem cookies iniciais, restrição de destinos/tipos, erros de links, preservação dos cookies e compatibilidade PKCE. Usam o SDK simulado, portanto não comprovam entrega nem configuração remota.

Fontes oficiais: [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [limites](https://supabase.com/docs/guides/auth/rate-limits), [modelos](https://supabase.com/docs/guides/auth/auth-email-templates).
