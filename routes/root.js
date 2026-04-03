import { eq } from "drizzle-orm";
import * as schemas from "../db/schema.js";

export default async function (fastify, opts) {
  fastify.addHook('onRequest', fastify.authenticate)

  fastify.get("/", async function (request, reply) {
    return { root: true };
  });

  fastify.get("/about", async function (request, reply) {
    return "Hexlet project";
  });

  const { db } = fastify;

  fastify.get("/users", async function (request, reply) {
    const users = await db.query.users.findMany();

    return users;
  });

  fastify.get(
    '/users/:id',
    async (request) => {
      const user = await db.query.users.findFirst({
        where: eq(schemas.users.id, request.params.id),
      })
      fastify.assert(user, 404)
      return user
    },
  )

  fastify.post(
    '/courses',
    async (request, reply) => {
      const body = request.body
      // Данные пользователя извлеченные из jwt-токена
      body.creatorId = request.user.id

      const [course] = await db.insert(schemas.courses)
        .values(body)
        .returning()

      return reply.code(201)
        .send(course)
    }
  )
}
