// server_packages/commands/utility.js

const { hasAdminLevel } = require('../utils/permissions');

// /admins – Afișează adminii online
mp.events.addCommand('admins', (player) => {
    const admins = mp.players.toArray().filter(p => p.data && p.data.admin > 0);

    if (admins.length === 0) {
        return player.outputChatBox("❌ Nu sunt admini online.");
    }

    const list = admins.map(a => `${a.name} - Nivel ${a.data.admin}`).join('\n');
    player.outputChatBox("📋 Admini online:\n" + list);
});

// /o – Anunț global scurt
mp.events.addCommand('o', (player, fullText) => {
    if (!hasAdminLevel(player, 1)) return player.outputChatBox("❌ Nu ai acces.");

    if (!fullText || fullText.trim().length < 1) {
        return player.outputChatBox("❌ Folosește: /o [mesaj]");
    }

    const msg = fullText.trim();
    mp.players.broadcast(`📢 [Admin] ${player.name}: ${msg}`);
});

// /announce – Anunț cu client-side UI (dacă ai implementat unul)
mp.events.addCommand('announce', (player, _, ...args) => {
    if (!hasAdminLevel(player, 2)) return player.outputChatBox("❌ Nu ai permisiunea.");

    const text = args.join(" ");
    if (!text || text.length < 3) {
        return player.outputChatBox("❌ Folosește: /announce [mesaj]");
    }

    mp.players.forEach(p => {
        p.call('displayAnnouncement', [text]); // Trebuie definit pe client
    });

    player.outputChatBox("✅ Anunțul a fost trimis.");
});
