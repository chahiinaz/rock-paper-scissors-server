const { Router } = require("express");
const Gameroom = require("../gameroom/model");
const User = require("../user/model");

function factory(stream) {
  const router = new Router();
  //Join router to add users in gameroom
  router.put("/join", async (request, response, next) => {
    try {
      const user = await User.update(
        {
          gameroomId: request.body.gameroomId
        },
        {
          where: {
            id: request.body.userId
          }
        }
      );

      const everything = await Gameroom.findAll({ include: [User] });

      const action = {
        type: "ALL_GAMEROOMS",
        payload: everything
      };

      const string = JSON.stringify(action);

      stream.send(string);

      response.send(user);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = factory;
