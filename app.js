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
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded());

//Set our express session
app.use(session({
    secret: config.session_secret,
    saveUninitialized: false,
    name: 'uniqueSessionID',
    resave: false
}));
//#endregion


//#region Main
app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs', {
        app_name: config.app_name,
        page: 'Dashboard',
        is_user_page: true,
    });
});

app.get('/chat', (req, res) => {
    res.render('chat.ejs', {
        app_name: config.app_name,
        page: 'Live Chat',
        is_user_page: false,
        client_data: req.session.client_data
    });

    console.log(req.session.client_data)
});

app.post('/chat', (req, res) => {
    req.session.client_data = req.body;

    res.redirect('/chat');
});
//#endregion


//#region Listener
app.listen(config.port, () => {
    console.log(`${config.app_name} running at port ${config.port}! http://localhost:3000/dashboard`);
});
//#endregion