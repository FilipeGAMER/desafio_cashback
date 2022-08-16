import { test } from 'tap'
import build from '../../app.js'

test('Teste plugin bcriptHash >', async t => {

  const app = await build()

  t.teardown(() => app.close())

  let senha = 'SenhaParaTestes'
  let senhaHash
  let senhaErrada = 'SenhaParaTestes1'

  await t.test('generateHash', async t => {
    await app.generateHash(senha).then((hash) => {
      senhaHash = hash
      t.type(hash, 'string', 'retorna hash com sucesso')
    })
  })

  await t.test('compareHash', async t => {
    await app.compareHash(senha, senhaHash).then((verified) => {
      t.type(verified, true, 'valida hash')
    })
  })

  await t.test('compareHash errado', async t => {
    await app.compareHash(senhaErrada, senhaHash).then((verified) => {
      t.type(verified, false, 'não valida hash')
    })
  })

})