//#region Dependencies
const express = require('express');
const session = require('express-session');
const config = require('./config/config.json');
const constants = require('./config/constants');
const path = require('path');
const mysql = require('mysql');
const utils = require('./utils/utils');
const Recaptcha = require('express-recaptcha').RecaptchaV3;
const bcrypt = require('bcrypt');
//#endregion

//#region setup
// Init app
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const recaptcha = new Recaptcha(constants.RECAPTCHA_SITE_KEY, constants.RECAPTCHA_SECRET_KEY, {callback: 'recaptcha_cb'})

// Set our views directory and engine
app.engine('ejs', require('ejs-locals'))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded());

// Set our express session
app.use(session({
    secret: constants.SESSION_SECRET,
    saveUninitialized: false,
    name: 'uniqueSessionID',
    resave: false
}));

utils.log(`Express app successfully set up!`)

const con = mysql.createPool({
    host: constants.DB_HOST,
    user: constants.DB_USER,
    password: constants.DB_PASSWORD,
    database: constants.DB_NAME,
});

utils.log(`Database "${constants.DB_NAME}" connected!`)
//#endregion


//#region Express
app.get('/dashboard', (req, res) => {
    let session_id = req.query.session_id ? req.query.session_id : 1;

    // Get sidebar contacts info
    let sessions_sql = "SELECT sessions.client_email, sessions.client_phone, sessions.id, sessions.client_name, messages.body, messages.timestamp FROM sessions LEFT JOIN messages ON sessions.id = messages.session_id WHERE sessions.status = 'active' GROUP BY sessions.id ORDER BY messages.timestamp DESC";
    con.query(sessions_sql, (err, rows) => {
        if (err) throw err;

        let sessions = JSON.parse(JSON.stringify(rows));

        // Get selected contact info
        let messages_sql = "SELECT body, sender, timestamp FROM messages WHERE session_id = ?";
        con.query(messages_sql, [ session_id ], (err, rows) => {
            if (err) throw err;

            let messages = JSON.parse(JSON.stringify(rows));

            let selected_session = utils.find_obj(sessions, "id", session_id)

            res.render('dashboard.ejs', {
                app_name: config.app_name,
                page: 'Dashboard',
                is_user_page: true,
                sessions: sessions,
                messages: messages,
                selected_session: selected_session
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
    let insert_sql = "INSERT INTO `sessions` (`id`, `client_name`, `client_email`, `client_phone`, `status`, `timestamp`) VALUES (DEFAULT, ?, ?, ?, ?, FROM_UNIXTIME(?));"
    con.query(insert_sql, [name, email, phone, "active", utils.get_timestamp().toString()], (err, result) => {
        if (err) throw err;

        let get_insert_sql = "SELECT id FROM sessions ORDER BY timestamp DESC LIMIT 1;"
        con.query(get_insert_sql, (err, result) => {
            if (err) throw err;
    
            // utils.log(res[0]["LAST_INSERT_ID()"]);
            req.session.session_id = result[0]["id"];

            res.redirect("/chat");
        });
    });
});

app.get("/register", recaptcha.middleware.render, (req, res) => {
    res.render("register.ejs", {
        app_name: config.app_name,
        page: 'Register',
        is_user_page: false,
        captcha: res.recaptcha
    });
});

app.post("/register", recaptcha.middleware.verify, (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    if (!req.recaptcha.error) {
        if (req.recaptcha.score > 0.6) {
            return res.json("Recaptcha score too low");
        }
    }
    else {
        return res.json("Recaptcha error.")
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;

        let sql = "INSERT INTO `users` (`id`, `email`, `username`, `password`) VALUES (DEFAULT, ?, ?, ?);";
        con.query(sql, [email, username, hash], (err, res) => {
            if (err) throw err;

            utils.log(`Registered new user "${username}"`)
        })
    })

    res.redirect("/register");
});

app.get("/login", recaptcha.middleware.render, (req, res) => {
    res.render("login.ejs", {
        app_name: config.app_name,
        page: 'Login',
        is_user_page: false,
        captcha: res.recaptcha
    })
});

app.post("/login", recaptcha.middleware.verify, (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!req.recaptcha.error) {
        if (req.recaptcha.score > 0.6) {
            return res.json("Recaptcha score too low");
        }
    }
    else {
        return res.json("Recaptcha error.");
    }

    let sql = "SELECT * FROM users WHERE email = ?;";
    con.query(sql, [email], (err, rows) => {
        if (err) throw err;

        let user = JSON.parse(JSON.stringify(rows));

        if (!user.length) {
            return res.redirect("/login");
        }

        bcrypt.compare(password, user[0].password, (err, is_valid) => {
            if (err) throw err;

            if (is_valid) {
                req.session.user_id = user[0].id;

                utils.log(`Successfully logged in user ${user[0].id}`);
                res.redirect("/dashboard");
            }
            else {
                utils.log(`Login failed for user ${user[0].id}`);
                res.redirect("/login");
            }
        })
    })
})
//#endregion

//#region Socket
io.on('connection', (socket) => {
    let room = 0;

    socket.on('join', (session) => {
        socket.join(session);
        
        room = session;
    })

    socket.on("session-message", message_data => {
        let sql = "INSERT INTO `messages` (`id`, `session_id`, `body`, `sender`, `timestamp`) VALUES (DEFAULT, ?, ?, ?, FROM_UNIXTIME(?));";

        con.query(sql, [room, message_data.body, message_data.sender, message_data.timestamp], (err, res) => {
            if (err) throw err;
        })

        socket.to(room).emit("display-message", message_data);
    })
})
//#endregion


//#region Listener
server.listen(constants.PORT, () => {
    utils.log(`App running at port ${constants.PORT}! Dashboard URL: http://localhost:3000/dashboard`);
});
//#endregion