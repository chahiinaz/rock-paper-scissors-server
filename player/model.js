const Sequelize = require("sequelize");
const db = require("../db.js");
const Gameroom = require("../gameroom/model");
const User = require("../user/model");

const Player = db.define("player", {
  choice: {
    type: Sequelize.ENUM,
    values: ["rock", "paper", "scissors", "no_choice"],
    defaultValue: "no_choice"
  },
  points: { type: Sequelize.INTEGER, defaultValue: 0 },
  game_won: Sequelize.INTEGER
});

module.exports = Player;
