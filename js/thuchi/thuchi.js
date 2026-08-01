// js/thuchi/thuchi.js - PHIÊN BẢN TẬP TRUNG 1 SHEET ĐÃ VÁ LỖI TRÙNG ĐƠN MOBILE
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
        if (this.isLoadingData) { this.isLoadingData = false; } 
        this.isLoadingData = true;
        this.totalOrders = this.totalRevenue = this.totalExpense = 0; this.duLieuGiaoDichHomNay = [];
        this.uSt(); this.capNhatKhoiDoiSoat([]);
        
        let admin = (localStorage.getItem('loggedUser') || '').trim().toUpperCase();
        let role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        const rangeSelect = document.getElementById('filter-date-range');
        const range = rangeSelect ? rangeSelect.value : 'today';

        if (typeof G199kModule !== 'undefined' && document.getElementById('bảng-giao-dịch')) document.getElementById('bảng-giao-dịch').innerHTML = '';

        fetch(`${this.WEB_APP_URL}?range=${range}&_nocache=${Date.now()}`)
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (!res || res.status !== "success" || !Array.isArray(res.data) || res.data.length === 0) return;
            this.duLieuGiaoDichHomNay = res.data;
            
            let tempOrders = 0, tempRevenue = 0, tempExpense = 0;
            res.data.forEach(item => {
                if (role !== 'MASTER' && (item.adminName || '').trim().toUpperCase() !== admin) return;
                tempOrders++; 
                const mode = ['THU TIỀN', 'THU'].includes(item.mode) ? 'THU' : 'CHI';
                mode === 'THU' ? tempRevenue += Number(item.soTien || 0) : tempExpense += Number(item.soTien || 0);
                if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') G199kModule.rRow(item.hoaDon, item.khachHang, item.ghiChu, item.loaiGd, item.soTien, mode, admin);
            });
            this.totalOrders = tempOrders; this.totalRevenue = tempRevenue; this.totalExpense = tempExpense;
            this.capNhatKhoiDoiSoat(res.data); this.uSt();
        }).catch(err => console.error("Lỗi tải mạng:", err)).finally(() => this.isLoadingData = false);
    },

    subData() {
        // CHỐT CHẶN 1: Nếu nút đang bị khóa thì chặn đứng hoàn toàn lệnh chạm thứ 2 của Safari Mobile
        const btnAdd = document.getElementById('btn-add-data');
        if (btnAdd && btnAdd.disabled) return;

        const kh = document.getElementById('kh')?.value?.trim() || "-", gc = document.getElementById('gc')?.value?.trim() || "-", lgd = document.getElementById('lgd')?.value, st = document.getElementById('st')?.value;
        if (!lgd || lgd === "Chọn loại giao dịch") return NotiModule.show("Vui lòng chọn Loại Giao Dịch cụ thể!", "error");
        if (!st || isNaN(st) || Number(st) <= 0) return NotiModule.show("Vui lòng nhập số tiền hợp lệ lớn hơn 0!", "error");
        
        // CHỐT CHẶN 2: Khóa cứng nút bấm tức thì (0ms) tránh việc nhân viên chạm nhiều lần
        if (btnAdd) {
            btnAdd.disabled = true;
            btnAdd.innerText = "ĐANG XỬ LÝ...";
            btnAdd.style.background = "#9ca3af";
        }

        const numSt = Number(st), hoaDon = this.taoHoaDon();
        const admin = (localStorage.getItem('loggedUser') || "ADMIN").trim().toUpperCase();
        
        this.totalOrders++; this.md === 'THU' ? this.totalRevenue += numSt : this.totalExpense += numSt; this.uSt();

        if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') G199kModule.rRow(hoaDon, kh, gc, lgd, numSt, this.md, admin);
        NotiModule.show(`Đã lưu đơn ${hoaDon}! Đang đồng bộ...`, "success");
        ['kh', 'gc', 'st'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; }); this.iId();

        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || [];
        const newRecord = { hoaDon, khachHang: kh, ghiChu: gc, loaiGd: lgd, soTien: numSt, mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN', adminName: admin };
        queue.push(newRecord); localStorage.setItem('thuchi_queue', JSON.stringify(queue));
        
        this.duLieuGiaoDichHomNay.push(newRecord); this.capNhatKhoiDoiSoat(this.duLieuGiaoDichHomNay);
        this.initLgdRong(); this.processQueue();
    },

    processQueue() {
        if (this.isSyncing) return;
        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || []; if (queue.length === 0) {
            // Mở khóa nút bấm nếu hàng đợi trống rỗng hoàn toàn
            const btnAdd = document.getElementById('btn-add-data');
            if (btnAdd && btnAdd.disabled) { btnAdd.disabled = false; btnAdd.innerText = "NHẬP DỮ LIỆU"; btnAdd.style.background = ""; }
            return;
        }
        this.isSyncing = true; const currentItem = queue[0];

        fetch(this.WEB_APP_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(currentItem) })
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (res && res.status === "success") {
                let uQ = JSON.parse(localStorage.getItem('thuchi_queue')) || []; uQ.shift();
                localStorage.setItem('thuchi_queue', JSON.stringify(uQ)); 
                
                // MỞ KHÓA NÚT BẤM: Khôi phục trạng thái nút bấm ban đầu sau khi Sheets đã nhận đơn thành công
                const btnAdd = document.getElementById('btn-add-data');
                if (btnAdd) { btnAdd.disabled = false; btnAdd.innerText = "NHẬP DỮ LIỆU"; btnAdd.style.background = ""; }

                this.taiHoatDongHomNay();
            }
        }).catch(() => {
            console.warn(`Đơn ${currentItem.hoaDon} đợi mạng.`);
            // Bảo hiểm rớt mạng: Vẫn mở lại nút bấm để nhân viên nhập đơn tiếp theo ngoại tuyến
            const btnAdd = document.getElementById('btn-add-data');
            if (btnAdd) { btnAdd.disabled = false; btnAdd.innerText = "NHẬP DỮ LIỆU"; btnAdd.style.background = ""; }
        })
        .finally(() => { this.isSyncing = false; if ((JSON.parse(localStorage.getItem('thuchi_queue')) || []).length > 0) setTimeout(() => this.processQueue(), 500); });
    },

    capNhatKhoiDoiSoat(arr) {
        const box = document.getElementById('mini-rows'); if (!box) return;
        let admin = (localStorage.getItem('loggedUser') || '').trim().toUpperCase();
        let role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        
        const filtered = arr.filter(i => role === 'MASTER' || (i.adminName || '').trim().toUpperCase() === admin);
        box.innerHTML = [...filtered].reverse().map(i => {
            const isThu = ['THU TIỀN', 'THU'].includes(i.mode);
            return `<div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px dashed #eee;">
                <a href="javascript:void(0);" onclick="moChiTietHoaDon('${i.hoaDon}')" style="font-weight:bold;color:#1e40af;text-decoration:none;"> ${i.hoaDon}</a>
                <span style="color:${isThu?'green':'red'};font-weight:bold;">${isThu?'+':'-'}${Number(i.soTien || 0).toLocaleString('vi-VN')}đ</span>
            </div>`;
        }).join('') || '<div style="color:#888;font-size:12px;">Chưa có dữ liệu.</div>';
    },

    uSt() {
        if(document.getElementById('stat-total-orders')) document.getElementById('stat-total-orders').innerText = this.totalOrders;
        if(document.getElementById('stat-total-revenue')) document.getElementById('stat-total-revenue').innerText = this.totalRevenue.toLocaleString('vi-VN') + 'đ';
        if(document.getElementById('stat-total-expense')) document.getElementById('stat-total-expense').innerText = this.totalExpense.toLocaleString('vi-VN') + 'đ';
    }
};
ThuChiModule.init();
