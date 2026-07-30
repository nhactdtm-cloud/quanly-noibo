function st(t) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.m-btn').forEach(b => b.classList.remove('active'));
    if (t == 'g') {
        document.getElementById('p-g').classList.add('active');
        document.getElementById('btn-g').classList.add('active');
    } else {
        document.getElementById('p-t').classList.add('active');
        document.getElementById('btn-t').classList.add('active');
    }
}

window.addEventListener('DOMContentLoaded', () => {

    if (typeof UserModule !== 'undefined' && typeof UserModule.checkLoginStatus === 'function') {
        UserModule.checkLoginStatus();
    }

    document.getElementById('btn-login-submit').addEventListener('click', () => UserModule.handleLogin());
    document.getElementById('btn-logout').addEventListener('click', () => UserModule.handleLogout());
    
    document.getElementById('btn-g').addEventListener('click', () => st('g'));
    document.getElementById('btn-t').addEventListener('click', () => st('t'));
    document.getElementById('s-thu').addEventListener('click', () => ThuChiModule.sm('THU'));
    document.getElementById('s-chi').addEventListener('click', () => ThuChiModule.sm('CHI'));
    document.getElementById('btn-add-data').addEventListener('click', () => ThuChiModule.subData());
});
