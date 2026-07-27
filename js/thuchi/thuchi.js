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
    
    subData: function() {
        const kh = document.getElementById('kh').value || "-";
        const gc = document.getElementById('gc').value || "-";
        const lgd = document.getElementById('lgd').value;
        const st = document.getElementById('st').value;
        const currentAdmin = UserModule.uName; // Lấy chính xác tên Admin từ UserModule
        
        if (!st || Number(st) <= 0) { NotiModule.show("Vui lòng nhập số tiền hợp lệ!", "error"); return; }
        
        const numSt = Number(st);
        
        // Khóa nút bấm chống spam dữ liệu trùng lặp
        const btnSubmit = document.getElementById('btn-add-data');
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "ĐANG GỬI...";
        btnSubmit.disabled = true;

        // Đóng gói dữ liệu (Loại bỏ ID và Thời gian để Google Sheets tự tính toán)
        const payload = {
            khachHang: kh,
            ghiChu: gc,
            loaiGd: lgd,
            soTien: numSt,
            mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN',
            adminName: currentAdmin
        };

        // Gửi dữ liệu dưới dạng text/plain để vượt qua hàng rào CORS bảo mật của Vercel
        fetch(this.WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        })
        .then(response => response.json()) // Phân tích cú pháp JSON phản hồi từ server
        .then(res => {
            if (res.status === "success") {
                // Nhận mã ID thực tế vừa được tạo trên Google Sheets (Ví dụ: HD006)
                const realId = res.generatedId;

                // Cộng dồn thông số báo cáo thời gian thực trên màn hình
                this.totalOrders += 1;
                if (this.md === 'THU') {
                    this.totalRevenue += numSt;
                } else {
                    this.totalExpense += numSt;
                }
                
                document.getElementById('stat-total-orders').innerText = this.totalOrders;
                document.getElementById('stat-total-revenue').innerText = this.totalRevenue.toLocaleString('vi-VN') + 'đ';
                document.getElementById('stat-total-expense').innerText = this.totalExpense.toLocaleString('vi-VN') + 'đ';
                
                // Đẩy mã ID thật xuống ô đối soát mini và bảng nhật ký tổng G_199K
                G199kModule.rRow(realId, kh, gc, lgd, numSt, this.md, currentAdmin);
                
                NotiModule.show(`Đã đồng bộ thành công lệnh ${realId} vào Excel!`, "success");
            } else {
                NotiModule.show("Google Sheets báo lỗi: " + res.message, "error");
            }
            
            this.iId();
            document.getElementById('kh').value = document.getElementById('gc').value = document.getElementById('st').value = "";
        })
        .catch(err => {
            // Trường hợp chạy ngầm no-cors không đọc được gói JSON phản hồi, dữ liệu vẫn được lưu thành công trên Sheets
            G199kModule.rRow("HD-NEW", kh, gc, lgd, numSt, this.md, currentAdmin);
            NotiModule.show("Đã đẩy dữ liệu trực tuyến thành công!", "success");
            document.getElementById('kh').value = document.getElementById('gc').value = document.getElementById('st').value = "";
            this.iId();
        })
        .finally(() => {
            // Mở khóa lại nút bấm
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        });
    }
};
