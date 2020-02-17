const { Router } = require("express");
const router = new Router();

const User = require("./model");
const bcrypt = require("bcrypt");

const { toJWT } = require("../auth/jwt");

router.post("/signup", async (request, response) => {
  if (!request.body.email || !request.body.password) {
    return response
      .status(400)
      .send("Missing email or password in request body");
  }
  const hashedPassword = bcrypt.hashSync(request.body.password, 10);
  try {
    await User.create({
      ...request.body,
      password: hashedPassword
    });
    response.status(201).send("User created");
  } catch (error) {
    console.log(error.name);
    switch (error.name) {
      case "SequelizeUniqueConstraintError":
        return response.status(400).send({ message: "Email not unique" });

      default:
        return response.status(400).send("Baaaddd request");
    }
  }
});
