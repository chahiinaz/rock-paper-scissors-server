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

router.post("/login", async (request, response) => {
  console.log("request body", request.body);
  try {
    const user = await User.findOne({ where: { email: request.body.email } });

    if (!user) {
      response.status(400).send({
        message: "User with that email does not exist"
      });
    }
    const passwordValid = bcrypt.compareSync(
      request.body.password,
      user.password
    );
    if (passwordValid) {
      const token = toJWT({ id: user.id });
      return response.status(200).send({
        token: token,
        email: user.email,
        username: user.username,
        id: user.id
      });
    }
    if (!passwordValid) {
      response.status(400).send({
        message: "Password was incorrect"
      });
    }
  } catch (error) {
    response.status(400).send({
      message: `Error ${error.name}: ${error.message}`
    });
  }
});

module.exports = router;
