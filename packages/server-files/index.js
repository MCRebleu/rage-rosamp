// server_packages/index.js
mp.events.delayInitialization = true;
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(__dirname + '/settings.json')) {
    console.log("Nu există fișierul settings.json. Oprește serverul.");
    process.exit(1);
}

mp.settings = require('./settings.json');

mp.db = require('mysql2/promise').createPool({
    host: mp.settings.db_host,
    user: mp.settings.db_username,
    password: mp.settings.db_password,
    database: mp.settings.db_name,
    connectionLimit: mp.settings.db_connectionLimit || 5,
    multipleStatements: true
});

// Încarcă utilitare
require('./utils/permissions.js');

// Încarcă evenimente
require('./events/playerJoin.js');
require('./events/playerChat.js');

// Încarcă comenzi
fs.readdirSync(path.join(__dirname, 'commands')).forEach(file => {
    require(`./commands/${file}`);
});

// Inițializare DB & pornire
(async () => {
    try {
        console.log("Pornire server...");
        mp.events.delayInitialization = false;
    } catch (e) {
        console.error("Eroare la inițializare:", e);
    }
})();
