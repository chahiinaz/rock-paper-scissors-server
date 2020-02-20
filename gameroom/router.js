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
      const { name } = req.body;
      const gameroom = await Gameroom.create({ name, round: 0 });
      console.log("game?", gameroom);

      // const { user } = req;

      // console.log("user", user);

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
      const gameroom = await Gameroom.findAll({
        where: {
          id: req.params.id
        },
        include: [{ model: Player }]
      });
      console.log("gameroom!!!\n\n\n\n\n\n\n", gameroom);
      // const gameroom = await Gameroom.findByPk(req.params.id);
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
      const reqGameroomId = request.body.gameroomId;

      const player = await Player.findOne({
        where: { gameroomId: reqGameroomId, userId: request.user.id }
      });
      console.log("player", player);
      const gameroom = await Gameroom.findByPk(reqGameroomId);
      console.log("gameroom", gameroom);
      const everything = await Gameroom.findAll({ include: [Player] });
      console.log("everything", everything);
      const playersInGame = await Player.findAndCountAll({
        where: { gameroomId: reqGameroomId }
      });

      // if (playersInGame.count >= 1) {
      //   const roomUpdatedRound = await gameroom.update({
      //     round: ++gameroom.round
      //   });
      //   console.log("increment round");
      //   return response.send(roomUpdatedRound);
      // }

      const action = {
        type: "ALL_GAMEROOMS",
        payload: everything
      };

      console.log("action", action, action.payload);
      const string = JSON.stringify(action);
      console.log("string", string);

      stream.send(string);

      if (!player) {
        const newPlayer = await Player.create({
          gameroomId: request.body.gameroomId,
          userId: request.user.id
        });
        console.log("create new player");
        response.send(newPlayer);
      } else if (player) {
        console.log("send existing player");
        response.send(player);
      }
    } catch (error) {
      next(error);
    }
  });

  router.put("/player/:choice", authMiddleware, async (req, res, next) => {
    const playerId = req.body.playerId;
    const gameRoomId = req.body.gameRoomId;
    console.log("player????", playerId);

    // const gameroom = await Gameroom.findByPk(player.gameroomId);
    const { choice } = req.params;

    const gameroom = await Gameroom.findAll({
      where: {
        id: gameRoomId
      },
      include: [{ model: Player }]
    });

    console.log("gameroom", gameroom);

    await Player.update({ choice: choice }, { where: { id: playerId } });
    const playersInGame = await Player.findAll({
      where: { gameroomId: gameRoomId }
    });

    const chosen = playersInGame.every(player => {
      console.log("every player", player.dataValues.choice);
      return player.dataValues.choice;
    });

    if (chosen) {
      const gameWinner = gameLogic(playersInGame);

      if (gameWinner) {
        const { winner } = gameWinner;
        await winner.update({
          points: winner.points + 1,
          game_won: winner.game_won + 1
        });
      }
      res.send({ chosen, gameroom });
    }
  });

  return router;
}

function gameLogic(players) {
  const playerOne = players[0];
  const playerTwo = players[1];
  const choiceOne = playerOne.choice;
  const choiceTwo = playerTwo.choice;

  const playerOneWinner = {
    winner: playerOne,
    loser: playerTwo
  };

  const playerTwoWinner = {
    winner: playerTwo,
    loser: playerOne
  };

  if (choiceOne === choiceTwo) {
    return null;
  }
  if (choiceOne === "rock") {
    if (choiceTwo === "paper") {
      return playerTwoWinner;
    } else {
      return playerOneWinner;
    }
  }
  if (choiceOne === "paper") {
    if (choiceTwo === "scissors") {
      return playerTwoWinner;
    } else {
      return playerOneWinner;
    }
  }
  if (choiceTwo === "rock") {
    return playerTwoWinner;
  } else {
    return playerOneWinner;
  }
}

module.exports = factory;
