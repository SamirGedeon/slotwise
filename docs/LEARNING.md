# Seu roteiro de estudo do Slotwise

O código foi desenvolvido com assistência de IA. O objetivo agora é você conseguir operá-lo, alterá-lo e defender as decisões. Não precisa entender tudo de uma vez.

## Primeiro contato

1. Siga o README e entre com o proprietário de demonstração.
2. Veja os exemplos de amanhã, cadastre um serviço e um profissional.
3. Crie uma reserva e tente criar outra sobreposta para o mesmo profissional.
4. Cancele a primeira e tente novamente. Explique por que agora funciona.
5. Entre como equipe. Compare a interface e o teste que impede cadastrar um serviço diretamente pela API.

## Leia nesta ordem

1. `frontend/src/api.ts`: como o token vai para o backend e como erros viram mensagens.
2. `backend/config/routes.rb`: caminhos e verbos HTTP.
3. `backend/app/controllers/application_controller.rb`: sessão e usuário atual.
4. `backend/app/controllers/api/bookings_controller.rb`: escopo da empresa e parâmetros aceitos.
5. `backend/app/models/booking.rb`: regras de horários e estados.
6. `backend/db/migrate/20261111000000_create_workspace.rb`: integridade e constraint.
7. `backend/spec/requests/workspace_spec.rb`: exemplos verificáveis das regras.
8. `frontend/src/Schedule.tsx`: consulta, filtros, estados e atualização do cache.

## Exercícios pequenos, feitos por você

- Explique por que R$ 125,50 vira 12550 no banco. Adicione um serviço gratuito e confira o total.
- Mude o texto de uma mensagem de vazio e faça um commit com uma descrição clara.
- Escreva um teste para uma reserva que termina exatamente às 18h.
- Explique por que desabilitar o botão no navegador não é autorização.
- Desenhe dois pedidos simultâneos tentando reservar o mesmo profissional. Qual parte evita a corrida?
- Antes de implementar reagendamento, liste as regras e os testes necessários; ele não existe nesta versão.

## Treino para entrevista

Em português: “A validação do Rails dá feedback rápido, mas duas requisições podem passar ao mesmo tempo. Por isso, a regra de não sobreposição também fica no PostgreSQL.”

Em inglês: “The Rails validation provides useful feedback, while a PostgreSQL exclusion constraint protects the scheduling invariant under concurrent writes.”

Use essas frases apenas depois de conseguir explicar o código que as sustenta. Não declare experiência comercial, usuários reais ou domínio das tecnologias só porque a aplicação roda.
