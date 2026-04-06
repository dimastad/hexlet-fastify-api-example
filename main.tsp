import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{
  title: "Hexlet Fastify Rest Api Example",
})
namespace FastifyRestApiExample;

@error
model NotFoundError {
  @statusCode _: 404;
}

@error
model UnprocessableEntityError {
  @statusCode _: 422;
}

model Timestamps {
  createdAt: utcDateTime;
}

model User {
  id: numeric;

  @minLength(2)
  @maxLength(100)
  fullName: string | null;

  @format("email")
  email: string;

  ...Timestamps;
}

model UserCreateDTO {
  fullName?: string;
  email: string;
}

model UserEditDTO {
  fullName?: string;
}

@route("/users")
namespace users {
  @get
  @useAuth(BearerAuth)
  op index(@query page?: numeric = 1): {
    @body _: {
      data: User[];
    };
  };

  @get
  @useAuth(BearerAuth)
  op show(@path id: numeric): {
    @body _: User;
  } | NotFoundError;

  @post
  op create(@body _: UserCreateDTO): {
    @body _: User;
    @statusCode statusCode: 201;
  } | UnprocessableEntityError;

  @patch
  @useAuth(BearerAuth)
  op update(@path id: numeric, @body _: UserEditDTO): {
    @body _: User;
  } | NotFoundError | UnprocessableEntityError;

  @delete
  @useAuth(BearerAuth)
  op destroy(@path id: numeric): {
    @statusCode statusCode: 204;
  } | NotFoundError;
}
