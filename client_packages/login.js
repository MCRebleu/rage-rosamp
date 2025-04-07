let loginBrowser = null;

mp.events.add("client:showLoginUI", () => {
    if (loginBrowser) return;
    mp.console.logInfo("🧠 EVENIMENTUL A AJUNS LA CLIENT!");
    loginBrowser = mp.browsers.new("package://cef/auth/login.html");
    mp.gui.cursor.show(true, true);
    mp.gui.chat.activate(false);

    mp.console.logInfo("✅ Login UI deschis.");
});

mp.events.add("client:closeLoginUI", () => {
    if (loginBrowser) {
        loginBrowser.destroy();
        loginBrowser = null;
        mp.gui.cursor.show(false, false);
        mp.gui.chat.activate(true);
    }
});
