const UserModule = {
    uName: 'ADMIN',

    // Hàm kiểm tra trạng thái khi vừa tải trang (Gọi hàm này khi ứng dụng vừa chạy)
    checkLoginStatus: function() {
        const savedUser = localStorage.getItem('loggedUser');
        if (savedUser) {
            this.uName = savedUser;
            this.applyLoginUI();
        }
    },

    // Hàm phụ trợ để áp dụng giao diện đã đăng nhập
    applyLoginUI: function() {
        document.getElementById('usr-disp').innerText = `👤 Tài khoản: ${this.uName}`;
        document.getElementById('lg-sc').style.display = 'none';
        document.getElementById('ap').classList.add('auth');
        
        if (typeof ThuChiModule !== 'undefined') {
            ThuChiModule.iId();
            ThuChiModule.sm('THU');
        }
    },

    // 1. Logic Đăng nhập
    handleLogin: async function() {
        const uInput = document.getElementById('un').value.trim();
        const pInput = document.getElementById('pw').value.trim();

        if (!uInput || !pInput) {
            NotiModule.show("Vui lòng điền đầy đủ tài khoản và mật khẩu!", "error");
            return;
        }

        try {
            const response = await fetch('data/user.json');
            if (!response.ok) throw new Error("Không thể kết nối đến file dữ liệu!");
            
            const data = await response.json();
            const matchedUser = data.users.find(user => 
                user.username.toLowerCase() === uInput.toLowerCase() && 
                user.password === pInput
            );

            if (matchedUser) {
                this.uName = matchedUser.username.toUpperCase();
                
                // LƯU TRẠNG THÁI VÀO LOCALSTORAGE
                localStorage.setItem('loggedUser', this.uName);
                
                this.applyLoginUI();
                NotiModule.show(`Chào mừng ${this.uName} quay trở lại!`, "success");
            } else {
                NotiModule.show("Mật khẩu hoặc tài khoản không chính xác!", "error");
            }
        } catch (error) {
            NotiModule.show("Lỗi hệ thống: " + error.message, "error");
        }
    },

    // 2. Logic Đăng xuất
    handleLogout: function() {
        // XÓA TRẠNG THÁI TRONG LOCALSTORAGE
        localStorage.removeItem('loggedUser');

        document.getElementById('pw').value = '';
        document.getElementById('ap').classList.remove('auth');
        document.getElementById('lg-sc').style.display = 'flex';
        
        if (typeof st === 'function') st('t');
        NotiModule.show("Đã đăng xuất tài khoản an toàn!", "info");
    }
};
