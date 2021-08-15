//#region Dependencies
const express = require('express');
const session = require('express-session');
const config = require('./config/config.json');
const path = require('path');
const mysql = require('mysql');
const utils = require('./utils/utils');
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

utils.log(`Express app successfully set up!`)

// Connect to database
const con = mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_name,
});

con.connect((err) => {
    if (err) throw err;

    utils.log(`Database "${config.db_name}" connected!`)
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

    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;

    let sql = "INSERT INTO `whatsapp`.`sessions` (`id`, `client_name`, `client_email`, `client_phone`, `status`, `timestamp`) VALUES (DEFAULT, ?, ?, ?, ?, FROM_UNIXTIME(?));"
    con.query(sql, [name, email, phone, "active", utils.get_timestamp().toString()], (err, res) => {
        if (err) throw err;

        utils.log(`Registered new session`)
    })

    res.redirect('/chat');
});
//#endregion


//#region Listener
app.listen(config.port, () => {
    utils.log(`App running at port ${config.port}! http://localhost:3000/dashboard`);
});
//#endregion