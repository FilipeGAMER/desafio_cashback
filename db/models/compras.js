async function model (sequelize, DataTypes, _Op) {

  const Compras = await sequelize.define('Compras', {
    // Model attributes are defined here
    codigo: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    cpf: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    data: {
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    valor: {
      allowNull: false,
      type: DataTypes.DECIMAL,
      validate: {
        isDecimal: true
      }
    },
    status: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    // Other model options go here
    paranoid: true,
  })

  await Compras.sync()
  
  return Compras

}

export default model