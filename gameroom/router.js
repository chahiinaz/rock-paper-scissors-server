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
      const player = await Player.create({
        gameroomId: request.body.gameroomId,
        userId: request.user.id
      });

      const everything = await Gameroom.findAll({ include: [Player] });

      const action = {
        type: "ALL_GAMEROOMS",
        payload: everything
      };
      // const player = await Player.create();

      const string = JSON.stringify(action);

      stream.send(string);

      response.send(player);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = factory;
