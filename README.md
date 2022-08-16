# desafio_cashback

Projeto de desafio para criação de cashback para revendedores GB.

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/FilipeGAMER/desafio_cashback?label=REPO%20SIZE&style=for-the-badge)


## Sobre

O projeto usa o `fastify` como framework, o `sequelize` + `sqlite3` para proporcionar um banco de dados em arquivo para fácil utilização


## Antes de usar o desafio_cashback

Para usar, é necessário criar um arquivo .env conforme campos abaixo:

```txt
NODE_ENV=development
PORT=3000
TOKEN_JWT=segredo
```

## Propostas entregues e exemplos

* Rota para cadastrar um novo revendedor(a) exigindo no mínimo nome completo, CPF, e-mail e senha:

  POST `localhost:3000/revendedores`
  
  Body:
  ```json
  {
    "cpf": 15350946056,
    "nome": "Teste aprovado",
    "email": "teste.aprovado@teste.com",
    "senha": "testesenha"
  }
  ```
  Return:
  ```json
  {
    "cpf": 15350946056,
    "nome": "Teste aprovado",
    "email": "teste.aprovado@teste.com"
  }
  ```

* Rota para validar um login de um revendedor(a):

  POST `localhost:3000/revendedores/login`
  
  Body:
  ```json
  {
    "cpf": 43867583137,
    "senha": "testesenha0987654321"
  }
  ```
  Return HEADER:
  ```
  authorization: Token-jwt-exemplo
  ```


* Rota para cadastrar uma nova compra exigindo no mínimo código, valor, data e CPF do revendedor(a). Todos os cadastros são salvos com o status “Em validação” exceto quando o CPF do revendedor(a) for 153.509.460-56, neste caso o status é salvo como“ Aprovado”:
  > É necessário realizar o login e adicionar o token jwt no header 

  POST `localhost:3000/compras`
  
  Body:
  ```json
  {
    "data": "2022-06-28",
    "valor": 500,
    "cpf": 13504881780,
    "status": "Aprovado"
  }

  ```
  Return:
  ```json
  {
    "codigo": 10,
    "data": "2022-06-28",
    "valor": 500,
    "cpf": 13504881780,
    "status": "Em validação"
  }
  ```

* Rota para listar as compras cadastradas retornando código, valor, data, % de cashback aplicado para esta compra, valor de cashback para esta compra e status:
  > É necessário realizar o login e adicionar o token jwt no header 

  GET `localhost:3000/compras`
  
  Return:
  ```json
  [
    {
      "codigo": 1,
      "data": "2022-06-28",
      "valor": 500,
      "cpf": 13504881780,
      "status": "Em validação",
      "percentual": 10,
      "valorCashback": "50.00"
    }
    ...
  ]
  ```

* Rota para exibir o acumulado de cashback até o momento, essa rota irá consumir essa informação de uma API externa disponibilizada pelo Boticário:
  > É necessário realizar o login e adicionar o token jwt no header 

  GET `localhost:3000/revendedores/:cpf/totalCashback`
  
  Return:
  ```json
  {
    "credit": 673
  }
  ```

## Scripts

No diretório do projeto você pode rodar:

### `npm run dev`

Para iniciar o projeto em modo dev, com log no console e em arquivo.

### `npm start`

Para iniciar em modo de produção, com log em arquivo.

### `npm test`

Para rodar os casos de teste.


