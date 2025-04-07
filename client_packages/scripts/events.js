mp.events.add('client:loginData', (username, password) => {
    mp.events.callRemote("server:loginAccount", username, password);
});

mp.events.add('client:registerData', (username, email, password) => {
    mp.events.callRemote("server:registerAccount", username, email, password);
});

mp.events.add('client:loginHandler', (result) => {
    switch (result) {
        case 'success':
        case 'registered':
            mp.events.call('client:hideLoginUI');
            setTimeout(() => {
            mp.events.call('createChat');
            }, 800); // un mic delay să nu se bată cu fadeOutLogin
            break;

        case 'incorrectinfo':
            sendCEFError('login', 'Username sau parolă greșită');
            break;
        case 'takeninfo':
            sendCEFError('register', 'Username sau email deja folosit');
            break;
        case 'tooshort':
            sendCEFError('register', 'Username sau parola prea scurtă');
            break;
        case 'logged':
            sendCEFError('login', 'Contul este deja conectat');
            break;
        case 'invalid-info':
            sendCEFError('register', 'Informații invalide');
            break;
        case 'banned':
            sendCEFError('login', 'Contul este banat');
            break;
    }
});

function sendCEFError(form, message) {
    const js = form === 'login'
        ? `document.getElementById('loginError').innerText = '${message}';`
        : `document.getElementById('registerError').innerText = '${message}';`;

    if (global.loginBrowser) global.loginBrowser.execute(js);
}

