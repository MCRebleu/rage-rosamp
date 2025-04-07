mp.events.add("serverChatMessage", (player, msg) => {
    const formatted = `${player.name}: ${msg}`;
    
    // Trimite către toți jucătorii (sau doar lui, dacă vrei)
    mp.players.forEach(p => {
        p.call("pushToChat", [formatted]);
    });

    // Dacă vrei să apară și în consola ta:
    console.log(`[CHAT] ${formatted}`);
});



mp.events.add("playerJoin", (player) => {
    const welcomeMessages = [
      `<span style="color: #00ff00;">[SERVER]</span> Bine ai venit, ${player.name}!`,
      `<span style="color: #00ffff;">[INFO]</span> Te afli pe serverul <strong>RAGE.RO-SAMP</strong>.`,
      `<span style="color: #ffcc00;">[SFAT]</span> Scrie <i>/help</i> pentru comenzi utile.`
    ];
  
    player.call("pushToChat", [welcomeMessages]); // Trimitem toate mesajele
  });