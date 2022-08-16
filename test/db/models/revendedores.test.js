import { test } from 'tap'
import build from '../../../app.js'
import db from '../../../db/models/index.js'

const options = await db.classMethods.Revendedores.queryOptions()
const updateOptions = await db.classMethods.Revendedores.updateOptions()

test('Teste Model Revendedores com tabela vazia >', async t => {

  const app = await build()

  t.teardown(() => app.close())

  await t.test('consulta todos Revendedores(as)', async t => {
    await db.Revendedores.findAll(options).then((allRevendedores) => {
      t.equal(allRevendedores.length, 0, 'retorna 0 Revendedores(as)')
    })
  })

  await t.test('consulta todos Revendedores(as) deletados', async t => {
    await db.Revendedores.scope('deleted').findAll(options).then((allRevendedores) => {
      t.equal(allRevendedores.length, 0, 'retorna 0 Revendedores(as)')
    })
  })

  await t.test('consulta Revendedor(a) por CPF', async t => {
    await db.Revendedores.findByPk(15350946056 ,options).then((revendedor) => {
      t.equal(revendedor, null, 'não retorna revendedor(a)')
    })
  })

  const body = {
    "cpf": 15350946056,
    "nome": "Testado Master",
    "email": "master.teste@teste.com",
    "senha": "testesenha123"
  }

  await t.test('atualiza dados do Revendedor(a)', async t => {
    await db.Revendedores.update(body, { where: { cpf: body.cpf }, ...updateOptions}).then((ret) => {
      t.equal(ret[0], 0, 'não atualiza nenhum revendedor(a)')
    })
  })

})

test('Teste Model Revendedores adicionando registro >', async t => {

  const app = await build()

  t.teardown(() => app.close())

  let senhaStr = "testesenha123"

  const body = {
    "cpf": 15350946056,
    "nome": "Testado Master",
    "email": "master.teste@teste.com",
    "senha": senhaStr
  }

  body.senha = await app.generateHash(body.senha)

  await t.test('adiciona Revendedor(a)', async t => {
    await db.Revendedores.create(body).then((revendedor) => {
      revendedor = JSON.parse(JSON.stringify(revendedor))
      t.equal(revendedor.name, body.name, 'retorna o nome correto do Revendedor(a)')
      t.equal(revendedor.email, body.email, 'retorna o email correto do Revendedor(a)')
    })
  })

  await t.test('realiza login do Revendedor(a)', async t => {
    await db.Revendedores.findByPk(body.cpf).then((revendedor) => {
      return app.compareHash(senhaStr, revendedor.senha)
    }).then((verified) => {
      t.equal(verified, true, 'verifica com suceso a senha')
    })
  })

  await t.test('tenta atualizar CPF do Revendedor(a)', async t => {
    const newBody = {
      "cpf": 12345678901
    }
    await db.Revendedores.update(newBody, { where: { cpf: body.cpf }, ...updateOptions}).then((ret) => {
      t.equal(ret[0], 0, 'não permite atualizar o CPF do revendedor(a)')
    })
  })

  senhaStr = "novaSenhaForte"
  
  const newBody = {
    "nome": "Alterado Testado Master",
    "email": "novo.master@teste.com",
    "senha": senhaStr
  }

  await t.test('atualiza dados do Revendedor(a)', async t => {

    newBody.senha = await app.generateHash(newBody.senha)

    await db.Revendedores.update(newBody, { where: { cpf: body.cpf }, ...updateOptions}).then((ret) => {
      t.equal(ret[0], 1, 'dados do revendedor(a) atualizado')
      return db.Revendedores.findByPk(body.cpf)
    }).then((revendedor) => {
      t.equal(revendedor.name, newBody.name, 'retorna o nome correto do Revendedor(a)')
      t.equal(revendedor.email, newBody.email, 'retorna o email correto do Revendedor(a)')
      return app.compareHash(senhaStr, revendedor.senha)
    }).then((verified) => {
      t.equal(verified, true, 'verifica com suceso a senha')
    })
  })

  await t.test('remove Revendedor(a)', async t => {
    await db.Revendedores.destroy({ where: { cpf: body.cpf }}).then((revendedor) => {
      t.equal(revendedor, 1, 'remove com sucesso o revendedor(a)')
    })
  })

  await t.test('consulta todos Revendedores(as) deletados', async t => {
    await db.Revendedores.scope('deleted').findAll(options).then((allRevendedores) => {
      t.equal(allRevendedores.length, 1, 'retorna 1 Revendedores(as) deletado')
    })
  })

  await t.test('consulta Revendedor(a) por CPF', async t => {
    await db.Revendedores.findByPk(body.cpf ,options).then((revendedor) => {
      t.equal(revendedor, null, 'não retorna revendedor(a)')
    })
  })

  await t.test('restaura Revendedor(a)', async t => {
    await db.Revendedores.restore({ where: { cpf: body.cpf }}).then((_) => {
      return db.Revendedores.findByPk(body.cpf ,options)
    }).then((revendedor) => {
      t.equal(revendedor.name, newBody.name, 'retorna o nome correto do Revendedor(a)')
      t.equal(revendedor.email, newBody.email, 'retorna o email correto do Revendedor(a)')
    })
  })

})