// server_packages/commands/admin.js

const { hasAdminLevel } = require('../utils/permissions');

// Kick command
mp.events.addCommand('kick', (player, _, targetName) => {
    if (!hasAdminLevel(player, 1)) return player.outputChatBox("❌ Nu ai acces la această comandă.");

    if (!targetName) return player.outputChatBox("❌ Folosește: /kick [nume_jucător]");

    const target = mp.players.toArray().find(p => p.name.toLowerCase() === targetName.toLowerCase());

    if (!target) return player.outputChatBox("❌ Jucătorul nu a fost găsit.");

    target.kick("Ai fost dat afară de un administrator.");
    player.outputChatBox(`✅ Ai dat kick lui ${target.name}.`);
});

// Ban command
mp.events.addCommand('ban', async (player, _, targetName) => {
    if (!hasAdminLevel(player, 2)) return player.outputChatBox("❌ Acces interzis.");

    if (!targetName) return player.outputChatBox("❌ Folosește: /ban [nume_jucător]");

    const target = mp.players.toArray().find(p => p.name.toLowerCase() === targetName.toLowerCase());

    if (!target) return player.outputChatBox("❌ Jucătorul nu a fost găsit.");

    try {
        await mp.db.query('UPDATE accounts SET banned = 1 WHERE username = ?', [target.name]);
        target.kick("Ai fost banat.");
        player.outputChatBox(`✅ Ai banat jucătorul ${target.name}.`);
    } catch (err) {
        console.error(err);
        player.outputChatBox("⚠️ Eroare la actualizarea bazei de date.");
    }
});

// Set admin level
mp.events.addCommand('setadmin', async (player, _, id, level) => {
    if (!hasAdminLevel(player, 7)) return player.outputChatBox("❌ N-ai gradul necesar, bossule.");

    const target = mp.players.at(parseInt(id));
    const newLevel = parseInt(level);

    if (!target || isNaN(newLevel) || newLevel < 0 || newLevel > 7) {
        return player.outputChatBox("❌ Folosește: /setadmin [id] [nivel (0-7)]");
    }

    target.data.admin = newLevel;
    target.setVariable('admin_level', newLevel);

    try {
        await mp.db.query('UPDATE accounts SET admin_level = ? WHERE username = ?', [newLevel, target.name]);
        player.outputChatBox(`✅ ${target.name} este acum admin level ${newLevel}.`);
        target.outputChatBox(`📢 Ai fost promovat la admin level ${newLevel}.`);
    } catch (err) {
        console.error(err);
        player.outputChatBox("⚠️ Eroare la setarea nivelului.");
    }
});
