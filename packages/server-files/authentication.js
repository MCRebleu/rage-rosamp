const bcrypt = require('bcrypt');
const db = mp.db;

// EVENT: Când jucătorul e gata
mp.events.add('playerReady', (player) => {
    console.log(`📥 Player ${player.name} conectat cu IP ${player.ip}`);
    player.call('client:showLoginUI');
});

// REGISTER: Crează cont nou
mp.events.add('server:registerAccount', async (player, username, email, password) => {
    try {
        if (!username || !email || !password) {
            return player.call('client:loginHandler', ['missingfields']);
        }

        if (username.length < 3 || password.length < 5) {
            return player.call('client:loginHandler', ['tooshort']);
        }

        // Validare email basic
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return player.call('client:loginHandler', ['invalidemail']);
        }

        const [existing] = await db.query(
            'SELECT * FROM accounts WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return player.call('client:loginHandler', ['takeninfo']);
        }

        const hashedPass = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO accounts (username, email, password, last_ip) VALUES (?, ?, ?, ?)',
            [username, email, hashedPass, player.ip]
        );

        console.log(`🆕 Utilizator înregistrat: ${username} (${player.ip})`);
        player.call('client:loginHandler', ['registered']);

    } catch (err) {
        console.error("❌ Eroare la înregistrare:", err);
        player.call('client:loginHandler', ['error']);
    }
});

// LOGIN: Autentifică jucătorul
mp.events.add('server:loginAccount', async (player, username, password) => {
    try {
        if (!username || !password) {
            return player.call('client:loginHandler', ['missingfields']);
        }

        const [rows] = await db.query(
            'SELECT * FROM accounts WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return player.call('client:loginHandler', ['incorrectinfo']);
        }

        const user = rows[0];
        const passMatch = await bcrypt.compare(password, user.password);

        if (!passMatch) {
            return player.call('client:loginHandler', ['incorrectinfo']);
        }

        // Salvăm IP nou și setăm date jucător
        await db.query('UPDATE accounts SET last_ip = ? WHERE id = ?', [player.ip, user.id]);

        player.data = player.data || {};
        player.data.admin = user.admin_level || 0;
        player.setVariable('admin_level', player.data.admin);

        console.log(`🔓 Utilizator logat: ${username} (${player.ip}), nivel admin: ${player.data.admin}`);
        player.call('client:loginHandler', ['success']);

    } catch (err) {
        console.error("❌ Eroare la autentificare:", err);
        player.call('client:loginHandler', ['error']);
    }
});
