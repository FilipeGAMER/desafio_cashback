async function model (sequelize, DataTypes, _Op) {

  const CashbackMes = await sequelize.define('CashbackMes', {
    // Model attributes are defined here
    mes: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 12
      }
    },
    ano: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    cpf: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    valor: {
      allowNull: false,
      type: DataTypes.DECIMAL
    },
    percentual: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        isIn: [[10, 15, 20]]
      }
    },
  }, {
    // Other model options go here
    paranoid: true
  })

  CashbackMes.associate = function(models) {
    CashbackMes.belongsTo(models.Revendedores, {
      foreignKey: 'cpf'
    })
  }

  await CashbackMes.sync({ logging: false })

  return CashbackMes
}

export default model