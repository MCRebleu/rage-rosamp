console.log("🚨 login.js EXECUTAT");
console.log("🎉 Login JS încărcat!");


// Schimbare taburi
function switchTab(tab, event = null) {
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${tab}-form`).classList.add('active');

    if (event) {
        event.target.classList.add('active');
    }
}


// Trimitere date spre client-side RageMP
function sendAccountInfo(state) {
    if (state === 0) {
        const user = document.getElementById('loginName').value.trim();
        const pass = document.getElementById('loginPass').value.trim();
        const error = document.getElementById('loginError');

        error.innerText = '';

        if (user.length < 3 || pass.length < 3) {
            error.innerText = 'Username sau parola prea scurtă';
            return;
        }

        // Trimite datele printr-un mesaj către client-side RageMP
        window.postMessage({
            type: "loginData",
            data: { user, pass }
        });
    } else {
        const user = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const pass = document.getElementById('registerPass').value.trim();
        const pass2 = document.getElementById('registerPass2').value.trim();
        const error = document.getElementById('registerError');

        error.innerText = '';

        if (user.length < 3 || pass.length < 5 || !email.includes('@')) {
            error.innerText = 'Date incorecte sau incomplete';
            return;
        }

        if (pass !== pass2) {
            error.innerText = 'Parolele nu se potrivesc';
            return;
        }

        // Trimite datele printr-un mesaj către client-side RageMP
        window.postMessage({
            type: "registerData",
            data: { user, email, pass }
        });
    }
}

// Funcție apelată din client la succes login (cu delay)
function fadeOutLogin() {
    const card = document.querySelector('.container');
    const whoosh = document.getElementById('whoosh');
    if (whoosh) whoosh.play();

    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';

    setTimeout(() => {
        document.body.style.display = 'none';
    }, 700);
}

console.log("🔧 Login UI Loaded cu succes!");
