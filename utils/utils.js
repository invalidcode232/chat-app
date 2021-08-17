const config = require('../config/config.json');

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
    }
}