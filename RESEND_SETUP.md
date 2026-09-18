# Resend dedicado à FEGEPI

## Verificação em produção — 18/09/2026

O domínio canônico observado é `https://www.fegepi.com.br`. O Site URL do Supabase estava em `https://fegepi.vercel.app` e foi corrigido no painel para `https://www.fegepi.com.br`. Também foram adicionados os retornos exatos `/auth/callback?next=/perfil` e `/auth/callback?next=/redefinir-senha` nesse domínio, preservando os retornos anteriores. E-mails já enviados não mudam; solicite um novo após a correção.

A variável `NEXT_PUBLIC_SITE_URL` na hospedagem deve usar `https://www.fegepi.com.br`; seu valor remoto ainda não foi verificado. O arquivo `.env.local` mantém localhost para desenvolvimento.

O perfil público retornou HTTP 500 mesmo sem sessão, enquanto o build local retorna corretamente 307 para `/login`. A causa do erro de produção depende dos logs da Vercel; a correção do domínio não comprova resolução desse erro.

Decisão do responsável: usar uma nova conta Resend exclusiva da FEGEPI, preservando a aplicação existente. Domínio informado: `fegepi.com.br`. A conta e o acesso ao DNS ainda não foram disponibilizados; nenhuma configuração remota foi alterada.

Proposta de domínio de envio: `notificacoes.fegepi.com.br`. Remetente proposto: `FEGEPI <nao-responda@notificacoes.fegepi.com.br>`. Os valores de DNS serão os gerados pela nova conta Resend; ainda não há registros prontos para publicação. Confirmar separadamente se a URL canônica do site usa `www` antes de alterar redirecionamentos de autenticação.

## Preparação e ativação

O código já usa Supabase Auth para cadastro, reenvio e recuperação. Não é necessário instalar o SDK Resend nem colocar uma chave Resend na aplicação: o Supabase enviará pelo SMTP. Os campos não secretos estão em `supabase/email-templates/resend-smtp-settings.json`, como referência para preenchimento no painel (não é um importador).

Na hospedagem, preencher `NEXT_PUBLIC_SITE_URL=https://fegepi.com.br` se esse for o endereço canônico usado pela aplicação (se houver redirecionamento para www, usar o endereço final). No Supabase, usar o mesmo valor para Site URL, sem barra final, e autorizar:

```text
https://fegepi.com.br/auth/callback?next=/perfil
https://fegepi.com.br/auth/callback?next=/redefinir-senha
```

Se o domínio canônico for www, ajustar também as duas URLs acima. `.env.local` permanece com localhost para desenvolvimento. Produção rejeita links configurados com localhost. A configuração SMTP só deve ser ativada depois da verificação DNS do remetente.

1. O responsável cria a conta da FEGEPI no Resend, confirma o e-mail e verifica o plano gratuito disponível. O cadastro e as credenciais ficam sob controle do responsável.
2. Informar o domínio real da FEGEPI e o provedor DNS. Preferir um subdomínio exclusivo para envio (por exemplo, `notificacoes.SEU-DOMINIO`, apenas ilustrativo), evitando conflito com a aplicação atual. Não transferir um domínio já utilizado pela outra conta.
3. Adicionar o subdomínio à nova conta. Copiar os registros DNS exatos gerados pelo Resend; não reutilizar valores DKIM de outra conta. O responsável pelo DNS publica esses registros nos nomes indicados, preservando os registros existentes do site e do e-mail principal.
4. Aguardar o domínio ficar verificado no Resend. Definir nome do remetente `FEGEPI` e endereço no domínio verificado. Criar uma chave dedicada ao envio, restrita ao domínio quando disponível. Guardá-la no campo de senha SMTP do Supabase, nunca em código ou mensagens.
5. Configurar Supabase > Authentication > Email > SMTP Settings conforme a tabela abaixo. Desativar rastreamento de cliques para os links de autenticação e conferir as cotas de envio em ambos os serviços.
6. Definir o domínio público do site na Site URL do Supabase e em `NEXT_PUBLIC_SITE_URL` na hospedagem. Publicar o código corrigido antes de aplicar os modelos locais de confirmação e recuperação no painel Supabase.
7. Testar cadastro, reenvio e recuperação com destinatário autorizado fora da equipe Supabase. Conferir eventos de entrega no Resend, abertura do link em outro navegador e login com a senha redefinida.

| Campo SMTP | Valor |
| --- | --- |
| Host | `smtp.resend.com` |
| Porta | `465` |
| Usuário | `resend` |
| Senha | Chave API da conta FEGEPI |
| Nome do remetente | `FEGEPI` |
| E-mail do remetente | `nao-responda@notificacoes.fegepi.com.br`, após verificação |

O plano gratuito consultado permite 3.000 e-mails por mês e 100 por dia; confirmação, reenvios e recuperação consomem a mesma cota da conta. Criar apenas outra chave na conta existente não separa a franquia. Os limites e a disponibilidade devem ser confirmados na conta nova antes da ativação.

Fontes: [integração SMTP oficial](https://resend.com/docs/send-with-supabase-smtp), [domínios e DNS](https://resend.com/docs/dashboard/domains/introduction), [cotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits).
