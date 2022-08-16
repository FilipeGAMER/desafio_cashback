import { test } from 'tap'
import build from '../../app.js'

test('Teste plugin validateRequest >', async t => {

  const app = await build()

  t.teardown(() => app.close())

  // const body = {
  //   "cpf": 15350946056,
  //   "nome": "Testado Master",
  //   "email": "master.teste@teste.com",
  //   "senha": "testesenha123"
  // }

  
  await t.test('Não permite objeto vazio', async t => {
    const body = {}
    t.throws(() => app.validateObj(body), Error("Body can't be empty"))
  })
  
  await t.test('Não permite campo vazio', async t => {
    const body = {
      "cpf": 15350946056,
      "nome": "",
      "email": "master.teste@teste.com",
      "senha": "testesenha123"
    }
    t.throws(() => app.validateObj(body), Error("Field 'nome' can't be empty"))
  })

  await t.test('Valida objeto correto', async t => {
    const body = {
      "cpf": 15350946056,
      "nome": "Testado Master",
      "email": "master.teste@teste.com",
      "senha": "testesenha123"
    }
    t.doesNotThrow(() => app.validateObj(body), "Não explode nenhum erro e continua a validação")
  })

  let cpf = "00000000000"
  await t.test(`Não permite CPF ${cpf}`, async t => {
    t.throws(() => app.validaCPF(cpf), Error("CPF inválido"))
  })

  cpf = "99999999999"
  await t.test(`Não permite CPF ${cpf}`, async t => {
    t.throws(() => app.validaCPF(cpf), Error("CPF inválido"))
  })

  cpf = "12345678901"
  await t.test(`Não permite CPF ${cpf}`, async t => {
    t.throws(() => app.validaCPF(cpf), Error("CPF inválido"))
  })

  cpf = "123456"
  await t.test(`Não permite CPF ${cpf}`, async t => {
    t.throws(() => app.validaCPF(cpf), Error("CPF inválido"))
  })

  cpf = "1234567890123"
  await t.test(`Não permite CPF ${cpf}`, async t => {
    t.throws(() => app.validaCPF(cpf), Error("CPF inválido"))
  })
  
  cpf = 15350946056
  await t.test(`permite CPF ${cpf}`, async t => {
    t.doesNotThrow(() => app.validaCPF(cpf), Error("CPF válido"))
  })
  

})