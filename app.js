//#region Dependencies
const express = require('express')
const session = require('express-session')
const config = require('./config/config.json')
const path = require('path')
//#endregion


//#region setup
// Init app
const app = express()

// Set our views directory and engine
app.engine('ejs', require('ejs-locals'))
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine', 'ejs');
//#endregion


//#region Main
app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs', {
        page: 'Dashboard'
    })
})

app.get('/chat', (req, res) => {

})
//#endregion


//#region Listener
app.listen(config.port, () => {
    console.log(`chat-app running at port ${config.port}!`)
})
//#endregion