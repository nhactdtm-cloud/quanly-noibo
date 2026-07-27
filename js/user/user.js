const UserModule = {
    uName: 'ADMIN',

    // 1. Logic Đăng nhập (Đọc file JSON)
    handleLogin: async function() {
        const uInput = document.getElementById('un').value.trim();
        const pInput = document.getElementById('pw').value.trim();

        if (!uInput || !pInput) {
            NotiModule.show("Vui lòng điền đầy đủ tài khoản và mật khẩu!", "error");
            return;
        }

        try {
            const response = await fetch('data/user.json');
            if (!response.ok) {
                throw new Error("Không thể kết nối đến file dữ liệu tài khoản!");
            }
            
            const data = await response.json();
            const userList = data.users;

            const matchedUser = userList.find(user => 
                user.username.toLowerCase() === uInput.toLowerCase() && 
                user.password === pInput
            );

            if (matchedUser) {
                this.uName = matchedUser.username.toUpperCase();
                
                // Hiển thị tên tài khoản lên giao diện chính
                document.getElementById('usr-disp').innerText = `👤 Tài khoản: ${this.uName}`;
                
                // Mở khóa màn hình ứng dụng
                document.getElementById('lg-sc').style.display = 'none';
                document.getElementById('ap').classList.add('auth');
                
                // Khởi tạo luồng Thu Chi
                ThuChiModule.iId();
                ThuChiModule.sm('THU');
                
                NotiModule.show(`Chào mừng ${this.uName} quay trở lại hệ thống!`, "success");
            } else {
                NotiModule.show("Mật khẩu hoặc tài khoản không chính xác!", "error");
            }

        } catch (error) {
            NotiModule.show("Lỗi hệ thống: " + error.message, "error");
        }
    },

    // 2. Logic Đăng xuất (Đẩy từ ap.js về đây)
    handleLogout: function() {
        // Xóa mật khẩu cũ trong ô nhập liệu để bảo mật
        document.getElementById('pw').value = '';
        
        // Ẩn ứng dụng chính và hiện lại màn hình khóa đăng nhập
        document.getElementById('ap').classList.remove('auth');
        document.getElementById('lg-sc').style.display = 'flex';
        
        // Gọi hàm chuyển tab về mặc định "THU CHI" (nằm bên file ap.js)
        if (typeof st === 'function') {
            st('t');
        }
        
        NotiModule.show("Đã đăng xuất tài khoản an toàn!", "info");
    }
};
