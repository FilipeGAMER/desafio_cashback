import db from "../db/models/index.js"
import got, {Options} from 'got';

const options = await db.classMethods.Revendedores.queryOptions()
const updateOptions = await db.classMethods.Revendedores.updateOptions()

class RevendedorController {

  static async getAllRevendedores (request, reply) {
    try {
      const allRevendedores = await db.Revendedores.findAll(options)

      if (allRevendedores.length === 0) {
        return reply.notFound()
      }
      
      return reply.code(200).send(allRevendedores)

    } catch (err) {
      throw err
    }
  }

  static async getDeletedRevendedores (request, reply) {
    try {
      const allRevendedores = await db.Revendedores.scope('deleted').findAll(options)

      if (allRevendedores.length === 0) {
        return reply.notFound()
      }
      
      return reply.code(200).send(allRevendedores)

    } catch (err) {
      throw err
    }
  }

  static async getRevendedorByCpf (request, reply) {
    try {
      const cpf = request.params.cpf
      
      const revendedor = await db.Revendedores.findByPk(cpf, options)

      if (!revendedor) {
        return reply.notFound()
      }
      
      return reply.code(200).send(revendedor)

    } catch (err) {
      throw err
    }
  }

  static async getRevendedorTotalCashback (request, reply) {
    try {
      
      const cpf = request.params.cpf

      const options = new Options({
        headers: {
          token: 'ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm'
        }
      });
  
      const apiExterna = `https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback?cpf=${cpf}`

      const {body} = await got.get(apiExterna, options).json();

      return reply.code(200).send(body)

    } catch (err) {
      throw err
    }
  }

  static async addRevendedor (request, reply) {
    try {
      this.validateObj(request.body)
      
      //TODO formatar CPF para completar com zeros = provavelmente receber como texto

      this.validaCPF(request.body.cpf)

      const body = {...request.body}
      body.senha = await this.generateHash(body.senha)

      let revendedor = await db.Revendedores.create(body)
      revendedor = JSON.parse(JSON.stringify(revendedor))
      delete revendedor.createdAt
      delete revendedor.updatedAt
      delete revendedor.senha

      return reply.code(201).send(revendedor)
    } catch (err) {
      if (err.name == "SequelizeUniqueConstraintError") {
        return reply.badRequest(`Campo '${err.errors[0].path}' com valor '${err.errors[0].value}' já existe`)
      }
      throw err
    }
  }

  static async loginRevendedor (request, reply) {
    try {
      const { cpf, senha } = request.body

      const revendedor = await db.Revendedores.findByPk(cpf)
      if (!revendedor) {
        return reply.badRequest('CPF ou senha inválida')
      }
      
      const verified = await this.compareHash(senha, revendedor.senha)
      if (!verified) {
        return reply.badRequest('CPF ou senha inválida')
      }

      const payload = {
        cpf: revendedor.cpf,
        email: revendedor.email
      }
      const token = await this.createJWT(payload)

      return reply.code(204).header("Authorization", token).send()
    } catch (err) {
      throw err
    }
  }

  static async updateRevendedor (request, reply) {
    try {
      const cpf = request.params.cpf
      
      this.validateObj(request.body)
      
      const body = {...request.body}

      if (body.senha) {
        body.senha = await this.generateHash(body.senha)
      }

      let ret = await db.Revendedores.update(body, { where: { cpf: cpf }, ...updateOptions})

      if (ret[0] == 0) {
        return reply.badRequest('Informações inválidas, nenhum registro atualizado')
      }

      const revendedor = await db.Revendedores.findByPk(cpf, options)

      return reply.code(200).send(revendedor)

    } catch (err) {
      throw err
    }
  }

  static async deleteRevendedor (request, reply) {
    try {
      const cpf = request.params.cpf
      
      const revendedor = await db.Revendedores.destroy({ where: { cpf: cpf }})

      if (!revendedor) {
        return reply.notFound()
      }

      return reply.status(204).send()

    } catch (err) {
      throw err
    }
  }

  static async restoreRevendedor (request, reply) {
    try {
      const cpf = request.params.cpf
      
      await db.Revendedores.restore({ where: { cpf: cpf }})

      return reply.status(204).send()

    } catch (err) {
      throw err
    }
  }

}

export default RevendedorController
