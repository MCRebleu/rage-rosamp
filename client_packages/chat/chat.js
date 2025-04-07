global.chatBrowser = null;

mp.events.add("chatMessage", (msg) => {
    mp.events.callRemote("serverChatMessage", msg);
});

mp.events.add("pushToChat", (msg) => {
    if (global.chatBrowser) {
        const safe = JSON.stringify({ type: "push", message: msg });
        global.chatBrowser.execute(`window.postMessage(${safe}, "*");`);
    }
});

mp.events.add("toggleChat", (state) => {
    if (global.chatBrowser) {
        const safe = JSON.stringify({ type: "toggle", state });
        global.chatBrowser.execute(`window.postMessage(${safe}, "*");`);
        mp.gui.cursor.show(state, state);
        mp.gui.chat.show(false);
    }
});

mp.keys.bind(0x54, true, function () {
    if (global.chatBrowser) mp.events.call("toggleChat", true);
});

mp.events.add("render", () => {
    if (mp.gui.chat.enabled) {
        mp.gui.chat.show(false);
    }
});
