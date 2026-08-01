// js/thuchi/thuchi.js - FULL MODULE 1 SHEET (TIẾT KIỆM DÒNG)
const ThuChiModule = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwNA4KT2HEPkCCeQu8ZHLhapDREaNyOUHh9UcleiA6HrxVzLOfNRLpkEDj7zLRJ79kYsQ/exec",
    md: 'THU', totalOrders: 0, totalRevenue: 0, totalExpense: 0, isSyncing: false, isLoadingData: false, duLieuGiaoDichHomNay: [],
    oT: ['NHẠC LẺ', 'PHÍ ĐÀO TẠO', 'DOANH THU KHÁC'], oC: ['ADS', 'CHI PHÍ VẬN HÀNH'],

    init() { this.iId(); this.initLgdRong(); this.taiHoatDongHomNay(); setInterval(() => this.processQueue(), 5000); },
    iId() { const el = document.getElementById('id'); if (el) el.value = "CHỜ TỰ ĐỘNG"; },
    thayDoiBoLocThoiGian() { this.taiHoatDongHomNay(); },
    taoHoaDon() { return "HD" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase(); },

    initLgdRong() {
        const sel = document.getElementById('lgd'); if (!sel) return;
        sel.innerHTML = ''; sel.add(new Option('Chọn loại giao dịch', ''));
        this.oT.forEach(o => sel.add(new Option(o, o))); sel.value = '';
    },

    sm(m) {
        this.md = m; const bT = document.getElementById('s-thu'), bC = document.getElementById('s-chi'), sel = document.getElementById('lgd');
        if (bT && bC) bT.className = bC.className = 'seg-btn'; if (!sel) return;
        sel.innerHTML = ''; sel.add(new Option('Chọn loại giao dịch', ''));
        m === 'THU' ? (bT?.classList.add('active', 'thu'), this.oT.forEach(o => sel.add(new Option(o, o)))) : (bC?.classList.add('active', 'chi'), this.oC.forEach(o => sel.add(new Option(o, o))));
        sel.value = '';
    },

    taiHoatDongHomNay() {
        // SỬA LỖI SAFARI PWA: Ép giải phóng cờ loading nếu bộ lọc thời gian thay đổi để tránh bị khựng lệnh
        if (this.isLoadingData) {
            console.warn("Safari đang xếp hàng tải dữ liệu ngầm...");
            this.isLoadingData = false; // Phá vỡ vòng lặp kẹt cờ loading trên Mobile
        } 
        
        this.isLoadingData = true;
        this.totalOrders = this.totalRevenue = this.totalExpense = 0; 
        this.duLieuGiaoDichHomNay = [];
        this.uSt(); 
        this.capNhatKhoiDoiSoat([]);
        
        let admin = (localStorage.getItem('loggedUser') || '').trim().toUpperCase();
        let role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        
        // Đọc giá trị trực tiếp từ DOM thay vì dùng cache biến
        const rangeSelect = document.getElementById('filter-date-range');
        const range = rangeSelect ? rangeSelect.value : 'today';

        if (typeof G199kModule !== 'undefined' && document.getElementById('bảng-giao-dịch')) {
            document.getElementById('bảng-giao-dịch').innerHTML = '';
        }

        // Bổ sung tham số thời gian ngẫu nhiên (_nocache) để ép Safari PWA quét dữ liệu mới tinh, không lấy dữ liệu cũ trong RAM điện thoại
        fetch(`${this.WEB_APP_URL}?range=${range}&_nocache=${Date.now()}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(res => {
            if (!res || res.status !== "success" || !Array.isArray(res.data) || res.data.length === 0) return;
            this.duLieuGiaoDichHomNay = res.data;
            
            res.data.forEach(item => {
                if (role !== 'MASTER' && (item.adminName || '').trim().toUpperCase() !== admin) return;
                this.totalOrders++; 
                const mode = ['THU TIỀN', 'THU'].includes(item.mode) ? 'THU' : 'CHI';
                mode === 'THU' ? this.totalRevenue += Number(item.soTien || 0) : this.totalExpense += Number(item.soTien || 0);
                if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') {
                    G199kModule.rRow(item.hoaDon, item.khachHang, item.ghiChu, item.loaiGd, item.soTien, mode, admin);
                }
            });
            this.capNhatKhoiDoiSoat(res.data); 
            this.uSt();
        })
        .catch(err => console.error("Lỗi tải mạng Mobile:", err))
        .finally(() => { 
            this.isLoadingData = false; // Luôn giải phóng bộ gõ lệnh
        });
    },

    subData() {
        const kh = document.getElementById('kh')?.value?.trim() || "-", gc = document.getElementById('gc')?.value?.trim() || "-", lgd = document.getElementById('lgd')?.value, st = document.getElementById('st')?.value;
        if (!lgd || lgd === "Chọn loại giao dịch") return NotiModule.show("Vui lòng chọn Loại Giao Dịch cụ thể!", "error");
        if (!st || isNaN(st) || Number(st) <= 0) return NotiModule.show("Vui lòng nhập số tiền hợp lệ lớn hơn 0!", "error");
        
        const numSt = Number(st), hoaDon = this.taoHoaDon();
        // Định danh người nhập hóa đơn thực tế
        const admin = (localStorage.getItem('loggedUser') || (typeof UserModule !== 'undefined' && UserModule.uName) || "ADMIN").trim().toUpperCase();
        
        this.totalOrders++; this.md === 'THU' ? this.totalRevenue += numSt : this.totalExpense += numSt; this.uSt();

        if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') G199kModule.rRow(hoaDon, kh, gc, lgd, numSt, this.md, admin);
        NotiModule.show(`Đã lưu đơn ${hoaDon}! Đang đồng bộ...`, "success");
        ['kh', 'gc', 'st'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; }); this.iId();

        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || [];
const thoiGianTao = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

const newRecord = { 
    hoaDon, 
    khachHang: kh, 
    ghiChu: gc, 
    loaiGd: lgd, 
    soTien: numSt, 
    mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN', 
    adminName: admin,
    thoiGian: thoiGianTao // <-- BỔ SUNG DÒNG NÀY
};
        queue.push(newRecord); localStorage.setItem('thuchi_queue', JSON.stringify(queue));
        
        this.duLieuGiaoDichHomNay.push(newRecord); this.capNhatKhoiDoiSoat(this.duLieuGiaoDichHomNay);
        this.initLgdRong(); this.processQueue();
    },

    processQueue() {
        if (this.isSyncing) return;
        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || []; if (queue.length === 0) return;
        this.isSyncing = true; const currentItem = queue[0];

        fetch(this.WEB_APP_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(currentItem) })
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (res && res.status === "success") {
                let uQ = JSON.parse(localStorage.getItem('thuchi_queue')) || []; uQ.shift();
                localStorage.setItem('thuchi_queue', JSON.stringify(uQ)); this.taiHoatDongHomNay();
            }
        }).catch(() => console.warn(`Đơn ${currentItem.hoaDon} đợi mạng.`))
        .finally(() => { this.isSyncing = false; if ((JSON.parse(localStorage.getItem('thuchi_queue')) || []).length > 0) setTimeout(() => this.processQueue(), 500); });
    },

    // ==========================================================================
    // HÀM LỌC ĐỐI SOÁT: CHỈ DUY NHẤT MASTER ĐƯỢC NHÌN THẤY DANH SÁCH ĐƠN CỦA MỌI NGƯỜI
    // ==========================================================================
    capNhatKhoiDoiSoat(arr) {
        const box = document.getElementById('mini-rows'); if (!box) return;
        let admin = (localStorage.getItem('loggedUser') || '').trim().toUpperCase();
        let role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        
        // Tiến hành lọc mảng hiển thị: Nếu là MASTER hiện hết, ngược lại chỉ hiện đơn trùng khớp adminName của mình
        const filtered = arr.filter(i => role === 'MASTER' || (i.adminName || '').trim().toUpperCase() === admin);
        box.innerHTML = [...filtered].reverse().map(i => {
            const isThu = ['THU TIỀN', 'THU'].includes(i.mode);
            const thoiGianNho = (i.thoiGian && i.thoiGian.trim() !== "") ? i.thoiGian : "--/-- --:--";

            return `<div class="ds-item">
                <!-- Khối bên trái: Chứa mã hóa đơn và ngày tháng nhỏ -->
                <div class="ds-info">
                    <a href="javascript:void(0);" onclick="moChiTietHoaDon('${i.hoaDon}')" class="ds-link">
                        ${i.hoaDon}
                    </a>
                    <span class="ds-time">
                        ${thoiGianNho}
                    </span>
                </div>

                <!-- Khối bên phải: Số tiền -->
                <span class="ds-amount ${isThu ? 'thu' : 'chi'}">
                    ${isThu ? '+' : '-'}${Number(i.soTien || 0).toLocaleString('vi-VN')}đ
                </span>
            </div>`;
        }).join('') || '<div class="ds-empty">Chưa có dữ liệu.</div>';
    },

    uSt() {
        if(document.getElementById('stat-total-orders')) document.getElementById('stat-total-orders').innerText = this.totalOrders;
        if(document.getElementById('stat-total-revenue')) document.getElementById('stat-total-revenue').innerText = this.totalRevenue.toLocaleString('vi-VN') + 'đ';
        if(document.getElementById('stat-total-expense')) document.getElementById('stat-total-expense').innerText = this.totalExpense.toLocaleString('vi-VN') + 'đ';
    }

};
ThuChiModule.init();
