// client_packages/login.js

let loginBrowser = null;

mp.events.add("client:showLoginUI", () => {
    if (loginBrowser !== null) return;

    loginBrowser = mp.browsers.new("package://cef/auth/login.html");

    mp.gui.cursor.show(true, true);
    mp.gui.chat.activate(false);

    mp.console.logInfo("🧠 Login UI deschis");
});

mp.events.add("client:closeLoginUI", () => {
    if (loginBrowser) {
        loginBrowser.destroy();
        loginBrowser = null;
    }

    mp.gui.cursor.show(false, false);
    mp.gui.chat.activate(true);

    mp.console.logInfo("👋 Login UI închis");
});

// Răspunsuri primite de la server pentru login/register
mp.events.add("client:loginHandler", (status) => {
    if (!loginBrowser) return;

    loginBrowser.execute(`handleAuthResponse('${status}')`);

    if (status === "success") {
        setTimeout(() => {
            mp.events.call("client:closeLoginUI");
        }, 1000); // efect de fadeOut
    }
});

// Preluare date din UI (din CEF, prin window.postMessage)
window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || !data.type || !data.data) return;

    const { user, pass, email } = data.data;

    switch (data.type) {
        case "loginData":
            if (user && pass) {
                mp.trigger("server:loginAccount", user, pass);
            }
            break;

        case "registerData":
            if (user && email && pass) {
                mp.trigger("server:registerAccount", user, email, pass);
            }
            break;

        default:
            mp.console.logInfo("📨 Tip necunoscut primit din UI: " + data.type);
            break;
    }
});
