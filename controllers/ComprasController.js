import db from "../db/models/index.js"

const options = await db.classMethods.Compras.queryOptions()
const preencheCompras = db.classMethods.Compras.preencheCompras

class ComprasController {
  
  static async getAllCompras(request, reply) {
    try {
      
      const allCompras = await db.Compras.findAll(options)
      
      if (allCompras.length === 0) {
        return reply.notFound('Nenhuma compra cadastrada')
      }

      let newCompras = await preencheCompras(allCompras, db.CashbackMes);
      
      return reply.code(200).send(newCompras)

    } catch (err) {
      throw err
    }
  }

  static async getComprasByCpf(request, reply) {
    try {
      const cpf = request.params.cpf

      const compras = await db.Compras.findAll({ where: { cpf: cpf }, ...options})

      if (compras.length === 0) {
        return reply.notFound('Nenhuma compra cadastrada para o CPF')
      }
      
      let newCompras = await preencheCompras(allCompras, db.CashbackMes);
      
      return reply.code(200).send(newCompras)


    } catch (err) {
      throw err
    }
  }

  static async addCompra (request, reply) {
    try {
      this.validateObj(request.body)
      
      this.validaCPF(request.body.cpf)

      const result = await db.sequelize.transaction(async transacao => {

        const revendedor = await db.Revendedores.findByPk(request.body.cpf, { transaction: transacao })

        if (!revendedor) {
          return reply.notFound('CPF não cadastrado')
        }

        const body = {...request.body}

        if (body.cpf == 15350946056) {
          body.status = "Aprovado"
        } else {
          body.status = "Em validação"
        }

        body.valor = parseFloat(body.valor).toFixed(2)
      
        let compra = await db.Compras.create(body, { transaction: transacao })

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
            valor: parseFloat(body.valor),
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

      return reply.code(201).send(result)

    } catch (err) {
      console.log(err)
      throw err
    }
  }

}

export default ComprasController
