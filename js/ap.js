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

// ==========================================================================
// TỰ ĐỘNG KHỞI CHẠY EMOJI CHO MỌI GIAO DIỆN ĐỘNG (DÁN VÀO CUỐI APP.JS)
// ==========================================================================
if (typeof renderEmojis === 'function') {
    const emojiObserver = new MutationObserver((mutations) => {
        // Kiểm tra xem trên trang có xuất hiện thẻ data-emoji chưa được render hay không
        const hasNewEmoji = document.querySelector('[data-emoji]:not(.ui-emoji-container)');
        if (hasNewEmoji) {
            renderEmojis();
        }
    });

    // Cấu hình camera giám sát toàn bộ sự thay đổi của các thẻ HTML trên trang web
    emojiObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}


const IdHoaDonModule = {
    sinhMaDuyNhat() {
        // 1. Lấy số đảo ngược thời gian (số càng lớn đơn càng cũ, số nhỏ đơn càng mới)
        const soDaoNguoc = 9999999999999 - Date.now();
        
        // 2. Chuyển dãy số này thành chuỗi chữ cái bằng hệ cơ số 36
        // Số đảo ngược nhỏ đi (theo thời gian) sẽ sinh ra chữ cái đứng trước trong bảng (A->Z)
        const chuoiFirebase = soDaoNguoc.toString(36).toUpperCase();
        
        // 3. Chuỗi ngẫu nhiên 3 ký tự chống trùng đơn
        const randomShort = Math.random().toString(36).slice(2, 5).toUpperCase();
        
        // Trả về kết quả: Chữ HD đứng đầu, tiếp theo là chuỗi sắp xếp và chuỗi ngẫu nhiên
        return `HD${chuoiFirebase}${randomShort}`;
    }
};
