const { Router } = require("express");
const Gameroom = require("./model");
const authMiddleware = require("../auth/middleWare");
const User = require("../user/model");
const Player = require("../player/model");

function factory(stream) {
  const router = new Router();
  //Post gameroom
  router.post("/gameroom", authMiddleware, async (req, res, next) => {
    try {
      const gameroom = await Gameroom.create(req.body);

      const { user } = req;
      console.log("user", user);
      const action = {
        type: "NEW_GAMEROOM",
        payload: gameroom
      };

      const string = JSON.stringify(action);
      stream.send(string);
      res.send(gameroom);
    } catch (error) {
      next(error);
    }
  });
  //Get gameroom from stream by id
  router.get("/gameroom/:id", authMiddleware, async (req, res, next) => {
    try {
      const gameroom = await Gameroom.findByPk(req.params.id);
      const action = {
        type: "ONE_GAMEROOM",
        payload: gameroom
      };
      const string = JSON.stringify(action);

      stream.send(string);
      res.send(gameroom);
    } catch (error) {
      next(error);
    }
  });

  //Join router to add users in gameroom
  router.put("/join", authMiddleware, async (request, response, next) => {
    try {
      const user = await request.user.update({
        gameroomId: request.body.gameroomId
      });

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
