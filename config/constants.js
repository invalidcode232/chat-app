const config = require('./config.json');

module.exports = {
    PORT: process.env.PORT || config.port,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    SESSION_SECRET: process.env.SESSION_SECRET
}