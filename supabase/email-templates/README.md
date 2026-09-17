# E-mails de autenticação FEGEPI

No Supabase hospedado, abra **Authentication > Emails** e edite os modelos correspondentes:

| Fluxo | Assunto sugerido | Arquivo |
| --- | --- | --- |
| Reset password | Redefina sua senha na FEGEPI | `recovery.html` |
| Confirm sign up | Confirme seu e-mail na FEGEPI | `confirmation.html` |

Publique primeiro a versão da aplicação com suporte a `token_hash` em `/auth/callback`. Depois cole o HTML inteiro de cada arquivo no modelo correspondente do Supabase. Esses arquivos locais não são sincronizados automaticamente com o painel.

Os modelos usam `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&amp;type=...`, com `email` para cadastro e `recovery` para senha. A Site URL do Supabase deve ser o domínio HTTPS público, sem barra final. O token é validado pelo Supabase no servidor; esse fluxo funciona mesmo abrindo o e-mail em outro navegador. Links antigos com `code` continuam aceitos, mas dependem dos cookies do navegador original.

Configure SMTP próprio antes de atender usuários reais: o remetente padrão do Supabase só atende membros da equipe do projeto, tem limite de 2 mensagens por hora e não garante entrega. SMTP próprio ainda está sujeito às cotas do Supabase e do provedor, à reputação do domínio e aos filtros de spam.

Desative rastreamento de cliques no provedor para não reescrever links de autenticação. Scanners de segurança que abrem links podem consumir tokens de uso único; nesses casos solicite outro link e avalie confirmação explícita antes da validação.

Consulte [o parecer e o procedimento de ativação](../../EMAIL_AUTH_REPORT.md) e a [documentação oficial de SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
