//#region Dependencies
const express = require('express')
const http = require('http')
const config = require('./config/config.json')
const path = require('path')
//#endregion


//#region setup
// Init app
const app = express()

// Set our views directory and engine
app.engine('ejs', require('ejs-locals'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//#endregion


//#region Main
app.get('/', (req, res) => {
    res.render('index.ejs', {
        title: "Hello, world!"
    })
})
//#endregion


//#region Listener
app.listen(config.port, () => {
    console.log(`chat-app running at port ${config.port}!`)
})
//#endregion