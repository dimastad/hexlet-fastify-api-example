import { asc, eq } from "drizzle-orm";
import * as schemas from "../../db/schema.js";

export default async function (fastify) {
  const db = fastify.db;

  fastify.get("/users", async function (request) {
    const perPage = 1
    const { page = 1 } = request.query

    const users = await db.query
      .users
      .findMany({
        orderBy: asc(schemas.users.id),
        limit: perPage,
        offset: (page - 1) * perPage,
    });

    return users;
  });

  fastify.get('/users/:id', async (request) => {
    const user = await db.query.users.findFirst({
      where: eq(schemas.users.id, request.params.id),
    })
    fastify.assert(user, 404)
    return user
  })

  fastify.post('/users', async (request, reply) => {
    const [user] = await db.insert(schemas.users)
      .values(request.body)
      .returning()

    return reply.code(201)
      .send(user)
  })

  fastify.patch('/users/:id', async (request) => {
    const [user] = await db.update(schemas.users)
      .set(request.body)
      .where(eq(schemas.users.id, request.params.id))
      .returning()
    fastify.assert(user, 404)

    return user
  })
}
