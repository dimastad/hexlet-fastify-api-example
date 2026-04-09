import { test } from "node:test";
import * as assert from "node:assert";
import { build } from "../helper.js";

async function getToken(app, user) {
  const tokenResponse = await app.inject({
    method: "POST",
    url: "/api/tokens",
    payload: {
      email: user.email,
      password: user.password,
    },
  });
  assert.equal(tokenResponse.statusCode, 201);
  const { token } = JSON.parse(tokenResponse.payload);

  return token;
}

test("course creator is always authenticated user", async (t) => {
  const app = await build(t);
  const [user] = await app.db.query.users.findMany({ limit: 1 });
  const token = await getToken(app, user);

  const response = await app.inject({
    method: "POST",
    url: "/courses",
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      name: "Course",
      description: "Description",
      creatorId: 999999,
    },
  });

  assert.equal(response.statusCode, 201);
  const course = JSON.parse(response.payload);
  assert.equal(course.creatorId, user.id);
});

test("only course author can update or delete course", async (t) => {
  const app = await build(t);
  const users = await app.db.query.users.findMany();
  const owner = users[0];
  const anotherUser = users[1];
  const ownerToken = await getToken(app, owner);
  const anotherUserToken = await getToken(app, anotherUser);

  const courseResponse = await app.inject({
    method: "POST",
    url: "/courses",
    headers: {
      authorization: `Bearer ${ownerToken}`,
    },
    payload: {
      name: "Course",
      description: "Description",
    },
  });
  assert.equal(courseResponse.statusCode, 201);
  const course = JSON.parse(courseResponse.payload);

  const forbiddenUpdate = await app.inject({
    method: "PATCH",
    url: `/courses/${course.id}`,
    headers: {
      authorization: `Bearer ${anotherUserToken}`,
    },
    payload: {
      name: "Updated",
    },
  });
  assert.equal(forbiddenUpdate.statusCode, 403);

  const ownerUpdate = await app.inject({
    method: "PATCH",
    url: `/courses/${course.id}`,
    headers: {
      authorization: `Bearer ${ownerToken}`,
    },
    payload: {
      name: "Updated by owner",
    },
  });
  assert.equal(ownerUpdate.statusCode, 200);

  const forbiddenDelete = await app.inject({
    method: "DELETE",
    url: `/courses/${course.id}`,
    headers: {
      authorization: `Bearer ${anotherUserToken}`,
    },
  });
  assert.equal(forbiddenDelete.statusCode, 403);
});

test("only course author can manage lessons in that course", async (t) => {
  const app = await build(t);
  const users = await app.db.query.users.findMany();
  const owner = users[0];
  const anotherUser = users[1];
  const ownerToken = await getToken(app, owner);
  const anotherUserToken = await getToken(app, anotherUser);

  const courseResponse = await app.inject({
    method: "POST",
    url: "/courses",
    headers: {
      authorization: `Bearer ${ownerToken}`,
    },
    payload: {
      name: "Course",
      description: "Description",
    },
  });
  assert.equal(courseResponse.statusCode, 201);
  const course = JSON.parse(courseResponse.payload);

  const forbiddenCreateLesson = await app.inject({
    method: "POST",
    url: `/courses/${course.id}/lessons`,
    headers: {
      authorization: `Bearer ${anotherUserToken}`,
    },
    payload: {
      name: "Lesson",
      body: "Content",
    },
  });
  assert.equal(forbiddenCreateLesson.statusCode, 403);

  const ownerCreateLesson = await app.inject({
    method: "POST",
    url: `/courses/${course.id}/lessons`,
    headers: {
      authorization: `Bearer ${ownerToken}`,
    },
    payload: {
      name: "Lesson",
      body: "Content",
    },
  });
  assert.equal(ownerCreateLesson.statusCode, 201);
  const lesson = JSON.parse(ownerCreateLesson.payload);

  const forbiddenUpdateLesson = await app.inject({
    method: "PATCH",
    url: `/courses/${course.id}/lessons/${lesson.id}`,
    headers: {
      authorization: `Bearer ${anotherUserToken}`,
    },
    payload: {
      name: "Updated lesson",
    },
  });
  assert.equal(forbiddenUpdateLesson.statusCode, 403);

  const forbiddenDeleteLesson = await app.inject({
    method: "DELETE",
    url: `/courses/${course.id}/lessons/${lesson.id}`,
    headers: {
      authorization: `Bearer ${anotherUserToken}`,
    },
  });
  assert.equal(forbiddenDeleteLesson.statusCode, 403);
});
