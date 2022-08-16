import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, basename } from 'path'
import { Sequelize } from 'sequelize'
import jsonConfig from './../config/config.json' assert {type: "json"}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const __basename = basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = jsonConfig[env]
const db = {}

let sequelize

if (process.env.TEST) {
  sequelize = new Sequelize('sqlite::memory:', {logging: false})
} else if (config) {
  sequelize = new Sequelize({dialect: config.dialect, storage: config.storage})
} else {
  console.error("Please, review DB config")
  process.exit(1)
}

readdirSync(__dirname).filter(file => {
    return (file.indexOf('.') !== 0) && (file !== __basename) && (file.slice(-3) === '.js')
  }).forEach(async file => {
    file = join(__dirname, file)
    let module = await import(file)
    const model = await module.default(sequelize, Sequelize.DataTypes, Sequelize.Op)
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.classMethods = {
  Revendedores: {
    queryOptions: async function () {
      return { attributes: [ 'cpf', 'nome', 'email' ] }
    },
    updateOptions: async function () {
      return { fields: [ 'nome', 'email', 'senha' ] }
    }
  },
  Compras: {
    queryOptions: async function () {
      return { attributes: [ 'codigo', 'data', 'valor', 'cpf', 'status' ] }
    },
    preencheCompras: async function (allCompras, CashbackMesDB) {
      return Promise.all(
        allCompras.map(async (compra) => {
          return new Promise(async (resolve, reject) => {
            compra = JSON.parse(JSON.stringify(compra))

            const [ano, mes, dia] = compra.data.split('-')
            let cashbackMes = await CashbackMesDB.findOne({ attributes: [ 'percentual' ], where: { cpf: compra.cpf, mes: parseInt(mes), ano: parseInt(ano)}})
    
            compra.percentual = cashbackMes.percentual
            compra.valorCashback = parseFloat(compra.valor * (cashbackMes.percentual / 100)).toFixed(2)
            compra.valor = parseFloat(compra.valor).toFixed(2)
          
            resolve(compra)
          })
        })
      )
    }
  },
  CashbackMes: {
    queryOptions: function () {
      return { attributes: [ 'mes', 'ano', 'valor', 'percentual', 'cpf' ] }
    }
  }
}

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db