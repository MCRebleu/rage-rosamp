require('./chat/chat.js');
require('./scripts/ui.js');
require('./scripts/events.js');

mp.events.add('playerReady', () => {
    mp.events.call('client:showLoginUI');
});