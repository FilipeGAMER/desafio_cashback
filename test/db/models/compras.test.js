import { test } from 'tap'
import build from '../../../app.js'
import db from '../../../db/models/index.js'

const options = await db.classMethods.Compras.queryOptions()
const preencheCompras = db.classMethods.Compras.preencheCompras

test('Teste Model Compras com tabela vazia >', async t => {

  const app = await build()

  t.teardown(() => app.close())

  await t.test('consulta todas as Compras', async t => {
    await db.Compras.findAll(options).then((allCompras) => {
      t.equal(allCompras.length, 0, 'retorna 0 Compras')
    })
  })

  await t.test('consulta Compras por CPF', async t => {
    await db.Compras.findAll({ where: { cpf: 15350946056 }, ...options}).then((compras) => {
      t.equal(compras.length, 0, 'não retorna cashback')
    })
  })
})

test('Teste Model Compras adicionando registro >', async t => {

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

  await t.test('Adiciona Compra', async t => {
    await db.sequelize.transaction(async transacao => {
      
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
  
        let [ newCompra ] = await preencheCompras([ compra ], db.CashbackMes)
        return newCompra

    }).then((result) => {
      
      t.equal(result.valor, compraBody.valor, 'valor da Compra adicionado com sucesso')
      t.equal(result.data, compraBody.data, 'data da Compra adicionada com sucesso')
      t.equal(result.cpf, compraBody.cpf, 'cpf da Compra adicionado com sucesso')
      t.equal(result.percentual, 10, 'percentual da compra está igual ao calculado')
      t.equal(result.valorCashback, parseFloat(compraBody.valor * (10 / 100)).toFixed(2), 'percentual da compra está igual ao calculado')
    })
  })

  await t.test('consulta todas as Compras', async t => {
    await db.Compras.findAll(options).then((allCompras) => {
      return preencheCompras(allCompras, db.CashbackMes)
    }).then((newCompras) => {
      t.equal(newCompras.length, 1, 'retorna 1 Compra')
    })
  })

  await t.test('consulta Compras por CPF', async t => {
    await db.Compras.findAll({ where: { cpf: revendedorBody.cpf }, ...options}).then((allCompras) => {
      return preencheCompras(allCompras, db.CashbackMes)
    }).then((newCompras) => {
      t.equal(newCompras.length, 1, 'retorna 1 Compra')
      t.equal(newCompras[0].valor, compraBody.valor, 'valor da compra está igual ao adicionado')
      t.equal(newCompras[0].data, compraBody.data, 'data da compra está igual ao adicionado')
      t.equal(newCompras[0].percentual, 10, 'percentual da compra está igual ao calculado')
      t.equal(newCompras[0].valorCashback, parseFloat(compraBody.valor * (10 / 100)).toFixed(2), 'percentual da compra está igual ao calculado')
    })
  })

})