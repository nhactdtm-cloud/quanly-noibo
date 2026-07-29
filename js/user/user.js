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
        
        // Khi đăng nhập thành công, kích hoạt tải lại dữ liệu chuẩn của tài khoản này
        if (typeof ThuChiModule !== 'undefined') {
            ThuChiModule.iId();
            ThuChiModule.sm('THU');
            ThuChiModule.taiHoatDongHomNay(); // Tải đúng dữ liệu theo tài khoản mới
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

    // 2. Logic Đăng xuất (ĐÃ ĐƯỢC FIX LÀM SẠCH HOÀN TOÀN)
    handleLogout: function() {
        // 2.1. XÓA SẠCH DỮ LIỆU SỐ TIỀN VÀ MẢNG CACHE TRONG THUCHIMODULE
        if (typeof ThuChiModule !== 'undefined') {
            ThuChiModule.totalOrders = 0;
            ThuChiModule.totalRevenue = 0;
            ThuChiModule.totalExpense = 0;
            ThuChiModule.duLieuGiaoDichHomNay = [];
            ThuChiModule.uSt(); 
            ThuChiModule.capNhatKhoiDoiSoat([]); 
        }

        // ==========================================================================
        // ĐÃ THÊM: XÓA SẠCH BỘ NHỚ ĐỆM THÀNH VIÊN VÀ RAM CACHE LỊCH SỬ GIA HẠN
        // ==========================================================================
        localStorage.removeItem('r199k_members_cache');
        localStorage.removeItem('r199k_members_cache_time');
        if (typeof RenewalModule !== 'undefined') {
            RenewalModule.lichSuCache = {}; // Xóa sạch RAM cache lịch sử gia hạn của tài khoản cũ
        }

        // 2.2. LÀM TRỐNG BẢNG GIAO DỊCH CHÍNH TRÊN MÀN HÌNH (NẾU CÓ)
        if (document.getElementById('bảng-giao-dịch')) {
            document.getElementById('bảng-giao-dịch').innerHTML = '';
        }

        // 2.3. XÓA SẠCH KEY ĐĂNG NHẬP TRONG LOCALSTORAGE
        localStorage.removeItem('loggedUser');
        this.uName = 'ADMIN';

        // 2.4. KHÔI PHỤC GIAO DIỆN MÀN HÌNH ĐĂNG NHẬP GỐC
        document.getElementById('pw').value = '';
        document.getElementById('un').value = ''; 
        document.getElementById('ap').classList.remove('auth');
        document.getElementById('lg-sc').style.display = 'flex';
        
        if (typeof st === 'function') st('t');
        NotiModule.show("Đã đăng xuất tài khoản và làm sạch dữ liệu!", "info");
    }

};
