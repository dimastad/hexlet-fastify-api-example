import * as schemas from "./schema.js";
import { buildCourse, buildCourseLesson, buildUser } from "../lib/data.js";
/**
 * @param {import("drizzle-orm/better-sqlite3").BetterSQLite3Database<typeof schemas>} db
 */
export default async (db) => {
  // Фиксированные учётные данные для ручного теста: test@example.com / secret
  const [user1] = await db
    .insert(schemas.users)
    .values(buildUser({ email: "test@example.com" }))
    .returning();
  const [user2] = await db
    .insert(schemas.users)
    .values(buildUser())
    .returning();
  const [user3] = await db
    .insert(schemas.users)
    .values(buildUser())
    .returning();
  const [user4] = await db
    .insert(schemas.users)
    .values(buildUser())
    .returning();
  const [user5] = await db
    .insert(schemas.users)
    .values(buildUser())
    .returning();
  const [course1] = await db
    .insert(schemas.courses)
    .values(buildCourse({ creatorId: user2.id }))
    .returning();
  const [course2] = await db
    .insert(schemas.courses)
    .values(buildCourse({ creatorId: user2.id }))
    .returning();
  await db
    .insert(schemas.courseLessons)
    .values(buildCourseLesson({ courseId: course1.id }));
};
