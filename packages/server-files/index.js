mp.events.delayInitialization = true;   
const fs = require('fs');








//  Step 2 - Obtaining and loading config file
if (!fs.existsSync(__dirname + '/settings.json')) {
    console.log(`${'You do not have a \'settings.json\' file setup.'}`);
    process.exit(0);
} else {
    mp.settings = require('./settings.json');
}

//  Step 3 - Load up gamemode assets
mp.db = require('mysql2/promise').createPool({host: mp.settings.db_host, user: mp.settings.db_username, password: mp.settings.db_password, database: mp.settings.db_name, connectionLimit: mp.settings.db_connectionLimit, multipleStatements: true});
mp.test = require('./test.js');
require('./authentication.js');
const database = require('./database.js');

//  Step 4 - Wait for everything to load, then allow connections once all is loaded
(async () => {
    try {
        await database.initializeDatabase();
        await mp.test.init();
        mp.events.delayInitialization = false;    //  Players cannot join until this is false
    } catch(e) {
        console.log(e)
    }
})();

// Functii


mp.events.add("playerJoin", (player) => {
    player.call("client:showLoginUI");
    player.call('displayAnnouncement', ['Bine ai venit pe RAGE.MP - ROSAMP!']);

    mp.db.query('SELECT admin_level FROM accounts WHERE username = ?', [player.name])
    .then(([result]) => {
        if (result.length === 0) {
            return sendMessage(player, 'ff0000', 'Eroare la încărcarea datelor!');
        }

        player.data = player.data || {};
        player.data.admin = result[0].admin_level;
        player.setVariable('admin_level', result[0].admin_level);

        if (player.data.admin > 0) {
            sendMessage(player, 'ffff00', `Salut, ${player.name}, ai admin nivel ${player.data.admin}!`);
        }
    }).catch(err => {
        console.error(err);
        sendMessage(player, 'ff0000', 'Eroare la conexiunea cu baza de date!');
    });
});

//Comenzi//

// Funcție pentru a trimite mesaje (înlocuiește sendMessage cu această funcție)
function sendMessage(player, color, message) {
    player.outputChatBox(`[${color}] ${message}`);
}

// Comandă /kick - Dă afară un jucător după nume
mp.events.addCommand('kick', (player, _, ...args) => {
    if (player.getVariable('admin_level') >= 1) {  // Verificăm dacă jucătorul este admin
        let target = null;
        
        // Căutăm jucătorul după numele dat ca argument
        if (args.length > 0) {
            target = mp.players.toArray().find(p => p.name.toLowerCase() === args[0].toLowerCase());
        }

        if (target) {
            target.kick();  // Dăm afară jucătorul
            player.outputChatBox(`${target.name} a fost dat afară.`);
        } else {
            player.outputChatBox("Jucătorul nu a fost găsit.");
        }
    } else {
        player.outputChatBox("Nu ai permisiunea de a folosi această comandă.");
    }
});

// Comandă /ban - Banează un jucător
mp.events.addCommand('ban', (player, _, ...args) => {
    if (player.getVariable('admin_level') >= 2) {  // Verificăm dacă jucătorul are permisiunea de ban
        let target = null;

        // Căutăm jucătorul după numele dat ca argument
        if (args.length > 0) {
            target = mp.players.toArray().find(p => p.name.toLowerCase() === args[0].toLowerCase());
        }

        if (target) {
            target.kick();
            mp.db.query('UPDATE `accounts` SET `banned` = 1 WHERE `username` = ?', [target.name]); // Setăm utilizatorul ca fiind banat în baza de date
            player.outputChatBox(`${target.name} a fost banat.`);
        } else {
            player.outputChatBox("Jucătorul nu a fost găsit.");
        }
    } else {
        player.outputChatBox("Nu ai permisiunea de a folosi această comandă.");
    }
});

// Comandă /tp - Teleportează un jucător la altul
mp.events.addCommand('tp', (player, _, ...args) => {
    if (player.getVariable('admin_level') >= 1) {  // Admini pot folosi această comandă
        let target = null;
        let destination = player;  // Destinația va fi jucătorul care dă comanda

        // Dacă există argumente, căutăm jucătorul dorit
        if (args.length > 0) {
            target = mp.players.toArray().find(p => p.name.toLowerCase() === args[0].toLowerCase());
            if (target) {
                destination = target;
            } else {
                player.outputChatBox("Jucătorul nu a fost găsit.");
                return;
            }
        }

        player.position = destination.position;  // Teleportăm jucătorul la destinație
        player.outputChatBox(`Te-ai teleportat la ${destination.name}`);
    } else {
        player.outputChatBox("Nu ai permisiunea de a folosi această comandă.");
    }
});

// Comandă /slay - Omoară un jucător
mp.events.addCommand('kill', (player, _, ...args) => {
    if (player.getVariable('admin_level') >= 2) {  // Adminii de nivel 2 pot să omoare jucători
        let target = null;

        // Căutăm jucătorul după numele dat ca argument
        if (args.length > 0) {
            target = mp.players.toArray().find(p => p.name.toLowerCase() === args[0].toLowerCase());
        }

        if (target) {
            target.health = 0; // Omoară jucătorul
            player.outputChatBox(`${target.name} a fost omorât.`);
        } else {
            player.outputChatBox("Jucătorul nu a fost găsit.");
        }
    } else {
        player.outputChatBox("Nu ai permisiunea de a folosi această comandă.");
    }
});

// Comandă /spawn - Respawnează jucătorul la un loc presetat
mp.events.addCommand('spawn', (player) => {
    if (player.getVariable('admin_level') >= 1) {  // Poți adăuga un nivel minim de permisiune pentru admini (opțional)
        // Setează coordonatele de spawn
        const spawnPosition = new mp.Vector3(195.1, -933.5, 30.7);  // Poziția X, Y, Z (poți înlocui cu coordonatele dorite)

        // Respawnează jucătorul
        player.position = spawnPosition;  // Mută jucătorul la locația de spawn

        // Resetează sănătatea și alte variabile de respawn (optional)
        player.health = 100;  // Setează sănătatea la 100 (poți modifica după dorință)
        player.armour = 100;  // Setează armura la 100 (dacă vrei)

        // Afișează un mesaj jucătorului
        player.outputChatBox(`Te-ai respawnat la locația de spawn.`);
    } else {
        player.outputChatBox("Nu ai permisiunea de a folosi această comandă.");
    }
});





mp.events.addCommand('plm', (player) => { 
    if (player.name !== "MCRebelu") return; // Doar tu poți folosi comanda
  
    player.data.admin = 7; // Setează admin level 7 în server
    player.setVariable('admin_level', 7); // Setează și variabila de admin pentru verificări ulterioare

    mp.db.query('UPDATE `accounts` SET admin_level = ? WHERE username = ?', [7, player.name]);
    sendMessage(player, 'ffffff', `De amu ai admin 7`);
});


mp.events.addCommand('admins', (player) => {
    let admins = mp.players.toArray().filter(p => p.data && p.data.admin > 0);

    if (admins.length === 0) {
        return sendMessage(player, 'ff0000', 'Nu sunt admini online.');
    }

    let adminList = admins.map(admin => `${admin.name} - Nivel ${admin.data.admin}`).join('\n');

    sendMessage(player, 'ffffff', `Admini online:\n${adminList}`);
});


 
function sendUsage(player, message) {
    player.outputChatBox(`❌ Utilizare: ${message}`);
}

function getNameOnNameID(id) {
    let player = mp.players.at(id); // Găsește jucătorul după ID
    if (!player) return null; // Dacă nu există, returnează null
    return player.name; // Returnează numele jucătorului
}

mp.events.addCommand('setadmin', (player, _, id, adminLevel) => { 
    if (player.data.admin < 7) {
        return player.outputChatBox("❌ Nu ai permisiunea necesară pentru această comandă.");
    }

    // Verifică dacă parametrii sunt furnizați corect
    if (!id || !adminLevel) {
        return sendUsage(player, `/setadmin [player ID] [admin level]`);
    }

    adminLevel = parseInt(adminLevel); // Convertim adminLevel la număr
    if (isNaN(adminLevel) || adminLevel < 0 || adminLevel > 7) {
        return sendMessage(player, 'ffffff', `❌ Nivelul de admin trebuie să fie între 0 și 7.`);
    }

    // Găsește jucătorul după ID
    const user = mp.players.at(parseInt(id));
    if (!user) {
        return player.outputChatBox("❌ Jucătorul cu acest ID nu este online.");
    }

    // Asigură-te că `user.data` există
    if (!user.data) user.data = {};

    // Setează nivelul de admin
    user.data.admin = adminLevel;

    // Mesaje pentru jucători
    sendMessage(player, COLOR_ADMIN, `(Notice):!{ffffff} You promoted ${user.name} to admin level ${user.data.admin}.`);
    sendMessage(user, COLOR_ADMIN, `(Notice):!{ffffff} Admin ${player.name} promoted you to admin level ${user.data.admin}.`);

    // Actualizează nivelul de admin în baza de date
    mp.db.query('UPDATE `accounts` SET admin_level = ? WHERE username = ?', [user.data.admin, user.name], (err) => {
        if (err) {
            console.log("⚠️ Eroare la actualizarea bazei de date:", err);
            return player.outputChatBox("❌ Eroare la actualizarea bazei de date.");
        }
        console.log(`✅ Admin level actualizat pentru ${user.name} la nivelul ${user.data.admin}`);
    });
});



mp.events.addCommand('spawncar', (player, _, ...args) => {
    if (player.getVariable('admin_level') >= 1) {  // Verificăm dacă jucătorul are permisiunea de a folosi comanda
        if (args.length === 0) {
            return player.outputChatBox("❌ Utilizare: /car [model_vehicul]");
        }

        let vehicleModel = args[0].toLowerCase();  // Preluăm modelul vehiculului din argumentele comenzii

        // Verificăm dacă modelul vehiculului este valid
        const validVehicles = [
            'adder', 'zentorno', 'turismor', 'elegy', 'faggio', 'comet', 'banshee', 'sultanrs', 'infernus', 
            'f620', 'ballista', 'cogcabrio', 'i8', 'panto', 'roosevelt', 't20', 'trophytruck', 'khamelion', 
            'vestra', 'x80proto', 'admiral', 'landstalker', 'dubsta', 'voodoo'
        ];

        if (!validVehicles.includes(vehicleModel)) {
            return player.outputChatBox("❌ Modelul de vehicul nu este valid.");
        }

        // Setează coordonatele de spawn pentru vehicul (poți ajusta după necesitate)
        const spawnPosition = player.position;

        // Creăm vehiculul
        let vehicle = mp.vehicles.new(vehicleModel, spawnPosition, {
            heading: player.heading, // Setăm direcția vehiculului în funcție de jucător
            numberPlate: 'MYPLATE',  // Poți personaliza numărul de înmatriculare
            locked: false,  // Vehiculul va fi deblocat
        });

        // Setăm variabila pentru a marca vehiculul ca fiind spawnat de un admin
        vehicle.setVariable('createdByAdmin', true);

        // Mesaj de succes pentru jucător
        player.outputChatBox(`✅ Ai spawnat un vehicul de tip ${vehicleModel}.`);

        // Mesaj pentru ceilalți jucători
        mp.players.broadcast(`${player.name} a spawnat un vehicul ${vehicleModel} pe server.`);
    } else {
        player.outputChatBox("❌ Nu ai permisiunea de a folosi această comandă.");
    }
});



mp.events.addCommand('despawncars', (player) => {
    // Verificăm dacă jucătorul are permisiunea de a folosi comanda (admin_level >= 2)
    if (player.getVariable('admin_level') >= 2) {
        let despawnedCount = 0;

        // Parcurgem toate vehiculele de pe server
        mp.vehicles.forEach(vehicle => {
            // Verificăm dacă vehiculul a fost spawnat de un admin (presupunând că vehiculul are un atribut 'createdByAdmin')
            if (vehicle.getVariable('createdByAdmin') === true) {
                // Ștergem vehiculul
                vehicle.destroy();
                despawnedCount++;
            }
        });

        // Mesaj de succes pentru jucător
        if (despawnedCount > 0) {
            player.outputChatBox(`✅ Au fost despawnate ${despawnedCount} vehicule spawnate de admini.`);
        } else {
            player.outputChatBox("❌ Nu există vehicule spawnate de admini pentru a fi despawnate.");
        }

        // Mesaj pentru ceilalți jucători
        mp.players.broadcast(`${player.name} a despawnat toate vehiculele spawnate de admini.`);
    } else {
        player.outputChatBox("❌ Nu ai permisiunea de a folosi această comandă.");
    }
});

mp.events.addCommand("ah", (player) => {
    // Schimbă verificarea în funcție de cum verifici adminii pe serverul tău
    if (!player.data.admin || player.data.admin < 1){
        return player.outputChatBox("Nu ai acces la această comandă.");
    }

    player.outputChatBox("=== Lista Comenzilor de Admin ===");
    player.outputChatBox("/kick [id] - Dă kick unui jucător.");
    player.outputChatBox("/setadmin [id] [level admin] - seteaza adminul unui player.");
    player.outputChatBox("/spawncar [masina] - spawnezi o masina pe server.");
    player.outputChatBox("/despawncars - despawnezi toate masinile de pe server.");
    player.outputChatBox("/admins - arata adminii online.");
    player.outputChatBox("/tp [id] - Te teleportezi la un jucător.");
    player.outputChatBox("/ban [id] [motiv] - Banează un jucător.");
    player.outputChatBox("/announce [text] - Trimite un anunț global.");
    player.outputChatBox("/kill [id] - omori un player.");
    player.outputChatBox("/o - mesaj global pe server.");
    // Adaugă aici ce alte comenzi ai
});

mp.events.addCommand("o", (player, fullText) => {
    // Verificare admin – modifică în funcție de sistemul tău
    if (!player.data.admin || player.data.admin < 1){

        return player.outputChatBox("Nu ai acces la această comandă.");
    }

    if (!fullText || fullText.trim().length === 0) {
        return player.outputChatBox("Folosește: /announce [mesaj]");
    }

    const message = `📢 [Anunț Admin] ${player.name}: ${fullText}`;
    mp.players.broadcast(message);
});


mp.events.addCommand('anno', (player, _, ...args) => {
    if (player.getVariable('admin_level') >= 2) { // Permite doar adminilor cu nivelul 2 sau mai mare
        const announcement = args.join(" "); // Concatenează toate argumentele într-un singur mesaj

        if (!announcement) {
            player.outputChatBox("❌ Folosește: /anno [mesaj]");
            return;
        }

        // Trimite mesajul către client
        mp.players.broadcast(`${player.name} a făcut un anunț: ${announcement}`);
        mp.players.forEach((p) => {
            p.call('displayAnnouncement', [announcement]); // Apelează funcția client-side
        });
    } else {
        player.outputChatBox("❌ Nu ai permisiunea necesară pentru a folosi această comandă.");
    }
});


// Încarcă scriptul client-side
mp.events.add('playerJoin', (player) => {
    player.call('displayAnnouncement', ['Bine ai venit pe RAGE.MP - ROSAMP!']);  // Trimiterea mesajului când un jucător se conectează
});



mp.events.add("playerChat", (player, text) => {
    // Trimite mesajul în formatul NumeJucător: mesaj către toți jucătorii
    mp.players.forEach((p) => {
        p.outputChatBox(`${player.name}: ${text}`);
    });
});




 
