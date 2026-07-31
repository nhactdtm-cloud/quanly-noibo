// js/user/user.js
const UserModule = {
    uName: 'ADMIN',
    uRole: 'STAFF', // Biến lưu trữ quyền hiện tại (Mặc định là STAFF)

    // Hàm kiểm tra trạng thái khi vừa tải trang
    checkLoginStatus: function() {
        const savedUser = localStorage.getItem('loggedUser');
        const savedRole = localStorage.getItem('loggedRole'); // Lấy quyền đã lưu
        
        if (savedUser && savedRole) {
            this.uName = savedUser;
            this.uRole = savedRole;
            this.applyLoginUI();
        }
    },

    // Hàm phụ trợ để áp dụng giao diện đã đăng nhập
    applyLoginUI: function() {
        // Cập nhật tên tài khoản và vai trò lên thanh header để dễ quản lý
        document.getElementById('usr-disp').innerHTML = 
            `<span data-icon="user"></span> Tài khoản: ${this.uName} <span class="role-badge role-${this.uRole.toLowerCase()}">[${this.uRole}]</span>`;
        
        document.getElementById('lg-sc').style.display = 'none';
        document.getElementById('ap').classList.add('auth');
        
        // KÍCH HOẠT HÀM PHÂN QUYỀN GIAO DIỆN MỚI
        this.applyRoleRestrictions();

        // Gọi hàm quét và hiển thị icon ngay sau khi đổi giao diện
        if (typeof renderIcons === 'function') {
            renderIcons();
        }
        
        // Khi đăng nhập thành công, kích hoạt tải lại dữ liệu chuẩn của tài khoản này
        if (typeof ThuChiModule !== 'undefined') {
            ThuChiModule.iId();
            ThuChiModule.sm('THU');
            ThuChiModule.taiHoatDongHomNay(); 
        }
    },

    // ==========================================================================
    // SỬA ĐỔI: HÀM PHÂN QUYỀN GIAO DIỆN CHO PHÉP STAFF XEM BÁO CÁO CÁ NHÂN
    // ==========================================================================
    applyRoleRestrictions: function() {
        const optCancel = document.getElementById("opt-cancel"); // Option Hủy đăng ký ở phần 2
        const statRevenue = document.getElementById("stat-total-revenue"); // Doanh thu phần 1
        const statExpense = document.getElementById("stat-total-expense"); // Chi phí phần 1

        // 1. Khôi phục nhãn giao diện chuẩn mặc định (Dành cho MASTER / MANAGER xem toàn hệ thống)
        if (statRevenue) {
            const card = statRevenue.closest('.stat-card');
            if (card) {
                card.style.display = "flex";
                const label = card.querySelector('.stat-label');
                if (label) label.innerText = "Tổng doanh thu";
            }
        }
        if (statExpense) {
            const card = statExpense.closest('.stat-card');
            if (card) {
                card.style.display = "flex";
                const label = card.querySelector('.stat-label');
                if (label) label.innerText = "Tổng chi phí phát sinh";
            }
        }
        if (optCancel) {
            optCancel.disabled = false;
        }

        // 2. Áp dụng luật phân quyền lọc nhãn dựa trên vai trò tài khoản
        if (this.uRole === 'STAFF') {
            // Không dùng style.display = "none" để ẩn nữa, giữ lại card nhưng đổi tên nhãn hiển thị
            if (statRevenue) {
                const card = statRevenue.closest('.stat-card');
                if (card) {
                    const label = card.querySelector('.stat-label');
                    if (label) label.innerText = "Doanh thu của bạn";
                }
            }
            if (statExpense) {
                const card = statExpense.closest('.stat-card');
                if (card) {
                    const label = card.querySelector('.stat-label');
                    if (label) label.innerText = "Chi phí của bạn";
                }
            }
            
            // Nhân viên vẫn bị cấm chọn tính năng hủy đăng ký khách hàng ở trang R-199K
            if (optCancel) optCancel.disabled = true;
        } 
        else if (this.uRole === 'MANAGER') {
            // Quản lý xem báo cáo toàn hệ thống nhưng vẫn bị cấm tính năng hủy đăng ký khách hàng
            if (optCancel) optCancel.disabled = true;
        }
        else if (this.uRole === 'MASTER') {
            // MASTER giữ đầy đủ mọi tính năng mặc định ban đầu
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
                this.uRole = matchedUser.role.toUpperCase(); // Lấy chính xác ROLE từ json (MASTER/MANAGER/STAFF)
                
                // LƯU TRẠNG THÁI VÀO LOCALSTORAGE
                localStorage.setItem('loggedUser', this.uName);
                localStorage.setItem('loggedRole', this.uRole); // Lưu role để duy trì khi F5 trang
                
                this.applyLoginUI();
                NotiModule.show(`Chào mừng ${this.uName} (${this.uRole}) quay trở lại!`, "success");
            } else {
                NotiModule.show("Mật khẩu hoặc tài khoản không chính xác!", "error");
            }
        } catch (error) {
            NotiModule.show("Lỗi hệ thống: " + error.message, "error");
        }
    },

    // 2. Logic Đăng xuất
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

        // XÓA SẠCH BỘ NHỚ ĐỆM THÀNH VIÊN VÀ RAM CACHE LỊCH SỬ GIA HẠN
        localStorage.removeItem('r199k_members_cache');
        localStorage.removeItem('r199k_members_cache_time');
        if (typeof RenewalModule !== 'undefined') {
            RenewalModule.lichSuCache = {}; 
        }

        // 2.2. LÀM TRỐNG BẢNG GIAO DỊCH CHÍNH TRÊN MÀN HÌNH (NẾU CÓ)
        if (document.getElementById('bảng-giao-dịch')) {
            document.getElementById('bảng-giao-dịch').innerHTML = '';
        }

        // 2.3. XÓA SẠCH KEY ĐĂNG NHẬP TRONG LOCALSTORAGE
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('loggedRole'); // Xóa role khi logout
        
        this.uName = 'ADMIN';
        this.uRole = 'STAFF'; // Đề phòng lỗi, đưa về quyền thấp nhất khi logout

        // 2.4. KHÔI PHỤC GIAO DIỆN MÀN HÌNH ĐĂNG NHẬP GỐC
        document.getElementById('pw').value = '';
        document.getElementById('un').value = ''; 
        document.getElementById('ap').classList.remove('auth');
        document.getElementById('lg-sc').style.display = 'flex';
        
        if (typeof st === 'function') st('t');
        NotiModule.show("Đã đăng xuất tài khoản và làm sạch dữ liệu!", "info");
    }
};
