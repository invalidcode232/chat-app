//#region Dependencies
const express = require('express');
const session = require('express-session');
const config = require('./config/config.json');
const path = require('path');
const mysql = require('mysql');
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

// Set our express session
app.use(session({
    secret: config.session_secret,
    saveUninitialized: false,
    name: 'uniqueSessionID',
    resave: false
}));

console.log(`[${config.app_name}] Express app successfully set up!`);

// Connect to database
const con = mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_name,
});

con.connect((err) => {
    if (err) throw err;

    console.log(`[${config.app_name}] Database "${config.db_name}" connected!`);
});
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

    // console.log(req.session.client_data)
});

app.post('/chat', (req, res) => {
    req.session.client_data = req.body;

    name = req.body.name;
    email = req.body.email;
    phone = req.body.phone;

    res.redirect('/chat');
});
//#endregion


//#region Listener
app.listen(config.port, () => {
    console.log(`[${config.app_name}] App running at port ${config.port}! http://localhost:3000/dashboard`);
});
//#endregion