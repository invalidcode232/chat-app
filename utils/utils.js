const mysql = require('mysql');
const constants = require('../config/constants');
const config = require('../config/config.json');

const con = mysql.createPool({
    host: constants.DB_HOST,
    user: constants.DB_USER,
    password: constants.DB_PASSWORD,
    database: constants.DB_NAME,
});

module.exports = {
    log: function(string) {
        console.log(`[${config.app_name}] ${string}`);
    },
    get_timestamp: function() {
        return Math.floor(Date.now() / 1000);
    },
    find_obj: function (obj, key, query) {
        for (i in obj) {
            if (parseInt(obj[i][key]) == query) {
                return obj[i];
            }
        }

        return [];
    },
    get_users: async function () {
        return new Promise((resolve) => {
            let sql = "SELECT id FROM users";

            con.query(sql, (err, res) => {
                if (err) throw err;

                resolve(JSON.stringify(res));
            })            
        })
    },
}