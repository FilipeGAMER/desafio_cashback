import { test } from 'tap'
import build from '../../app.js'

test('Teste plugin jwt >', async t => {

  const app = await build()

  t.teardown(() => app.close())

  const payload = {
    cpf: 15350946056,
    email: "master.teste@teste.com"
  }

  let token

  let expected = { test: 'testado' }

  app.get('/teste', {
    onRequest: [app.authenticate]
  }, function (request, reply) {
    reply.send(expected)
  })

  await t.test('Cria JWT e tenta fazer chamada sem token no header', async t => {
    await app.createJWT(payload).then((_token) => {
      token = _token
      return app.inject({
        method: 'GET',
        url: '/teste'
      })
    }).then((response) => {
      t.equal(response.statusCode, 401, 'retorna HTTP 401')
      t.equal(response.json().message, 'Não autorizado', 'retorna mensagem de não autorizado')
    })
  })

  await t.test('Faz chamada com token expirado', async t => {
    await app.inject({
      method: 'GET',
      url: '/teste',
      headers: {
        authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcGYiOjQzODY3NTgzMTM3LCJlbWFpbCI6ImZpbGlwZS5saW1hQHRlc3RlLmNvbSIsImlhdCI6MTY2MDU5MjQwOCwiZXhwIjoxNjYwNTk0MjA4fQ.2dEe_HaZXWG_LzjFnsmmqxkode3qc4UbDRvDDU5t_94" 
      }
    }).then((response) => {
      console.log(response)
      t.equal(response.statusCode, 500, 'retorna HTTP 500')
      t.equal(response.json().message, "invalid signature", 'retorna mensagem de assinatura inválida')
    })
  })

  await t.test('Faz chamada com token inválido', async t => {
    await app.inject({
      method: 'GET',
      url: '/teste',
      headers: {
        authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" 
      }
    }).then((response) => {
      t.equal(response.statusCode, 500, 'retorna HTTP 500')
      t.equal(response.json().message, "jwt malformed", 'retorna mensagem de token mal formatado')
    })
  })

  await t.test('Faz chamada com token válido', async t => {
    await app.inject({
      method: 'GET',
      url: '/teste',
      headers: {
        authorization: `Bearer ${token}`
      }
    }).then((response) => {
      t.equal(response.statusCode, 200, 'retorna HTTP 200')
      t.same(response.json(), expected, 'retorna objeto correto da rota /test')
    })
  })

})