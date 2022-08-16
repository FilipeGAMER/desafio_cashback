import comprasController from '../../controllers/ComprasController.js'

export default async function (fastify, opts) {

  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, comprasController.getAllCompras)

  fastify.get('/:cpf', {
    onRequest: [fastify.authenticate]
  }, comprasController.getComprasByCpf)

  fastify.post('/', {
    onRequest: [fastify.authenticate]
  }, comprasController.addCompra)

}
