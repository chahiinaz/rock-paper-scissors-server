const Sequelize = require('sequelize')
const databaseUrl = 'postgres://postgres:secret@localhost:5432/postgres'
const connection = new Sequelize(databaseUrl)

connection
  .sync({ force: false })
  .then(() => console.log('Database connected!'))
  .catch(console.error)

module.exports = connection 
