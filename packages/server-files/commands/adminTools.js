// server_packages/commands/adminTools.js

const { hasAdminLevel } = require('../utils/permissions');

// /spawncar [nume_vehicul]
mp.events.addCommand('spawncar', (player, _, model) => {
    if (!hasAdminLevel(player, 1)) return player.outputChatBox("❌ Acces interzis.");

    if (!model) return player.outputChatBox("❌ Folosește: /spawncar [model]");

    const pos = player.position;

    try {
        const vehicle = mp.vehicles.new(model.toLowerCase(), pos, {
            heading: player.heading,
            numberPlate: 'ADMIN',
            locked: false
        });

        vehicle.setVariable('createdByAdmin', true);
        vehicle.setVariable('owner', player.name);

        player.outputChatBox(`✅ Vehicul ${model} creat.`);
    } catch (err) {
        player.outputChatBox("❌ Modelul vehiculului nu este valid.");
    }
});

// /despawncars
mp.events.addCommand('despawncars', (player) => {
    if (!hasAdminLevel(player, 2)) return player.outputChatBox("❌ N-ai destulă putere pentru distrugere.");

    let count = 0;

    mp.vehicles.forEach(vehicle => {
        if (vehicle.getVariable('createdByAdmin') === true) {
            vehicle.destroy();
            count++;
        }
    });

    player.outputChatBox(`✅ Au fost despawnate ${count} vehicule.`);
});

// /tp [nume]
mp.events.addCommand('tp', (player, _, targetName) => {
    if (!hasAdminLevel(player, 1)) return player.outputChatBox("❌ Nu ai voie, magicianule.");

    const target = mp.players.toArray().find(p => p.name.toLowerCase() === targetName?.toLowerCase());
    if (!target) return player.outputChatBox("❌ Jucătorul nu există.");

    player.position = target.position;
    player.outputChatBox(`✅ Te-ai teleportat la ${target.name}.`);
});

// /bring [nume]
mp.events.addCommand('bring', (player, _, targetName) => {
    if (!hasAdminLevel(player, 2)) return player.outputChatBox("❌ E nevoie de mai multă autoritate pentru asta.");

    const target = mp.players.toArray().find(p => p.name.toLowerCase() === targetName?.toLowerCase());
    if (!target) return player.outputChatBox("❌ Jucătorul nu există.");

    target.position = player.position;
    player.outputChatBox(`✅ L-ai teleportat pe ${target.name} la tine.`);
});

// /slay [nume]
mp.events.addCommand('slay', (player, _, targetName) => {
    if (!hasAdminLevel(player, 2)) return player.outputChatBox("❌ Nu ai autorizație să ucizi.");

    const target = mp.players.toArray().find(p => p.name.toLowerCase() === targetName?.toLowerCase());
    if (!target) return player.outputChatBox("❌ Jucătorul nu a fost găsit.");

    target.health = 0;
    player.outputChatBox(`☠️ Ai omorât pe ${target.name}.`);
});

// /respawn [nume]
mp.events.addCommand('respawn', (player, _, targetName) => {
    if (!hasAdminLevel(player, 2)) return player.outputChatBox("❌ Comandă pentru seniori doar.");

    const target = mp.players.toArray().find(p => p.name.toLowerCase() === targetName?.toLowerCase());
    if (!target) return player.outputChatBox("❌ Nu l-am găsit.");

    target.spawn(new mp.Vector3(195.1, -933.5, 30.7)); // coordonate temporare
    target.health = 100;
    target.armour = 0;

    player.outputChatBox(`✅ L-ai respawnat pe ${target.name}.`);
});

// /revive [nume]
mp.events.addCommand('revive', (player, _, targetName) => {
    if (!hasAdminLevel(player, 2)) return player.outputChatBox("❌ Nu ai voie să învii oameni. Doar buguri.");

    const target = mp.players.toArray().find(p => p.name.toLowerCase() === targetName?.toLowerCase());
    if (!target) return player.outputChatBox("❌ Jucătorul nu a fost găsit.");

    target.health = 100;
    target.outputChatBox("🩺 Ai fost readus la viață de un admin.");
    player.outputChatBox(`✅ L-ai revigorat pe ${target.name}.`);
});
