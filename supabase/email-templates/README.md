# E-mails de autenticação FEGEPI

No Supabase hospedado, abra **Authentication > Emails** e edite os modelos correspondentes:

| Fluxo | Assunto sugerido | Arquivo |
| --- | --- | --- |
| Reset password | Redefina sua senha na FEGEPI | `recovery.html` |
| Confirm sign up | Confirme seu e-mail na FEGEPI | `confirmation.html` |

Cole o HTML inteiro do arquivo no editor visual/código do Supabase. Mantenha `{{ .ConfirmationURL }}`: ele é o link seguro gerado pelo Supabase e preserva o redirecionamento para a aplicação.

Projetos novos no plano Free podem exigir SMTP próprio para liberar modelos de e-mail personalizados. Consulte a documentação do Supabase antes de ativar um provedor SMTP.
