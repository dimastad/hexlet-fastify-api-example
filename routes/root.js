export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    return { root: false };
  });

  fastify.get("/about", async function (request, reply) {
    return "Hexlet project";
  });

  const { db } = fastify;

  fastify.get("/users", async function (request, reply) {
    const users = await db.query.users.findMany();

    return users;
  });
}
