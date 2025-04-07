// server_packages/events/playerChat.js

mp.events.add('playerChat', (player, message) => {
    if (!message || typeof message !== 'string') return;

    // Basic anti-spam/length check
    if (message.length > 100) {
        return player.outputChatBox("Mesajul e prea lung, chill.");
    }

    // Trim + sanitize
    const text = message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");

    mp.players.forEach(p => {
        p.outputChatBox(`[${player.name}]: ${text}`);
    });
});
