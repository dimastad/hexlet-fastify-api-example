import { test } from 'node:test'
import * as assert from 'node:assert'
import { build } from '../helper.js'

test('post /tokens returns jwt', async (t) => {
  const app = await build(t)

  const user = await app.db.query.users.findFirst()
  assert.ok(user)

  const res = await app.inject({
    method: 'post',
    url: '/api/tokens',
    body: { email: user.email, password: user.password },
  })

  assert.equal(res.statusCode, 201, res.body)
  const payload = JSON.parse(res.body)
  assert.ok(payload.token)
})
