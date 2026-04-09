import { and, eq } from "drizzle-orm";
import * as schemas from "../db/schema.js";

export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    return { root: true };
  });

  fastify.get("/about", async function (request, reply) {
    return "Hexlet project";
  });

  const { db } = fastify;

  fastify.get(
    '/users',
    async function (request, reply) {
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
    "/courses",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const body = {
        ...request.body,
        creatorId: request.user.id,
      };

      const [course] = await db.insert(schemas.courses).values(body).returning();

      return reply.code(201).send(course);
    },
  );

  fastify.patch(
    "/courses/:id",
    { onRequest: [fastify.authenticate] },
    async (request) => {
      const course = await db.query.courses.findFirst({
        where: eq(schemas.courses.id, request.params.id),
      });
      fastify.assert(course, 404);
      fastify.assert.equal(course.creatorId, request.user.id, 403);

      const [updatedCourse] = await db.update(schemas.courses)
        .set(request.body)
        .where(eq(schemas.courses.id, request.params.id))
        .returning();

      return updatedCourse;
    },
  );

  fastify.delete(
    "/courses/:id",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const course = await db.query.courses.findFirst({
        where: eq(schemas.courses.id, request.params.id),
      });
      fastify.assert(course, 404);
      fastify.assert.equal(course.creatorId, request.user.id, 403);

      await db.delete(schemas.courses)
        .where(eq(schemas.courses.id, request.params.id));

      return reply.code(204).send();
    },
  );

  fastify.post(
    "/courses/:courseId/lessons",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const course = await db.query.courses.findFirst({
        where: eq(schemas.courses.id, request.params.courseId),
      });
      fastify.assert(course, 404);
      fastify.assert.equal(course.creatorId, request.user.id, 403);

      const [lesson] = await db.insert(schemas.courseLessons)
        .values({
          ...request.body,
          courseId: request.params.courseId,
        })
        .returning();

      return reply.code(201).send(lesson);
    },
  );

  fastify.patch(
    "/courses/:courseId/lessons/:id",
    { onRequest: [fastify.authenticate] },
    async (request) => {
      const course = await db.query.courses.findFirst({
        where: eq(schemas.courses.id, request.params.courseId),
      });
      fastify.assert(course, 404);
      fastify.assert.equal(course.creatorId, request.user.id, 403);

      const lesson = await db.query.courseLessons.findFirst({
        where: and(
          eq(schemas.courseLessons.id, request.params.id),
          eq(schemas.courseLessons.courseId, request.params.courseId),
        ),
      });
      fastify.assert(lesson, 404);

      const [updatedLesson] = await db.update(schemas.courseLessons)
        .set(request.body)
        .where(
          and(
            eq(schemas.courseLessons.id, request.params.id),
            eq(schemas.courseLessons.courseId, request.params.courseId),
          ),
        )
        .returning();

      return updatedLesson;
    },
  );

  fastify.delete(
    "/courses/:courseId/lessons/:id",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const course = await db.query.courses.findFirst({
        where: eq(schemas.courses.id, request.params.courseId),
      });
      fastify.assert(course, 404);
      fastify.assert.equal(course.creatorId, request.user.id, 403);

      const [lesson] = await db.delete(schemas.courseLessons)
        .where(
          and(
            eq(schemas.courseLessons.id, request.params.id),
            eq(schemas.courseLessons.courseId, request.params.courseId),
          ),
        )
        .returning();
      fastify.assert(lesson, 404);

      return reply.code(204).send();
    },
  );
}
