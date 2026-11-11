# Rascunho para LinkedIn — não publicado

**Revisar depois de executar o projeto pessoalmente. Substituir os campos de link somente quando existirem URLs reais.**

Comecei meu primeiro projeto de portfólio Full Stack com Ruby on Rails e React: o Slotwise, uma aplicação de agendamentos para pequenos prestadores de serviços.

O problema que escolhi trabalhar foi a organização dos atendimentos sem reservar o mesmo profissional em dois horários sobrepostos.

A primeira versão reúne autenticação, permissões de proprietário/equipe, cadastro de serviços e profissionais, agenda com filtros, cancelamento e conclusão de atendimentos.

Stack: Ruby on Rails, PostgreSQL, React, TypeScript, Vite e TanStack Query. O projeto também inclui testes com RSpec e Playwright, documentação OpenAPI e configuração de CI com GitHub Actions.

Uma decisão técnica central foi colocar a prevenção de conflitos também no PostgreSQL. A validação da aplicação melhora o feedback, enquanto uma constraint de exclusão protege o banco quando há gravações concorrentes. Outro ponto foi guardar preços em centavos e tratar os horários no fuso da empresa.

Estou usando o projeto para estudar modelagem, autorização, integração entre frontend e backend e testes de regras reais. O desenvolvimento contou com assistência de IA; meu foco de aprendizado é entender, modificar e explicar as decisões do código.

Próximo passo: revisar a aplicação no meu ambiente e preparar a publicação.

GitHub: https://github.com/SamirGedeon/slotwise
Demo: [inserir somente se houver deploy público validado]

#RubyOnRails #React #TypeScript #PostgreSQL #DesenvolvimentoFullStack #Portfolio #DevJunior

---

Não afirmar CI remoto aprovado, deploy, usuários reais ou aprendizados pessoais concluídos sem verificar. Esta versão é um rascunho editorial e não foi enviada a nenhuma rede social.
