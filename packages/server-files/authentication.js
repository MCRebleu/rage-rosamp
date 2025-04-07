const bcrypt = require('bcrypt');
const db = require('./database'); // sau calea corectă, vezi mai jos
const db = mp.db;



mp.events.add('playerReady', async (player) => {
    const ip = player.ip;

    const result = await db.query('SELECT * FROM accounts WHERE last_ip = ?', [ip]);

    if (result.length > 0) {
        player.call('client:loginHandler', ['success']);
        console.log(`✅ Autologin pe IP pentru ${ip}`);
    } else {
        player.call('client:showLoginUI');
        console.log(`🔓 Niciun cont găsit pentru IP-ul ${ip}`);
        console.log(`📥 Player ${player.name} conectat cu IP ${player.ip}`);
    }
});

mp.events.add('server:registerAccount', async (player, username, email, password) => {
    const existing = await db.query('SELECT * FROM accounts WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
        player.call('client:loginHandler', ['takeninfo']);
        return;
    }

    if (username.length < 3 || password.length < 5) {
        player.call('client:loginHandler', ['tooshort']);
        return;
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const ip = player.ip;

    await db.query(
        'INSERT INTO accounts (username, email, password, last_ip) VALUES (?, ?, ?, ?)',
        [username, email, hashedPass, ip]
    );

    player.call('client:loginHandler', ['registered']);
    console.log(`🆕 Utilizator înregistrat: ${username} (${ip})`);
});

mp.events.add('server:loginAccount', async (player, username, password) => {
    const result = await db.query('SELECT * FROM accounts WHERE username = ?', [username]);

    if (result.length === 0) {
        player.call('client:loginHandler', ['incorrectinfo']);
        return;
    }

    const user = result[0];
    const passMatch = await bcrypt.compare(password, user.password);

    if (!passMatch) {
        player.call('client:loginHandler', ['incorrectinfo']);
        return;
    }

    await db.query('UPDATE accounts SET last_ip = ? WHERE id = ?', [player.ip, user.id]);
    player.call('client:loginHandler', ['success']);
    console.log(`🔓 Utilizator logat: ${username} (${player.ip})`);
});