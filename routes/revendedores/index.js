import revendedorController from '../../controllers/RevendedorController.js'

export default async function (fastify, opts) {

  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, revendedorController.getAllRevendedores)

  fastify.get('/deleted', {
    onRequest: [fastify.authenticate]
  }, revendedorController.getDeletedRevendedores)

  fastify.get('/:cpf', {
    onRequest: [fastify.authenticate]
  }, revendedorController.getRevendedorByCpf)

  fastify.get('/:cpf/totalCashback', {
    onRequest: [fastify.authenticate]
  }, revendedorController.getRevendedorTotalCashback)

  fastify.post('/', revendedorController.addRevendedor)

  fastify.put('/:cpf', {
    onRequest: [fastify.authenticate]
  }, revendedorController.updateRevendedor)

  fastify.delete('/:cpf', {
    onRequest: [fastify.authenticate]
  }, revendedorController.deleteRevendedor)

  fastify.post('/:cpf/restaura', {
    onRequest: [fastify.authenticate]
  }, revendedorController.restoreRevendedor)

  fastify.post('/login', revendedorController.loginRevendedor)
  
}
