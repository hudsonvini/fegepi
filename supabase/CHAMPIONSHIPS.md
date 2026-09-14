# Campeonatos e destaques

Em um projeto já configurado com `schema.sql`, aplique no SQL Editor:

1. `featured-players.sql`
2. `championships.sql`
3. `championship-example.sql` para criar um rascunho editável com até cinco times da temporada atual, sem pontuar no ranking.

Os scripts são transacionais e reaplicáveis. Não execute `seed.sql` para esta atualização.
Instalações novas também devem aplicar os dois primeiros arquivos após o schema.

## Administração

- **Jogadores:** destacar, salvar ordem (0–99) e remover destaque. Destacar torna o perfil público; retirar o destaque mantém a preferência de perfil público. Apenas perfis públicos destacados aparecem na home (até 12).
- **Temporadas e tabela:** criar a temporada, selecionar a modalidade e inscrever os times.
- **Campeonatos:** criar um rascunho na temporada selecionada; selecionar os times inscritos; preencher as colocações finais e salvar como concluído.
- Pontuação: 1º = 250; 2º = 125; 3º = 70; 4º = 50; demais = 0.
- Ao concluir, todas as posições devem ser preenchidas, únicas e entre 1 e o total de participantes. Para corrigir, altere os resultados e salve. Rascunhos e cancelados não pontuam; cancelar é reversível.
- Desempate: pontos, títulos e nome do time. Os indicadores exibem os últimos cinco campeonatos concluídos da temporada, do mais recente ao mais antigo. 1º–5º recebem cores; ausência e posições inferiores ficam cinza. O texto acessível informa o campeonato e a colocação real.

`championship_standings` calcula os totais a partir dos campeonatos. Os campos e históricos antigos de vitórias/empates/derrotas são preservados no banco, mas não compõem mais a classificação. Não é possível inferir colocações de campeonatos a partir desses dados antigos; cadastre os campeonatos históricos para pontuá-los.

A RPC `save_championship` valida a permissão administrativa e salva o campeonato e todos os participantes na mesma transação. A versão impede sobrescrever edições simultâneas. Um time com participações não pode ser removido da temporada sem antes retirar essas participações.

## Verificação local

`tests/championships.sql` só aceita um banco descartável chamado `fegepi_championship_test`, com roles `anon`/`authenticated` ainda não criadas. Não executar no Supabase nem em banco com dados reais.

```powershell
psql -h 127.0.0.1 -p 55439 -U postgres -d fegepi_championship_test -f supabase/tests/championships.sql
```

O teste cobre reaplicação, permissões, pontos, duplicação, correção, cancelamento, reabertura, histórico de cinco etapas e conflitos de versão.
