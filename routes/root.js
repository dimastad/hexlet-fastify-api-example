export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    return { root: false };
  });

  fastify.get("/about", async function (request, reply) {
    return "Hexlet project";
  });
}
