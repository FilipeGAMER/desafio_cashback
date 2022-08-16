import db from "../db/models/index.js"

const options = await db.classMethods.CashbackMes.queryOptions()

class CashbackMesController {

  static async getAllCashbackMes(request, reply) {
    try {
      const allCashbackMes = await db.CashbackMes.findAll(options)

      if (allCashbackMes.length === 0) {
        return reply.notFound()
      }

      return reply.code(200).send(allCashbackMes)

    } catch (err) {
      throw err
    }
  }

  static async getCashbackMesByCpf(request, reply) {
    try {
      const cpf = request.params.cpf

      const cashbackMes = await db.CashbackMes.findAll({ where: { cpf: cpf }, ...options})

      if (cashbackMes.length === 0) {
        return reply.notFound()
      }
      
      return reply.code(200).send(cashbackMes)


    } catch (err) {
      throw err
    }
  }

}

export default CashbackMesController
