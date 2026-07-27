const ThuChiModule = {
    // ⚠️ ĐỔI ĐOẠN LINK DƯỚI ĐÂY THÀNH ĐOẠN LINK GOOGLE APPS SCRIPT CỦA BẠN
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzA1H6fx4C9aX-ZwgUxyfEGitbWLeX_Vx_wiM8odVhTK_QGlYdWsIV8-E2eBuZX3BNXaA/exec",
    
    ct: 1, 
    md: 'THU',
    totalOrders: 0,
    totalRevenue: 0,
    totalExpense: 0,
    oT: ['NHẠC LẺ', 'R-199', 'DOANH THU KHÁC'],
    oC: ['ADS', 'MUA PIN', 'CHI PHÍ VẬN HÀNH'],
    
    iId: function() {
        document.getElementById('id').value = "HD" + String(this.ct).padStart(3, '0');
    },
    
    sm: function(m) {
        this.md = m;
        const bT = document.getElementById('s-thu'), bC = document.getElementById('s-chi'), sel = document.getElementById('lgd');
        bT.className = bC.className = 'seg-btn'; sel.innerHTML = '';
        if (m === 'THU') {
            bT.classList.add('active', 'thu');
            this.oT.forEach(o => sel.add(new Option(o, o)));
        } else {
            bC.classList.add('active', 'chi');
            this.oC.forEach(o => sel.add(new Option(o, o)));
        }
    },
    
    subData: function() {
        const id = document.getElementById('id').value;
        const kh = document.getElementById('kh').value || "-";
        const gc = document.getElementById('gc').value || "-";
        const lgd = document.getElementById('lgd').value;
        const st = document.getElementById('st').value;
        const currentAdmin = UserModule.uName; // Lấy tên Admin đang đăng nhập hiện tại
        
        if (!st || Number(st) <= 0) { NotiModule.show("Vui lòng nhập số tiền hợp lệ!", "error"); return; }
        
        const numSt = Number(st);
        
        // Đổi trạng thái nút bấm thành đang tải để nhân viên không bấm spam liên tục
        const btnSubmit = document.getElementById('btn-add-data');
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "ĐANG GỬI...";
        btnSubmit.disabled = true;

        // Đóng gói dữ liệu thành gói JSON để chuẩn bị bắn sang Google Sheets
        const payload = {
            id: id,
            khachHang: kh,
            ghiChu: gc,
            loaiGd: lgd,
            soTien: numSt,
            mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN',
            adminName: currentAdmin
        };

        // Thực hiện gửi dữ liệu ngầm (API Fetch POST) sang Google Sheets
        fetch(this.WEB_APP_URL, {
            method: "POST",
            mode: "no-cors", // Bật chế độ không chặn tên miền chéo
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(() => {
            // Sau khi gửi lên Sheets thành công -> Tiến hành cộng dồn số liệu trên giao diện
            this.totalOrders += 1;
            if (this.md === 'THU') {
                this.totalRevenue += numSt;
            } else {
                this.totalExpense += numSt;
            }
            
            // Cập nhật số liệu hiển thị thời gian thực lên Dashboard
            document.getElementById('stat-total-orders').innerText = this.totalOrders;
            document.getElementById('stat-total-revenue').innerText = this.totalRevenue.toLocaleString('vi-VN') + 'đ';
            document.getElementById('stat-total-expense').innerText = this.totalExpense.toLocaleString('vi-VN') + 'đ';
            
            // Hiển thị dòng nhật ký xuống danh sách đối soát
            G199kModule.rRow(id, kh, gc, lgd, numSt, this.md, currentAdmin);
            
            NotiModule.show(`Đã đồng bộ thành công lệnh ${id} vào Sheet của ADMIN: ${currentAdmin}!`, "success");
            
            this.ct++; 
            this.iId();
            document.getElementById('kh').value = document.getElementById('gc').value = document.getElementById('st').value = "";
        })
        .catch(err => {
            NotiModule.show("Lỗi kết nối mạng, không thể gửi lên Google Sheets!", "error");
            console.error(err);
        })
        .finally(() => {
            // Trả lại trạng thái nút bấm ban đầu cho nhân viên nhập đơn tiếp theo
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        });
    }
};
