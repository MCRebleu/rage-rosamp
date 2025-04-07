// NU ai nevoie de let loginBrowser
global.loginBrowser = null;

mp.events.add('client:showLoginUI', () => {
    if (!global.loginBrowser) {
        global.loginBrowser = mp.browsers.new("package://cef/auth/login.html");

        setTimeout(() => {
            global.loginBrowser.execute(`
                window.addEventListener("message", function(event) {
                    if (event.data.type === "loginData") {
                        mp.trigger("client:loginData", event.data.data.user, event.data.data.pass);
                    }
                    if (event.data.type === "registerData") {
                        mp.trigger("client:registerData", event.data.data.user, event.data.data.email, event.data.data.pass);
                    }
                });
            `);
        }, 500);
    }

    setTimeout(() => {
        mp.gui.cursor.show(true, true);
    }, 250);

    mp.gui.chat.show(false);
    mp.players.local.freezePosition(true);
    mp.game.ui.displayRadar(false);

    loginCam = mp.cameras.new('default', new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0), 40);
    mp.players.local.position = new mp.Vector3(-1757.12, -739.53, 10);

    loginCam.setActive(true);
    loginCam.setCoord(-1757.12, -739.53, 25);
    loginCam.pointAtCoord(-1764, -715, 35);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
});

mp.events.add('client:hideLoginUI', () => {
    if (global.loginBrowser) {
        global.loginBrowser.execute(`fadeOutLogin()`);
        setTimeout(() => {
            global.loginBrowser.destroy();
            global.loginBrowser = null;
        }, 750);

        setTimeout(() => {
    global.chatBrowser = mp.browsers.new("package://chat/chat.html");
}, 750);
    }

    mp.gui.cursor.show(false, false);
    mp.players.local.freezePosition(false);
    mp.game.ui.displayRadar(true);
    mp.gui.chat.show(false);

    if (loginCam) {
        loginCam.destroy();
        loginCam = null;
        mp.game.cam.renderScriptCams(false, false, 0, false, false);
    }
});
