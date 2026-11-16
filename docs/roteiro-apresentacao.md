# Roteiro dos slides — ByteHub

**Duração sugerida: 15–20 minutos.** Distribuam a fala entre os integrantes e ensaiem a demonstração no mesmo computador e navegador que serão usados em sala.

| Slide | Conteúdo | Tempo |
| --- | --- | ---: |
| 1. Abertura | Nome ByteHub, Byte Builders, disciplina, integrantes | 30 s |
| 2. Problema e objetivo | Necessidade atendida, público-alvo, proposta do sistema | 1 min |
| 3. Requisitos e fluxo | Histórias de usuário e principais áreas por perfil | 1,5 min |
| 4. Arquitetura | Diagrama SPA: React, API Fastify, Prisma e arquivo SQLite local | 2 min |
| 5. Tecnologias e decisões | React, TypeScript, Vite, Fastify, Prisma e SQLite; escopo local e dados demonstrativos | 1 min |
| 6. Gestão de configuração | Repositório real, organização, branches/commits praticados e fluxo de mudança | 1 min |
| 7. Qualidade | Usabilidade, manutenibilidade, segurança e limites conhecidos; mostrar evidências | 1,5 min |
| 8. Testes | 39 passaram em execução anterior; nova execução falhou ao preparar o banco. Reexecutar e atualizar o resultado antes da apresentação | 1,5 min |
| 9. Demonstração | Login, guildas, eventos, envio/revisão de ideia e certificados; distinguir dados persistidos e conteúdo demonstrativo | 4–5 min |
| 10. Participação | Tabela curta com integrantes, responsabilidades e artefatos | 1 min |
| 11. Aprendizados e futuro | Dificuldades, aprendizados e próximos passos | 1 min |
| 12. Encerramento | Síntese e abertura para perguntas | 30 s |

## Roteiro da demonstração

1. Começar com a tela de login e entrar como aluno (`aluno` / `4321`).
2. Mostrar o painel, pesquisar uma guilda e abrir uma aula.
3. Enviar uma ideia como aluno e mostrar seu status em “Minhas ideias”.
4. Sair, entrar como presidência e mostrar a proposta na seção “Ideias”; alterar o status.
5. Voltar ao aluno e mostrar a situação atualizada. Inscrever-se em uma guilda e evento.
6. Abrir certificados, selecionar um arquivo de teste e mostrar que o backend guarda os metadados, não o arquivo original.
7. Encerrar mostrando limitações atuais e o plano de evolução.

## Preparação no dia

- Confirmar que a aplicação inicia sem erro e deixar a aba pronta antes de começar.
- Usar dados fictícios; não inserir senha pessoal ou arquivo sensível.
- Tirar capturas de tela das páginas-chave para contingência caso a demonstração ao vivo falhe.
- Iniciar o backend e o front-end antes da apresentação. Os registros ficam no SQLite local, então permanecem após atualizar ou reiniciar a aplicação neste computador.
- Não apresentar resultados de teste ou métricas como reais sem evidência.
- Definir quem troca os slides, quem controla o navegador e quem responde perguntas.

## Campos a preencher nos slides

- [Nome da instituição/turma e integrantes]
- [Link do repositório e processo realmente adotado]
- [Capturas reais e resultados dos testes executados]
- [Contribuição de cada integrante]
- [Aprendizados específicos do grupo]
