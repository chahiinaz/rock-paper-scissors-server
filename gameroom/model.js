const Sequelize = require("sequelize");
const db = require("../db");
const User = require("../user/model");
const Player = require("../player/model");

const Gameroom = db.define("gameroom", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Gameroom.hasMany(Player);
Player.belongsTo(Gameroom);

User.belongsTo(Gameroom);
Gameroom.hasMany(User);

module.exports = Gameroom;
