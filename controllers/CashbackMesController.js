import db from "../db/models/index.js"

const options = await db.classMethods.CashbackMes.queryOptions()
const formataValor = db.classMethods.CashbackMes.formataValor

class CashbackMesController {

  static async getAllCashbackMes(request, reply) {
    try {
      const allCashbackMes = await db.CashbackMes.findAll(options)

      if (allCashbackMes.length === 0) {
        return reply.notFound()
      }

      let newAllCashbackMes = await formataValor(allCashbackMes);

      return reply.code(200).send(newAllCashbackMes)

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

      let newCashbackMes = await formataValor(cashbackMes);

      return reply.code(200).send(newCashbackMes)

    } catch (err) {
      throw err
    }
  }

}

export default CashbackMesController
