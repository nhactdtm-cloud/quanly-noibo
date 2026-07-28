const ThuChiModule = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwNA4KT2HEPkCCeQu8ZHLhapDREaNyOUHh9UcleiA6HrxVzLOfNRLpkEDj7zLRJ79kYsQ/exec",
    md: 'THU', totalOrders: 0, totalRevenue: 0, totalExpense: 0,
    oT: ['NHẠC LẺ', 'R-199', 'DOANH THU KHÁC'], oC: ['ADS', 'MUA PIN', 'CHI PHÍ VẬN HÀNH'], isSyncing: false, 
    
    init() { this.iId(); this.taiHoatDongHomNay(); setInterval(() => this.processQueue(), 5000); },

    taiHoatDongHomNay() {
        const admin = (typeof UserModule !== 'undefined' && UserModule.uName) ? UserModule.uName : "ADMIN";
        fetch(`${this.WEB_APP_URL}?adminName=${encodeURIComponent(admin)}`).then(r => r.json()).then(res => {
            if (res.status !== "success" || !res.data) return;
            this.totalOrders = 0; this.totalRevenue = 0; this.totalExpense = 0;
            this.capNhatKhoiDoiSoat(res.data);
            
            // Xóa sạch dòng cũ trên bảng HTML trước khi vẽ lại để tránh bị nhân đôi dữ liệu [1]
            if (typeof G199kModule !== 'undefined' && document.getElementById('bảng-giao-dịch')) { document.getElementById('bảng-giao-dịch').innerHTML = ''; }

            res.data.forEach(item => {
                this.totalOrders++;
                const mode = item.mode === 'THU TIỀN' ? 'THU' : 'CHI';
                mode === 'THU' ? this.totalRevenue += item.soTien : this.totalExpense += item.soTien;
                try { if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') G199kModule.rRow(item.hoaDon, item.khachHang, item.ghiChu, item.loaiGd, item.soTien, mode, admin); } catch (e) {}
            });
            this.uSt();
        });
    },

    capNhatKhoiDoiSoat(arr) {
        const box = document.getElementById('mini-rows'); if (!box) return;
        box.innerHTML = [...arr].reverse().map(i => {
            const isThu = i.mode === 'THU TIỀN';
            return `<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0;border-bottom:1px dashed #eee;">
                <span style="font-weight:bold;color:#333;">📌 ${i.hoaDon}</span>
                <span style="color:${isThu?'green':'red'};font-weight:bold;">${isThu?'+':'-'}${i.soTien.toLocaleString('vi-VN')}đ</span>
            </div>`;
        }).join('') || '<div style="color:#888;font-size:12px;">Chưa có dữ liệu.</div>';
    },

    uSt() {
        if(document.getElementById('stat-total-orders')) document.getElementById('stat-total-orders').innerText = this.totalOrders;
        if(document.getElementById('stat-total-revenue')) document.getElementById('stat-total-revenue').innerText = this.totalRevenue.toLocaleString('vi-VN') + 'đ';
        if(document.getElementById('stat-total-expense')) document.getElementById('stat-total-expense').innerText = this.totalExpense.toLocaleString('vi-VN') + 'đ';
    },

    iId() { document.getElementById('id').value = "CHỜ TỰ ĐỘNG"; },
    
    sm(m) {
        this.md = m; const bT = document.getElementById('s-thu'), bC = document.getElementById('s-chi'), sel = document.getElementById('lgd');
        bT.className = bC.className = 'seg-btn'; sel.innerHTML = '';
        m === 'THU' ? (bT.classList.add('active', 'thu'), this.oT.forEach(o => sel.add(new Option(o, o)))) : (bC.classList.add('active', 'chi'), this.oC.forEach(o => sel.add(new Option(o, o))));
    },
    
    taoHoaDon() { return "HD" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase(); },
    
    subData() {
        const kh = document.getElementById('kh').value || "-", gc = document.getElementById('gc').value || "-", lgd = document.getElementById('lgd').value, st = document.getElementById('st').value;
        if (!st || Number(st) <= 0) return NotiModule.show("Vui lòng nhập số tiền hợp lệ!", "error");
        
        const numSt = Number(st), hoaDon = this.taoHoaDon(), admin = (typeof UserModule !== 'undefined' && UserModule.uName) ? UserModule.uName : "ADMIN";
        
        // Hiển thị trực tiếp tạm thời lên giao diện web để tạo cảm giác mượt mà [1]
        this.totalOrders++; this.md === 'THU' ? this.totalRevenue += numSt : this.totalExpense += numSt; this.uSt();
        try { if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') G199kModule.rRow(hoaDon, kh, gc, lgd, numSt, this.md, admin); } catch (e) {}
        
        NotiModule.show(`Đã lưu đơn ${hoaDon}! Đang đồng bộ...`, "success");
        document.getElementById('kh').value = document.getElementById('gc').value = document.getElementById('st').value = ""; this.iId();

        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || [];
        queue.push({ hoaDon, khachHang: kh, ghiChu: gc, loaiGd: lgd, soTien: numSt, mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN', adminName: admin });
        localStorage.setItem('thuchi_queue', JSON.stringify(queue));
        
        // Không gọi cập nhật trực tiếp tại đây để tránh tạo ra dòng trùng lặp khi chưa sync xong [1]
        this.processQueue(); 
    },

    processQueue() {
        if (this.isSyncing) return;
        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || []; if (queue.length === 0) return;
        
        this.isSyncing = true; 
        const currentItem = queue[0]; // FIX LỖI: Lấy chính xác phần tử đầu tiên thay vì lấy cả mảng [1]

        fetch(this.WEB_APP_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(currentItem) })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(res => {
            if (res && res.status === "success") {
                let uQ = JSON.parse(localStorage.getItem('thuchi_queue')) || []; uQ.shift();
                localStorage.setItem('thuchi_queue', JSON.stringify(uQ)); 
                this.taiHoatDongHomNay(); // Sync thành công lên Sheets mới cho tải lại dữ liệu thực tế [1]
            }
        }).catch(() => console.warn(`Đơn ${currentItem.hoaDon} đợi mạng.`))
        .finally(() => {
            this.isSyncing = false;
            if ((JSON.parse(localStorage.getItem('thuchi_queue')) || []).length > 0) setTimeout(() => this.processQueue(), 500);
        });
    }
};
ThuChiModule.init();
