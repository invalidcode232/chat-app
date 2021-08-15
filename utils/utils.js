const config = require('../config/config.json');

module.exports = {
    log: function(string) {
        console.log(`[${config.app_name}] ${string}`);
    },
    get_timestamp: function() {
        return Math.floor(Date.now() / 1000);
    }
}