const Sequelize = require("sequelize");
const db = require("../db.js");

const User = sequelize("user", {
  username: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, unique: true, allowNull: false },
  password: { type: Sequelize.STRING, allowNull: false }
});

module.exports = User;
