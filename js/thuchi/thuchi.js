// js/thuchi/thuchi.js - PHIÊN BẢN TẬP TRUNG 1 SHEET ĐÃ VÁ LỖI TRÙNG ĐƠN MOBILE
const ThuChiModule = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwNA4KT2HEPkCCeQu8ZHLhapDREaNyOUHh9UcleiA6HrxVzLOfNRLpkEDj7zLRJ79kYsQ/exec",
    md: 'THU', totalOrders: 0, totalRevenue: 0, totalExpense: 0, isSyncing: false, isLoadingData: false, duLieuGiaoDichHomNay: [],
    oT: ['NHẠC LẺ', 'PHÍ ĐÀO TẠO', 'DOANH THU KHÁC'], oC: ['ADS', 'CHI PHÍ VẬN HÀNH'],

    init() { this.iId(); this.initLgdRong(); this.taiHoatDongHomNay(); setInterval(() => this.processQueue(), 5000); },
    iId() { const el = document.getElementById('id'); if (el) el.value = "CHỜ TỰ ĐỘNG"; },
    thayDoiBoLocThoiGian() { this.taiHoatDongHomNay(); },
    taoHoaDon() { return "HD" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase(); },

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
        if (this.isLoadingData) this.isLoadingData = false; this.isLoadingData = true;
        let admin = (localStorage.getItem('loggedUser') || '').trim().toUpperCase(), role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        const range = document.getElementById('filter-date-range')?.value || 'today';
        if (typeof G199kModule !== 'undefined' && document.getElementById('bảng-giao-dịch')) document.getElementById('bảng-giao-dịch').innerHTML = '';

        fetch(`${this.WEB_APP_URL}?range=${range}&_nocache=${Date.now()}`)
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (!res || res.status !== "success" || !Array.isArray(res.data)) return;
            this.duLieuGiaoDichHomNay = res.data; this.renderLocal(admin, role);
        }).catch(err => console.error(err)).finally(() => this.isLoadingData = false);
    },

    renderLocal(admin, role) {
        this.totalOrders = this.totalRevenue = this.totalExpense = 0;
        this.duLieuGiaoDichHomNay.forEach(item => {
            if (role !== 'MASTER' && (item.adminName || '').trim().toUpperCase() !== admin) return;
            this.totalOrders++; const mode = ['THU TIỀN', 'THU'].includes(item.mode) ? 'THU' : 'CHI';
            mode === 'THU' ? this.totalRevenue += Number(item.soTien || 0) : this.totalExpense += Number(item.soTien || 0);
        });
        this.capNhatKhoiDoiSoat(this.duLieuGiaoDichHomNay); this.uSt();
    },

    subData() {
        const btnAdd = document.getElementById('btn-add-data'); if (btnAdd && btnAdd.disabled) return;
        const kh = document.getElementById('kh')?.value?.trim() || "-", gc = document.getElementById('gc')?.value?.trim() || "-", lgd = document.getElementById('lgd')?.value, st = document.getElementById('st')?.value;
        if (!lgd || lgd === "Chọn loại giao dịch") return NotiModule.show("Vui lòng chọn Loại Giao Dịch cụ thể!", "error");
        if (!st || isNaN(st) || Number(st) <= 0) return NotiModule.show("Vui lòng nhập số tiền hợp lệ lớn hơn 0!", "error");
        
        if (btnAdd) { btnAdd.disabled = true; btnAdd.innerText = "ĐANG LƯU..."; }
        const numSt = Number(st), hoaDon = this.taoHoaDon(), admin = (localStorage.getItem('loggedUser') || "ADMIN").trim().toUpperCase(), role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        const thoiGianTao = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

        const newRecord = { hoaDon, khachHang: kh, ghiChu: gc, loaiGd: lgd, soTien: numSt, mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN', adminName: admin, thoiGian: thoiGianTao };
        this.duLieuGiaoDichHomNay.push(newRecord); this.renderLocal(admin, role);
        NotiModule.show(`Đã lưu đơn ${hoaDon}!`, "success");
        ['kh', 'gc', 'st'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; }); this.iId();

        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || []; queue.push(newRecord);
        localStorage.setItem('thuchi_queue', JSON.stringify(queue)); this.initLgdRong(); this.processQueue();
    },

    processQueue() {
        if (this.isSyncing) return;
        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || [];
        if (queue.length === 0) {
            const btnAdd = document.getElementById('btn-add-data');
            if (btnAdd) { btnAdd.disabled = false; btnAdd.innerText = "NHẬP DỮ LIỆU"; }
            return;
        }
        this.isSyncing = true; const currentItem = queue;

        fetch(this.WEB_APP_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(currentItem) })
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (res && res.status === "success") {
                let uQ = JSON.parse(localStorage.getItem('thuchi_queue')) || []; uQ.shift();
                localStorage.setItem('thuchi_queue', JSON.stringify(uQ));
                const btnAdd = document.getElementById('btn-add-data');
                if (btnAdd) { btnAdd.disabled = false; btnAdd.innerText = "NHẬP DỮ LIỆU"; }
            }
        }).catch(err => console.warn(err))
        .finally(() => { this.isSyncing = false; if ((JSON.parse(localStorage.getItem('thuchi_queue')) || []).length > 0) setTimeout(() => this.processQueue(), 500); });
    },

    capNhatKhoiDoiSoat(arr) {
        const box = document.getElementById('mini-rows'); if (!box) return;
        let admin = (localStorage.getItem('loggedUser') || '').trim().toUpperCase(), role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        
        // 🌟 CHỐT CHẶN: Loại bỏ hoàn toàn bản ghi rác nếu mã hóa đơn trống
        const filtered = arr.filter(i => i.hoaDon && i.hoaDon.trim() !== "" && (role === 'MASTER' || (i.adminName || '').trim().toUpperCase() === admin));
        box.innerHTML = [...filtered].reverse().map(i => {
            const isThu = ['THU TIỀN', 'THU'].includes(i.mode);
            return `<div class="ds-item"><div class="ds-info"><a href="javascript:void(0);" onclick="moChiTietHoaDon('${i.hoaDon}')" class="ds-link">${i.hoaDon}</a><span class="ds-time">${i.thoiGian || "--/-- --:--"}</span></div><span class="ds-amount ${isThu?'thu':'chi'}">${isThu?'+':'-'}${Number(i.soTien || 0).toLocaleString('vi-VN')}đ</span></div>`;
        }).join('') || '<div class="ds-empty">Chưa có dữ liệu.</div>';
    },


    uSt() {
        if(document.getElementById('stat-total-orders')) document.getElementById('stat-total-orders').innerText = this.totalOrders;
        if(document.getElementById('stat-total-revenue')) document.getElementById('stat-total-revenue').innerText = this.totalRevenue.toLocaleString('vi-VN') + 'đ';
        if(document.getElementById('stat-total-expense')) document.getElementById('stat-total-expense').innerText = this.totalExpense.toLocaleString('vi-VN') + 'đ';
    }
};
ThuChiModule.init();