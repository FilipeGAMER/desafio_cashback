async function model (sequelize, DataTypes, Op) {

  const Revendedores = await sequelize.define('Revendedores', {
    // Model attributes are defined here
    cpf: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nome: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        validaNome: function(dado) {
          if (dado.length < 3) {
            throw new Error("Campo 'nome' deve ter mais de 3 caracteres")
          }
        }
      }
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: 'Dado do tipo e-mail invalido'
        }
      }
    },
    senha: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        min: 15,
        max: 100
      }
    }
  }, {
    // Other model options go here
    paranoid: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: {[Op.ne]: null}
        },
        paranoid: false
      }
    }
  })

  Revendedores.associate = function(models) {
    Revendedores.hasMany(models.CashbackMes, {
      foreignKey: 'cpf'
    })
  }
  
  await Revendedores.sync()

  return Revendedores

}

export default model