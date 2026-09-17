# Atualização competitiva — 16/09/2026

- Pontuação do 1º ao 8º: 250, 200, 100, 80, 60, 40, 20, 10. Demais posições: zero. Banco, explicação pública, administração e indicadores atualizados.
- Elenco admite nick sem conta, com vínculo posterior à mesma entrada do elenco. Função, data e histórico permanecem. Nicks duplicados no mesmo elenco ativo são rejeitados sem distinguir maiúsculas/minúsculas.
- Ranking ordenado antes da paginação, dez times por página, mantendo posição absoluta e voltando à primeira página ao trocar temporada/jogo.
- Cards de destaque usam o nick como título principal e nome pessoal como texto secundário.
- Removido o ranking fictício embutido que reaparecia quando o banco não tinha temporadas.

## Banco conectado

Aplicada a atualização `nickname_rosters_and_eight_place_points` no projeto FEGEPI. Scripts reproduzíveis: `nickname-rosters.sql` e `championships.sql`.

Após confirmação explícita do responsável, foram removidos 14 times, 10 temporadas, 2 campeonatos, 119 inscrições, 1.708 resultados antigos, 10 colocações, 62 vínculos time/jogo e 3 integrantes de elenco. Os vínculos com times removidos foram limpos em 2 perfis, sem excluir as contas.

Preservados e conferidos dentro da transação: 20 usuários/perfis, 2 banners, 3 eventos, 6 fotos e 5 jogos. Backup local, excluído do Git: `.local-backups/competition-before-cleanup.json`. SQL executado: `.local-backups/cleanup-executed.sql`. A primeira tentativa foi bloqueada pela revisão automática; a execução ocorreu somente depois da confirmação específica de exclusão de todos os dados competitivos.

## Validação

Build de produção e TypeScript aprovados. Lint sem erros, com avisos de uso de `img` já existentes nos componentes. Teste SQL com rollback verificou posições 1–9, cancelamento sem pontos, nick sem perfil, rejeição de nick vazio/duplicado e vínculo posterior. Nenhum dado desse teste permaneceu no banco.

Paginação conferida no navegador: 10 linhas na primeira página, posições 11 e 12 na segunda, botão Próxima desabilitado no final. Esse teste revelou o fallback de demonstração, posteriormente removido. Após nova compilação, a home foi recarregada e exibiu “Nenhum time cadastrado nesta temporada”, mantendo a tabela explicativa de pontos. Publicação da interface ainda não realizada; a atualização do banco e a limpeza já estão aplicadas remotamente.

## Auditoria do Supabase

O advisor apontou configurações preexistentes fora do escopo: view `player_directory` executada com privilégios do proprietário, funções `SECURITY DEFINER` acessíveis pela API e proteção contra senhas vazadas desativada. Não foram alteradas automaticamente para evitar modificar permissões e o diretório público nesta tarefa. Referências: [views](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view), [funções públicas](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [segurança de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
