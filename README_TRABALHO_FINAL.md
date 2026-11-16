# Guia para completar o relatório do Trabalho Final

Este arquivo reúne textos-base e orientações para o relatório do ByteHub. Confira tudo com o grupo e ajuste nomes, decisões e resultados para corresponder ao trabalho realmente realizado. Não invente atividades, métricas, testes manuais ou contribuições.

O relatório técnico já está em [`docs/relatorio-trabalho-final.md`](docs/relatorio-trabalho-final.md). Use este guia para completar os campos entre colchetes e revisar o documento antes da entrega.

## 1. Introdução ao projeto

O ByteHub é um protótipo web para centralizar informações e atividades da liga acadêmica Byte Builders. O sistema apresenta áreas para estudantes, diretoria e presidência, com recursos para consultar guildas e eventos, enviar ideias e organizar metadados de certificados. O projeto busca reduzir a dispersão dessas informações e facilitar a participação dos estudantes.

**Completar no relatório:** instituição/turma, nomes dos integrantes, problema observado pelo grupo, público-alvo e quais telas/fluxos serão demonstrados.

## 2. Arquitetura do software

O protótipo utiliza uma arquitetura cliente-servidor local. O front-end foi desenvolvido em React e TypeScript, com Vite para desenvolvimento e build. A interface comunica-se por HTTP com uma API REST construída com Fastify. O backend usa Prisma como ORM e SQLite como banco local. A autenticação utiliza tokens JWT; as senhas são armazenadas como hashes.

O SQLite foi escolhido por permitir execução local simples e persistência sem exigir um servidor de banco separado. A divisão entre interface, rotas da API e acesso a dados organiza responsabilidades e facilita a evolução independente das partes.

**Completar no relatório:** inserir ou revisar o diagrama arquitetural, confirmar versões/ferramentas usadas e explicar quaisquer decisões diferentes tomadas pelo grupo. O sistema não é hospedado nem compartilhado entre computadores nesta versão.

## 3. Gestão da configuração

O projeto está organizado em `figma/` para o front-end e `figma/backend/` para a API, além de `docs/` para os documentos do trabalho. O backend usa Git para controle de versão [confirmar se o grupo de fato usou e preencher o endereço do repositório, se houver].

**Completar com fatos do grupo:** serviço de hospedagem Git utilizado; estratégia de branches; padrão de mensagens de commit; como as alterações foram revisadas e integradas; como o grupo registrou e aprovou mudanças. Se todos trabalharam diretamente em uma branch, descrevam o processo real em vez de afirmar que usaram pull requests.

## 4. Aspectos de qualidade

Na versão atual foram consideradas a usabilidade da interface, a separação de responsabilidades, a validação dos dados da API, a autenticação e as permissões por perfil. A API valida campos obrigatórios e formatos definidos nas rotas. As respostas de perfil não incluem o hash da senha, e as rotas protegidas exigem token. Os registros de certificados são privados por usuário.

**Limites conhecidos a registrar:** a aplicação roda localmente; os dados de guildas e eventos iniciais são demonstrativos; aulas e parte dos painéis são estáticos; certificados armazenam metadados, não o arquivo; não há backup automático. A qualidade de usabilidade e acessibilidade ainda deve ser avaliada com pessoas usuárias se o grupo quiser apresentar resultados sobre esses atributos.

**Completar no relatório:** registrar revisão da interface em desktop/celular, problemas encontrados e corrigidos e evidências (capturas, resultados de ferramentas ou observações). Não declarar desempenho, acessibilidade ou segurança auditados sem executar avaliações específicas.

## 5. Testes realizados e resultados obtidos

### Texto-base para o relatório

Foi adotada uma estratégia de testes automatizados de integração para verificar as rotas da API, os principais fluxos de uso e as regras de autenticação e autorização. Os testes foram escritos com o módulo nativo `node:test`, enviam requisições à aplicação Fastify usando `inject()` e acessam o banco por meio do Prisma. Cada execução prepara um banco SQLite temporário separado do banco de desenvolvimento, aplica as migrações e os dados de demonstração e remove o banco temporário ao final.

A suíte contém **39 testes independentes**, cobrindo disponibilidade da API; acesso sem autenticação; login com credenciais válidas, senha incorreta e usuário inexistente; cadastro válido, duplicado e com dados inválidos; consulta de perfil e proteção do hash de senha; guildas e inscrições duplicadas ou inexistentes; criação e atualização de ideias com controle de permissões; certificados e isolamento entre usuários; e permissões para gerenciamento da diretoria.

Em uma execução concluída em **16 de novembro de 2026**, os **39 testes passaram e nenhum falhou**. O build TypeScript do backend também passou. Porém, uma tentativa posterior neste ambiente falhou durante a preparação do banco com Prisma, antes de a suíte iniciar. Trate os 39 aprovados como resultado anterior e repita `corepack pnpm test` neste ambiente antes de apresentar esse resultado como confirmado. Os testes automatizados cobrem a API; não representam uma execução dos testes manuais da interface.

**Comando para executar novamente:** abrir o terminal em `figma/backend` e rodar `corepack pnpm test`. O relatório de execução aparece no terminal. Inclua uma captura de tela desse resultado como evidência, preferencialmente mostrando `tests 39`, `pass 39` e `fail 0`.

### Testes manuais da interface

Os testes automatizados da API não substituem a validação pelo navegador. O grupo ainda deve executar os cenários manuais listados na seção 6.2 do relatório e anotar o resultado real, navegador/dispositivo utilizado e captura correspondente. Se não forem executados, mantenham-nos como pendentes; não os apresentem como aprovados.

## 6. Participação dos integrantes

Incluam cada integrante do grupo e descrevam tarefas realmente realizadas. É possível usar commits, arquivos produzidos, diagramas, atas e registros de reunião como evidências.

| Integrante | Atividades realizadas | Evidência/artefato |
| --- | --- | --- |
| [Nome 1] | [preencher com contribuição real] | [arquivo, commit ou registro] |
| [Nome 2] | [preencher com contribuição real] | [arquivo, commit ou registro] |
| [Nome 3] | [preencher com contribuição real] | [arquivo, commit ou registro] |
| [Nome 4, se houver] | [preencher com contribuição real] | [arquivo, commit ou registro] |

## 7. Aprendizados e perspectivas futuras

Relatem dificuldades que aconteceram durante o projeto, como foram resolvidas e o que cada pessoa aprendeu. Adaptem o exemplo abaixo à experiência real do grupo:

> Durante o desenvolvimento, o grupo precisou integrar a interface com uma API e persistir os dados localmente. A separação entre front-end, rotas da API e banco ajudou a identificar responsabilidades e testar os fluxos de forma isolada. Como próximos passos, podem ser considerados testes manuais de usabilidade, melhorias de acessibilidade, backup do banco e implementação das funcionalidades que ainda usam dados demonstrativos.

Cada integrante deve acrescentar uma reflexão pessoal verdadeira sobre o próprio aprendizado e sua perspectiva para projetos futuros.

## 8. Evidências e referências

Sugestões de evidências: captura do sistema em funcionamento, diagrama de arquitetura, saída do comando de testes, estrutura do repositório e capturas dos principais fluxos. Identifiquem cada figura e expliquem brevemente o que ela demonstra. Removam informações pessoais e tokens das capturas.

Incluam nas referências a documentação consultada, com título, endereço e data de acesso. Citem somente materiais realmente utilizados. As referências oficiais já sugeridas no relatório devem ser verificadas pelo grupo e completadas com a data de acesso.

## Checklist antes de entregar

- [ ] Preencher instituição, turma, nomes e contribuições reais.
- [ ] Revisar a arquitetura e os diagramas conforme o sistema atual.
- [ ] Executar novamente `corepack pnpm test` e atualizar o resultado se mudar.
- [ ] Executar e registrar os testes manuais que o grupo decidir apresentar.
- [ ] Inserir evidências com legendas e remover dados sensíveis.
- [ ] Revisar as referências e datas de acesso.
- [ ] Confirmar que relatório e slides apresentam os mesmos resultados.
