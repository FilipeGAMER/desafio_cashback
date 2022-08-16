import cashbackMesController from '../../controllers/CashbackMesController.js'

export default async function (fastify, opts) {

  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, cashbackMesController.getAllCashbackMes)

  fastify.get('/:cpf', {
    onRequest: [fastify.authenticate]
  }, cashbackMesController.getCashbackMesByCpf)

}
