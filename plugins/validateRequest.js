import fp from 'fastify-plugin'

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default fp(async (fastify, opts) => {
  fastify.decorate('validateObj', function (obj) {
    if (Object.keys(obj).length === 0) {
      let err = new Error(`Body can't be empty`)
      err.statusCode = 400
      throw err
    }
  
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const element = obj[key]
        if (typeof element === 'number') {
          continue
        }
        if (element.trim() === "") {
          let err = new Error(`Field '${key}' can't be empty`)
          err.statusCode = 400
          throw err
        }
      }
    }
  })

  fastify.decorate('validaCPF', function (cpfStr) {
    let Soma = 0
    let Resto
    let result = true

    cpfStr = cpfStr.toString()

    let invalid = [
      "00000000000",
      "11111111111",
      "22222222222",
      "33333333333",
      "44444444444",
      "55555555555",
      "66666666666",
      "77777777777",
      "88888888888",
      "99999999999"
    ]

    if (invalid.indexOf(cpfStr) > -1) result = false

    for (let i = 1; i <= 9; i++) {
      Soma = Soma + parseInt(cpfStr.substring(i - 1, i)) * (11 - i)
    }
    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))  Resto = 0
    if (Resto != parseInt(cpfStr.substring(9, 10))) result = false

    Soma = 0

    for (let i = 1; i <= 10; i++) {
      Soma = Soma + parseInt(cpfStr.substring(i - 1, i)) * (12 - i)
    } 
    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))  Resto = 0
    if (Resto != parseInt(cpfStr.substring(10, 11))) result = false

    if (result == false) {
      let err = new Error(`CPF inválido`)
      err.statusCode = 400
      throw err
    }
    return true
  })
})
