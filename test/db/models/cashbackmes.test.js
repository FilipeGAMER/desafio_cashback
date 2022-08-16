import { test } from 'tap'
import build from '../../../app.js'
import db from '../../../db/models/index.js'

const options = await db.classMethods.CashbackMes.queryOptions()
const preencheCompras = db.classMethods.Compras.preencheCompras

async function createCompraTransaction(compraBody) {
  return db.sequelize.transaction(async transacao => {
      
    if (compraBody.cpf == 15350946056) {
      compraBody.status = "Aprovado"
    } else {
      compraBody.status = "Em validação"
    }

    compraBody.valor = parseFloat(compraBody.valor).toFixed(2)

    let compra = await db.Compras.create(compraBody, { transaction: transacao })

      compra = JSON.parse(JSON.stringify(compra))
      delete compra.createdAt
      delete compra.updatedAt

      const [ano, mes, dia] = compra.data.split('-')

      let cashbackMes = await db.CashbackMes.findOne({ where: { mes: parseInt(mes), ano: parseInt(ano), cpf: compra.cpf}, transaction: transacao })

      let cashbackMesBody = JSON.parse(JSON.stringify(cashbackMes))

      if (cashbackMesBody == null) {
        cashbackMesBody = {
          mes: parseInt(mes),
          ano: parseInt(ano),
          cpf: compra.cpf,
          valor: parseFloat(compra.valor),
          percentual: 10,
        }
      } else {
        cashbackMesBody.valor = parseFloat(cashbackMesBody.valor) + parseFloat(compra.valor)
      }

      if (cashbackMesBody.valor <= 1000) {
        cashbackMesBody.percentual = 10
      } else if (cashbackMesBody.valor > 1000 && cashbackMesBody.valor <= 1500) {
        cashbackMesBody.percentual = 15
      } else if (cashbackMesBody.valor > 1500) {
        cashbackMesBody.percentual = 20
      }

      if (cashbackMes == null) {
        await db.CashbackMes.create(cashbackMesBody, { transaction: transacao })
      } else {
        await db.CashbackMes.update(cashbackMesBody, { where: { mes: parseInt(mes), ano: parseInt(ano), cpf: compra.cpf}, limit: 1, fields: [ 'percentual', 'valor' ], transaction: transacao })
      }

      let [ newCompra ] = await preencheCompras([ compra ], db.CashbackMes);
      return newCompra
  })
}

test('Teste Model CashbackMes com tabela vazia >', async t => {

  const app = await build()

  t.teardown(() => app.close())

  await t.test('consulta todos CashbacksMes', async t => {
    await db.CashbackMes.findAll(options).then((allCashbackMes) => {
      t.equal(allCashbackMes.length, 0, 'retorna 0 cashback')
    })
  })

  await t.test('consulta CashbacksMes por CPF', async t => {
    await db.CashbackMes.findAll({ where: { cpf: 15350946056 }, ...options}).then((cashback) => {
      t.equal(cashback.length, 0, 'não retorna cashback')
    })
  })

})

test('Teste Model CashbackMes adicionando registro >', async t => {

  const app = await build()

  t.teardown(() => app.close())

  const revendedorBody = {
    "cpf": 15350946056,
    "nome": "Testado Master",
    "email": "master.teste@teste.com",
    "senha": "testesenha123"
  }

  revendedorBody.senha = await app.generateHash(revendedorBody.senha)

  await db.Revendedores.create(revendedorBody)

  let compraBody = {
    "data": "2022-08-15",
    "valor": parseFloat(400.00),
    "cpf": revendedorBody.cpf,
    "status": "Em Análise"
  }

  compraBody = await createCompraTransaction(compraBody)

  let novaCompraBody = {
    "data": "2022-08-30",
    "valor": parseFloat(800.00),
    "cpf": revendedorBody.cpf,
    "status": "Em Análise"
  }

  novaCompraBody = await createCompraTransaction(novaCompraBody)

  const [ano, mes, dia] = novaCompraBody.data.split('-')
  let valorTotalCashback = parseFloat(novaCompraBody.valor) + parseFloat(compraBody.valor)
  let percentual
  if (valorTotalCashback <= 1000) {
    percentual = 10
  } else if (valorTotalCashback > 1000 && valorTotalCashback <= 1500) {
    percentual = 15
  } else if (valorTotalCashback > 1500) {
    percentual = 20
  }

  await t.test('consulta todos CashbacksMes', async t => {
    await db.CashbackMes.findAll(options).then((allCashbackMes) => {
      t.equal(allCashbackMes.length, 1, 'retorna 1 cashbacks')
      t.equal(allCashbackMes[0].valor, valorTotalCashback, 'retorna valor de cashback somando as compras do mês')
      t.equal(allCashbackMes[0].percentual, percentual, 'retorna o percentual correto do cashback para as compras do mês')
      t.equal(allCashbackMes[0].ano, parseInt(ano), 'retorna ano correto')
      t.equal(allCashbackMes[0].mes, parseInt(mes), 'retorna mes correto')
      t.equal(allCashbackMes[0].cpf, revendedorBody.cpf, 'retorna o cpf correto')
    })
  })

  await t.test('consulta CashbacksMes por CPF', async t => {
    await db.CashbackMes.findAll({ where: { cpf: revendedorBody.cpf }, ...options}).then((allCashbackMes) => {
      t.equal(allCashbackMes.length, 1, 'retorna 1 cashbacks')
      t.equal(allCashbackMes[0].valor, valorTotalCashback, 'retorna valor de cashback somando as compras do mês')
      t.equal(allCashbackMes[0].percentual, percentual, 'retorna o percentual correto do cashback para as compras do mês')
      t.equal(allCashbackMes[0].ano, parseInt(ano), 'retorna ano correto')
      t.equal(allCashbackMes[0].mes, parseInt(mes), 'retorna mes correto')
      t.equal(allCashbackMes[0].cpf, revendedorBody.cpf, 'retorna o cpf correto')
    })
  })

})