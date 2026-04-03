import { eq } from "drizzle-orm";
import * as schemas from "../../db/schema.js";

export default async function (fastify) {
  const db = fastify.db

  fastify.post('/tokens', async (request, reply) => {
    const { email, password } = request.body

    const user = await db.query.users.findFirst({
      where: eq(schemas.users.email, email),
    })

    fastify.assert.ok(user, 404)
    fastify.assert.equal(user.password, password, 401)

    const token = fastify.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: '1h' },
    )

    return reply.code(201).send({ token })
  })
}
