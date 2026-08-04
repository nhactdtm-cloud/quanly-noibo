// js/thuchi/thuchi.js - FULL MODULE FIREBASE COMPLETE (SIÊU TIẾT KIỆM DÒNG)
const ThuChiModule = {
    FB_URL: "https://noibo-nhactdtm-default-rtdb.asia-southeast1.firebasedatabase.app/", FB_KEY: "", 
    md: 'THU',
    mode: 'RENEW', 
    searchId: 0,
    isAutofilling: false,
     totalOrders: 0, totalRevenue: 0, totalExpense: 0, isSyncing: false, isLoadingData: false, duLieuGiaoDichHomNay: [],
    oT: ['NHẠC LẺ', 'PHÍ ĐÀO TẠO', 'DOANH THU KHÁC'], oC: ['ADS', 'CHI PHÍ VẬN HÀNH'],

    init() { 
        this.iId(); 
        this.initLgdRong(); 
        this.taiHoatDongHomNay(); 

        // 🌟 SỬA TẠI ĐÂY: Đổi 'id' thành 'gid-thuchi'
        const inputIdBox = document.getElementById('gid-thuchi');
        if (inputIdBox) {
            inputIdBox.addEventListener('change', () => {
                tựĐộngTìmKiếmKháchHàng(this, 'GID'); 
            });
        }

        setInterval(() => this.processQueue(), 5000); 
    },


    iId() { 
        // Thay đổi sang ID mới bảo mật chống lỗi admin
        const el = document.getElementById('gid-thuchi'); 
        if (el) {
            el.value = ""; // Xóa sạch chữ admin cứng đầu
            el.placeholder = "Nhập mã GID để tìm..."; // 🌟 Nạp chữ gợi ý thuần tại đây bằng JS
        }
    },

    thayDoiBoLocThoiGian() { this.taiHoatDongHomNay(); },
    taoHoaDon() { 
    return IdHoaDonModule.sinhMaDuyNhat(); 
},


    initLgdRong() {
        const sel = document.getElementById('lgd'); if (!sel) return; sel.innerHTML = ''; 
        const opt = new Option('Chọn loại giao dịch', ''); opt.disabled = opt.selected = opt.hidden = true; sel.add(opt);
        this.oT.forEach(o => sel.add(new Option(o, o))); sel.value = '';
    },

    sm(m) {
        this.md = m; const bT = document.getElementById('s-thu'), bC = document.getElementById('s-chi'), sel = document.getElementById('lgd');
        if (bT && bC) bT.className = bC.className = 'seg-btn'; if (!sel) return; sel.innerHTML = ''; 
        const opt = new Option('Chọn loại giao dịch', ''); opt.disabled = opt.selected = opt.hidden = true; sel.add(opt);
        m === 'THU' ? (bT?.classList.add('active', 'thu'), this.oT.forEach(o => sel.add(new Option(o, o)))) : (bC?.classList.add('active', 'chi'), this.oC.forEach(o => sel.add(new Option(o, o))));
        sel.value = '';
    },

    subData() {
        const btnAdd = document.getElementById('btn-add-data'); if (btnAdd && btnAdd.disabled) return;
        const kh = document.getElementById('kh')?.value?.trim() || "-", gc = document.getElementById('gc')?.value?.trim() || "-", lgd = document.getElementById('lgd')?.value, st = document.getElementById('st')?.value;
        if (!lgd || lgd === "Chọn loại giao dịch") return NotiModule.show("Vui lòng chọn Loại Giao Dịch cụ thể!", "error");
        if (!st || isNaN(st) || Number(st) <= 0) return NotiModule.show("Vui lòng nhập số tiền hợp lệ lớn hơn 0!", "error");
        if (btnAdd) { btnAdd.disabled = true; btnAdd.innerText = "ĐANG LƯU..."; btnAdd.style.background = "#9ca3af"; }

        const numSt = Number(st), hoaDon = this.taoHoaDon();
        const admin = (localStorage.getItem('loggedUser') || (typeof UserModule !== 'undefined' && UserModule.uName) || "ADMIN").trim().toUpperCase();
        if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') G199kModule.rRow(hoaDon, kh, gc, lgd, numSt, this.md, admin);
        NotiModule.show(`Đã lưu đơn ${hoaDon}! Đang đồng bộ...`, "success");
        ['kh', 'gc', 'st'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; }); this.iId();

        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || []; const bY = new Date();
        const thoiGianTao = bY.toLocaleDateString('vi-VN') + ' ' + bY.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        const ngayGiaoDich = bY.getFullYear() + '-' + String(bY.getMonth() + 1).padStart(2, '0') + '-' + String(bY.getDate()).padStart(2, '0');

        queue.push({ hoaDon, khachHang: kh, ghiChu: gc, loaiGd: lgd, soTien: numSt, mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN', adminName: admin, thoiGian: thoiGianTao, ngayGiaoDich });
        localStorage.setItem('thuchi_queue', JSON.stringify(queue)); this.initLgdRong(); this.processQueue();
    },

    processQueue() {
        if (this.isSyncing) return; let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || []; 
        if (queue.length === 0) { this.giaiPhongNutBamLoi(); return; }
        this.isSyncing = true; const currentItem = queue[0];
        const cleanUrl = this.FB_URL.replace(/\/$/, '');
        const url = `${cleanUrl}/thuchi/${currentItem.hoaDon}.json${this.FB_KEY ? '?auth='+this.FB_KEY : ''}`;

        fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(currentItem) })
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (res) {
                let uQ = JSON.parse(localStorage.getItem('thuchi_queue')) || []; uQ.shift(); localStorage.setItem('thuchi_queue', JSON.stringify(uQ)); 
                this.giaiPhongNutBamLoi(); this.totalOrders++;
                currentItem.mode === 'THU TIỀN' ? (this.totalRevenue += Number(currentItem.soTien || 0)) : (this.totalExpense += Number(currentItem.soTien || 0));
                this.uSt(); this.duLieuGiaoDichHomNay.push(currentItem); this.capNhatKhoiDoiSoat(this.duLieuGiaoDichHomNay); this.isSyncing = false;
            } else { this.giaiPhongNutBamLoi(); }
        })
        .catch(err => { console.warn(`Đơn ${currentItem.hoaDon} chờ mạng.`, err); this.giaiPhongNutBamLoi(); })
        .finally(() => { this.isSyncing = false; let cQ = JSON.parse(localStorage.getItem('thuchi_queue')) || []; if (cQ.length > 0) setTimeout(() => this.processQueue(), 500); });
    },

    giaiPhongNutBamLoi() { const b = document.getElementById('btn-add-data'); if (b) { b.disabled = false; b.innerText = "NHẬP DỮ LIỆU"; b.style.background = ""; } },

    taiHoatDongHomNay() {
        if (this.isLoadingData) { console.warn("Safari đang đợi..."); this.isLoadingData = false; } this.isLoadingData = true;
        this.totalOrders = this.totalRevenue = this.totalExpense = 0; this.duLieuGiaoDichHomNay = []; this.uSt(); this.capNhatKhoiDoiSoat([]);
        let admin = (localStorage.getItem('loggedUser') || '').trim().toUpperCase(), role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        const rSelect = document.getElementById('filter-date-range'), range = rSelect ? rSelect.value : 'today';
        if (typeof G199kModule !== 'undefined' && document.getElementById('bảng-giao-dịch')) document.getElementById('bảng-giao-dịch').innerHTML = '';

        const cleanUrl = this.FB_URL.replace(/\/$/, '');
        fetch(`${cleanUrl}/thuchi.json?_nocache=${Date.now()}${this.FB_KEY ? '&auth='+this.FB_KEY : ''}`)
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (!res) return; let raw = Object.values(res);
            
            // Tạo đối tượng ngày hiện tại và đặt về 00:00:00 để tránh lệch múi giờ
            const hN = new Date(); hN.setHours(0, 0, 0, 0); 
            const cN = hN.getFullYear() + '-' + String(hN.getMonth() + 1).padStart(2, '0') + '-' + String(hN.getDate()).padStart(2, '0');
            
            if (range === 'today') {
                raw = raw.filter(i => i.ngayGiaoDich === cN);
            } else if (range === '30days') {
                // Tạo mốc 30 ngày trước tại thời điểm 00:00:00
                const mốc = new Date(hN); 
                mốc.setDate(hN.getDate() - 30);
                
                raw = raw.filter(i => {
                    if (!i.ngayGiaoDich) return false;
                    // Chuyển chuỗi YYYY-MM-DD thành Date object dạng Local Time thay vì UTC
                    const [y, m, d] = i.ngayGiaoDich.split('-').map(Number);
                    const ngayGiaodichObj = new Date(y, m - 1, d);
                    
                    // Bao gồm cả ngày mốc (30 ngày trước) và ngày hôm nay
                    return ngayGiaodichObj >= mốc && ngayGiaodichObj <= hN;
                });
            }

            this.duLieuGiaoDichHomNay = raw; this.totalOrders = this.totalRevenue = this.totalExpense = 0;
            raw.forEach(i => {
                if (role !== 'MASTER' && (i.adminName || '').trim().toUpperCase() !== admin) return; this.totalOrders++; 
                const m = ['THU TIỀN', 'THU'].includes(i.mode) ? 'THU' : 'CHI';
                m === 'THU' ? this.totalRevenue += Number(i.soTien || 0) : this.totalExpense += Number(i.soTien || 0);
                if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') G199kModule.rRow(i.hoaDon, i.khachHang, i.ghiChu, i.loaiGd, i.soTien, m, admin);
            });
            this.capNhatKhoiDoiSoat(raw); this.uSt();
        }).catch(err => console.error("Lỗi tải:", err)).finally(() => this.isLoadingData = false);
    },


    capNhatKhoiDoiSoat(arr) {
        const box = document.getElementById('mini-rows'); if (!box) return;
        let admin = (localStorage.getItem('loggedUser') || '').trim().toUpperCase(), role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        const filtered = arr.filter(i => role === 'MASTER' || (i.adminName || '').trim().toUpperCase() === admin);
        
        // 🌟 SẮP XẾP: Giờ muộn nhất luôn lên đầu bảng (Lựa chọn nào cũng thế)
        filtered.sort((a, b) => {
            const quyDoiThoiGian = (str) => {
                if (!str || str.trim() === "") return 0;
                const parts = str.split(' ');
                const datePart = parts[0]; if (!datePart) return 0;
                const timePart = parts[1] || "00:00";
                
                const dArr = datePart.split('/');
                const tArr = timePart.split(':');
                
                const d = parseInt(dArr[0], 10) || 1;
                const m = parseInt(dArr[1], 10) || 1;
                const y = parseInt(dArr[2], 10) || 2026;
                const h = parseInt(tArr[0], 10) || 0;
                const i = parseInt(tArr[1], 10) || 0;
                
                return new Date(y, m - 1, d, h, i).getTime();
            };
            return quyDoiThoiGian(b.thoiGian) - quyDoiThoiGian(a.thoiGian);
        });

        box.innerHTML = filtered.map(i => {
            const isThu = ['THU TIỀN', 'THU'].includes(i.mode), t = (i.thoiGian && i.thoiGian.trim() !== "") ? i.thoiGian : "--/-- --:--";
            
            // Ví dụ: "HD-2WTLZL019-THUCHI" -> "HD-THUCHI"
            let maHienThi = i.hoaDon;
            if (maHienThi && maHienThi.startsWith("HD-")) {
                const parts = maHienThi.split('-');
                if (parts.length >= 3) {
                    maHienThi = `${parts[0]}-${parts[2]}`; // Ghép chữ HD và Loại đơn lại với nhau
                }
            }

            return `<div class="ds-item">
                <div class="ds-info">
                    <a href="javascript:void(0);" onclick="moChiTietHoaDon('${i.hoaDon}')" class="ds-link">${maHienThi}</a>
                    <span class="ds-time">${t}</span>
                </div>
                <span class="ds-amount ${isThu ? 'thu' : 'chi'}">${isThu ? '+' : '-'}${Number(i.soTien || 0).toLocaleString('vi-VN')}đ</span>
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
