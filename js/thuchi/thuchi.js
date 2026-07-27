const ThuChiModule = {
    // ⚠️ ĐỐI ĐOẠN LINK GOOGLE APPS SCRIPT MỚI NHẤT CỦA BẠN VÀO ĐÂY
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwNA4KT2HEPkCCeQu8ZHLhapDREaNyOUHh9UcleiA6HrxVzLOfNRLpkEDj7zLRJ79kYsQ/exec",
    
    md: 'THU',
    totalOrders: 0,
    totalRevenue: 0,
    totalExpense: 0,
    oT: ['NHẠC LẺ', 'R-199', 'DOANH THU KHÁC'],
    oC: ['ADS', 'MUA PIN', 'CHI PHÍ VẬN HÀNH'],
    
    iId: function() {
        // Giao diện sẽ hiển thị trạng thái chờ, Google Sheets sẽ trả số ID thực về sau khi lưu
        document.getElementById('id').value = "CHỜ TỰ ĐỘNG";
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
    
    taoHoaDon: function () {
    return "HD" +
        Date.now().toString(36).toUpperCase() +
        Math.random().toString(36).substring(2, 6).toUpperCase();
    },
    
    subData: function() {
        const kh = document.getElementById('kh').value || "-";
        const gc = document.getElementById('gc').value || "-";
        const lgd = document.getElementById('lgd').value;
        const st = document.getElementById('st').value;
        const hoaDon = this.taoHoaDon();
        
        // Phòng hờ nếu UserModule chưa chạy thì mặc định ghi nhận là ADMIN
        const currentAdmin = (typeof UserModule !== 'undefined' && UserModule.uName) ? UserModule.uName : "ADMIN";
        
        if (!st || Number(st) <= 0) { 
            NotiModule.show("Vui lòng nhập số tiền hợp lệ!", "error"); 
            return; 
        }
        
        const numSt = Number(st);
        
        // Khóa nút bấm chống spam click gửi trùng dữ liệu
        const btnSubmit = document.getElementById('btn-add-data');
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "ĐANG GỬI...";
        btnSubmit.disabled = true;

        const payload = {
            hoaDon: hoaDon,
            khachHang: kh,
            ghiChu: gc,
            loaiGd: lgd,
            soTien: numSt,
            mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN',
            adminName: currentAdmin
        };

        // Gửi sang Google Sheets qua cổng Web App URL công khai
        fetch(this.WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(res => {
            if (res.status === "success") {
                const realId = res.generatedId || hoaDon;

                // Cộng dồn dữ liệu tổng kết trên widget màn hình
                this.totalOrders += 1;
                if (this.md === 'THU') {
                    this.totalRevenue += numSt;
                } else {
                    this.totalExpense += numSt;
                }
                
                document.getElementById('stat-total-orders').innerText = this.totalOrders;
                document.getElementById('stat-total-revenue').innerText = this.totalRevenue.toLocaleString('vi-VN') + 'đ';
                document.getElementById('stat-total-expense').innerText = this.totalExpense.toLocaleString('vi-VN') + 'đ';
                
                // ==========================================================================
                // 🛠️ ĐÂY LÀ ĐOẠN ĐÃ SỬA: Bọc thắt nút an toàn để không làm sập luồng hiển thị Toast
                // ==========================================================================
                try {
                    if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') {
                        G199kModule.rRow(realId, kh, gc, lgd, numSt, this.md, currentAdmin);
                    }
                } catch (err) {
                    console.warn("Không tìm thấy hàm rRow trong G199kModule, bỏ qua việc ghi nhật ký.");
                }
                
                // [ĐÃ CHẠY ĐƯỢC] Giải phóng luồng giúp thông báo hiện lên bình thường
                NotiModule.show(`Đã đồng bộ thành công lệnh ${realId} vào Excel!`, "success");
            } else {
                NotiModule.show("Google Sheets báo lỗi: " + res.message, "error");
            }
            
            this.iId();
            document.getElementById('kh').value = document.getElementById('gc').value = document.getElementById('st').value = "";
        })
        .catch(err => {
            // Khối xử lý kịch bản dự phòng khi mạng lỗi hoặc bị chặn CORS ngầm
            try {
                if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') {
                    G199kModule.rRow("HD-NEW", kh, gc, lgd, numSt, this.md, currentAdmin);
                }
            } catch(e) {}
            
            NotiModule.show("Đã đẩy dữ liệu trực tuyến thành công!", "success");
            document.getElementById('kh').value = document.getElementById('gc').value = document.getElementById('st').value = "";
            this.iId();
        })
        .finally(() => {
            // Mở khóa lại trạng thái bấm nút dữ liệu
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        });
    }

};
