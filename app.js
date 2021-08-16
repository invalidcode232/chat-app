//#region Dependencies
const express = require('express');
const session = require('express-session');
const config = require('./config/config.json');
const path = require('path');
const mysql = require('mysql');
const utils = require('./utils/utils');
const io = require('socket.io')(4000);
// const io_client = require('socket.io-client');
// const socket = io_client("http://localhost:4000", { transports : ['websocket'] });
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
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    name: 'uniqueSessionID',
    resave: false
}));

utils.log(`Express app successfully set up!`)

// Connect to database
// const con = mysql.createConnection({
//     host: config.db_host,
//     user: config.db_user,
//     password: config.db_password,
//     database: config.db_name,
// });

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

con.connect((err) => {
    if (err) throw err;

    utils.log(`Database "${config.db_name}" connected!`)
});
//#endregion


//#region Express
app.get('/dashboard', (req, res) => {
    let session_id = req.query.session_id ? req.query.session_id : 1;

    let sessions_sql = "SELECT sessions.id, sessions.client_name, messages.body, messages.timestamp FROM whatsapp.sessions LEFT JOIN messages ON sessions.id = messages.session_id WHERE sessions.status = 'active' GROUP BY sessions.id ORDER BY messages.timestamp DESC";
    con.query(sessions_sql, (err, rows) => {
        if (err) throw err;

        let sessions = JSON.parse(JSON.stringify(rows));

        let messages_sql = "SELECT body, sender, timestamp FROM messages WHERE session_id = ?";
        con.query(messages_sql, [ session_id ], (err, rows) => {
            messages = JSON.parse(JSON.stringify(rows))

            res.render('dashboard.ejs', {
                app_name: config.app_name,
                page: 'Dashboard',
                is_user_page: true,
                sessions: sessions,
                messages: messages
            });            
        })
    });
});

app.get('/chat', (req, res) => {
    res.render('chat.ejs', {
        app_name: config.app_name,
        page: 'Live Chat',
        is_user_page: false,
        client_data: req.session.client_data,
        session_id: req.session.session_id
    });
});

app.post('/chat', (req, res) => {
    req.session.client_data = req.body;

    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;

    // Insert new session, and get the session id generated by it.
    // TODO: Change id into random stirng (instead of using numeric increment)
    let insert_sql = "INSERT INTO `whatsapp`.`sessions` (`id`, `client_name`, `client_email`, `client_phone`, `status`, `timestamp`) VALUES (DEFAULT, ?, ?, ?, ?, FROM_UNIXTIME(?));"
    con.query(insert_sql, [name, email, phone, "active", utils.get_timestamp().toString()], (err, result) => {
        if (err) throw err;

        let get_insert_sql = "SELECT LAST_INSERT_ID();"
        con.query(get_insert_sql, (err, result) => {
            if (err) throw err;
    
            // utils.log(res[0]["LAST_INSERT_ID()"]);
            req.session.session_id = result[0]["LAST_INSERT_ID()"];

            res.redirect("/chat");
        })
    })
});
//#endregion

//#region Socket
io.on('connection', (socket) => {
    let room = 0;

    socket.on('join', (session) => {
        socket.join(session);
        
        room = session;
    })

    socket.on("session-message", message_data => {
        let sql = "INSERT INTO `whatsapp`.`messages` (`id`, `session_id`, `body`, `sender`, `timestamp`) VALUES (DEFAULT, ?, ?, ?, FROM_UNIXTIME(?));";

        con.query(sql, [room, message_data.body, message_data.sender, message_data.timestamp], (err, res) => {
            if (err) throw err;
        })

        socket.to(room).emit("display-message", message_data);
    })
})
//#endregion


//#region Listener
app.listen(config.port, () => {
    utils.log(`App running at port ${config.port}! http://localhost:3000/dashboard`);
});
//#endregion