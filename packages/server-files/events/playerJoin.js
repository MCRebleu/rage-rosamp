// server_packages/events/playerJoin.js

mp.events.add('playerJoin', async (player) => {
    player.call("client:showLoginUI"); // presupunem că ai UI în client-side
    player.call('displayAnnouncement', ['Bine ai venit pe RAGE.MP - ROSAMP!']);

    try {
        const [result] = await mp.db.query(
            'SELECT admin_level FROM accounts WHERE username = ?',
            [player.name]
        );

        player.data = player.data || {};
        player.data.admin = result.length > 0 ? result[0].admin_level : 0;

        if (player.data.admin > 0) {
            player.outputChatBox(`[ffff00]Salut, ${player.name}! Ai admin nivel ${player.data.admin}.`);
        }

    } catch (err) {
        console.error('Eroare DB:', err);
        player.outputChatBox('[ff0000]Eroare la conectarea bazei de date.');
    }
});
