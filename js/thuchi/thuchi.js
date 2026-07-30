const ThuChiModule = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwNA4KT2HEPkCCeQu8ZHLhapDREaNyOUHh9UcleiA6HrxVzLOfNRLpkEDj7zLRJ79kYsQ/exec",
    md: 'THU', totalOrders: 0, totalRevenue: 0, totalExpense: 0,
    oT: ['NHẠC LẺ', 'PHÍ ĐÀO TẠO', 'DOANH THU KHÁC'], oC: ['ADS', 'CHI PHÍ VẬN HÀNH'], isSyncing: false, 
    
    // BIẾN MỚI: Bộ nhớ đệm lưu trữ danh sách đơn hàng thực tế
    duLieuGiaoDichHomNay: [],

    init() { 
        this.iId(); 
        this.taiHoatDongHomNay(); 
        this.initLgdRong();
        setInterval(() => this.processQueue(), 5000); 
    },

    initLgdRong() {
        const sel = document.getElementById('lgd'); if (!sel) return;
        sel.innerHTML = ''; sel.add(new Option('Chọn loại giao dịch', ''));
        this.oT.forEach(o => sel.add(new Option(o, o))); sel.value = '';
    },

    taiHoatDongHomNay() {
        // KIỂM TRA CHẶN: Nếu đang trong quá trình fetch dữ liệu thì không cho chạy trùng lặp
        if (this.isLoadingData) return;
        this.isLoadingData = true;

        // 1. CƯỠNG BỨC RESET TOÀN BỘ SỐ LIỆU VỀ 0 TRƯỚC KHI TÍNH TOÁN
        this.totalOrders = 0; 
        this.totalRevenue = 0; 
        this.totalExpense = 0;
        this.duLieuGiaoDichHomNay = []; // Xóa sạch mảng cũ tránh dồn tích dữ liệu
        this.uSt();
        this.capNhatKhoiDoiSoat([]);

        // Lấy tên tài khoản an toàn từ bộ nhớ
        let admin = localStorage.getItem('loggedUser') || (typeof UserModule !== 'undefined' && UserModule.uName) || "ADMIN";
        admin = admin.trim().toUpperCase();

        console.log("=> TIẾN HÀNH TẢI DỮ LIỆU ĐỘC QUYỀN CHO USER:", admin);

        // Làm sạch khu vực hiển thị bảng giao dịch cũ trên giao diện trước khi fetch
        if (typeof G199kModule !== 'undefined' && document.getElementById('bảng-giao-dịch')) { 
            document.getElementById('bảng-giao-dịch').innerHTML = ''; 
        }

        // 2. GỌI API ĐỒNG BỘ ĐẾN GOOGLE SHEETS
        fetch(`${this.WEB_APP_URL}?adminName=${encodeURIComponent(admin)}&admin=${encodeURIComponent(admin)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(res => {
            if (!res || res.status !== "success" || !Array.isArray(res.data) || res.data.length === 0) {
                return; // Nếu không có dữ liệu, giữ nguyên trạng thái 0đ sạch sẽ
            }
            
            // Lưu dữ liệu sạch vào bộ nhớ đệm
            this.duLieuGiaoDichHomNay = res.data;

            // 3. DUYỆT MẢNG ĐỂ TÍNH TOÁN (ĐẢM BẢO CHỈ TÍNH TOÁN TRÊN DỮ LIỆU SẠCH VỪA TRẢ VỀ)
            res.data.forEach(item => {
                this.totalOrders++;
                const mode = item.mode === 'THU TIỀN' || item.mode === 'THU' ? 'THU' : 'CHI';
                
                if (mode === 'THU') {
                    this.totalRevenue += Number(item.soTien || 0);
                } else {
                    this.totalExpense += Number(item.soTien || 0);
                }
                
                try { 
                    if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') {
                        G199kModule.rRow(item.hoaDon, item.khachHang, item.ghiChu, item.loaiGd, item.soTien, mode, admin); 
                    } 
                } catch (e) {
                    console.error("Lỗi vẽ dòng giao diện:", e);
                }
            });

            // 4. ĐẨY SỐ LIỆU CHUẨN XÁC CUỐI CÙNG LÊN MÀN HÌNH
            this.capNhatKhoiDoiSoat(res.data);
            this.uSt();
        })
        .catch(err => {
            console.error("Lỗi kết nối API:", err);
        })
        .finally(() => {
            // Mở khóa cờ chặn để có thể tải lại dữ liệu ở các lần tiếp theo (khi thêm đơn mới)
            this.isLoadingData = false;
        });
    },



    capNhatKhoiDoiSoat(arr) {
        const box = document.getElementById('mini-rows'); if (!box) return;
        box.innerHTML = ''; 
        box.innerHTML = [...arr].reverse().map(i => {
            const isThu = i.mode === 'THU TIỀN';
            return `<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0;border-bottom:1px dashed #eee;">
                <a href="javascript:void(0);" onclick="moChiTietHoaDon('${i.hoaDon}')" style="font-weight:bold;color:#1e40af;text-decoration:none;cursor:pointer;"> ${i.hoaDon}</a>
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
        bT.className = bC.className = 'seg-btn'; sel.innerHTML = ''; sel.add(new Option('Chọn loại giao dịch', ''));
        m === 'THU' ? (bT.classList.add('active', 'thu'), this.oT.forEach(o => sel.add(new Option(o, o)))) : (bC.classList.add('active', 'chi'), this.oC.forEach(o => sel.add(new Option(o, o))));
        sel.value = '';
    },
    
    taoHoaDon() { return "HD" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase(); },
    
subData() {
    // 1. Lấy dữ liệu từ các ô nhập liệu một cách an toàn
    const kh = document.getElementById('kh')?.value?.trim() || "-";
    const gc = document.getElementById('gc')?.value?.trim() || "-";
    const lgd = document.getElementById('lgd')?.value;
    const st = document.getElementById('st')?.value;

    // 2. KIỂM TRA CHẶN: Nếu chưa chọn Loại Giao Dịch (bằng rỗng hoặc bằng chữ mặc định)
    if (!lgd || lgd === "" || lgd === "Chọn loại giao dịch") {
        return NotiModule.show("Vui lòng chọn Loại Giao Dịch cụ thể!", "error");
    }

    // 3. KIỂM TRA CHẶN: Nếu số tiền trống, không phải là số hoặc nhỏ hơn/bằng 0
    if (!st || isNaN(st) || Number(st) <= 0) {
        return NotiModule.show("Vui lòng nhập số tiền hợp lệ lớn hơn 0!", "error");
    }
    
    // --- CHỈ KHI DỮ LIỆU HỢP LỆ MỚI CHẠY TIẾP XUỐNG DƯỚI NÀY ---
    const numSt = Number(st);
    const hoaDon = this.taoHoaDon();
    const admin = (typeof UserModule !== 'undefined' && UserModule.uName) ? UserModule.uName : "ADMIN";
    
    // Cập nhật tổng số lượng và doanh thu hệ thống
    this.totalOrders++; 
    this.md === 'THU' ? this.totalRevenue += numSt : this.totalExpense += numSt; 
    this.uSt();

    // 4. GỬI SANG GOOGLE SHEETS (Đã bọc kiểm tra biến lgd một lần nữa cho chắc chắn)
    try { 
        if (typeof G199kModule !== 'undefined' && typeof G199kModule.rRow === 'function') {
            if (lgd && lgd !== "" && lgd !== "Chọn loại giao dịch") {
                G199kModule.rRow(hoaDon, kh, gc, lgd, numSt, this.md, admin); 
            } else {
                return; // Ngăn chặn tuyệt đối nếu có lỗi logic bất ngờ
            }
        } 
    } catch (e) {
        console.error("Lỗi đồng bộ Google Sheets:", e);
    }
    
    // Thông báo thành công cho người dùng
    NotiModule.show(`Đã lưu đơn ${hoaDon}! Đang đồng bộ...`, "success");
    
    // 5. LÀM TRỐNG FORM (Chừa lại thanh chọn để hàm initLgdRong xử lý sau)
    if (document.getElementById('kh')) document.getElementById('kh').value = "";
    if (document.getElementById('gc')) document.getElementById('gc').value = "";
    if (document.getElementById('st')) document.getElementById('st').value = ""; 
    this.iId();

    // 6. LƯU VÀO HÀNG ĐỢI OFFLINE & CACHE HIỂN THỊ
    let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || [];
    const newRecord = { 
        hoaDon, 
        khachHang: kh, 
        ghiChu: gc, 
        loaiGd: lgd, 
        soTien: numSt, 
        mode: this.md === 'THU' ? 'THU TIỀN' : 'CHI TIỀN', 
        adminName: admin 
    };
    queue.push(newRecord);
    localStorage.setItem('thuchi_queue', JSON.stringify(queue));
    
    if (typeof ThuChiModule !== 'undefined' && ThuChiModule.duLieuGiaoDichHomNay) {
        ThuChiModule.duLieuGiaoDichHomNay.push(newRecord);
    }

    // 7. RESET THANH CHỌN VỀ RỖNG & XỬ LÝ ĐỒNG BỘ TIẾP THEO
    this.initLgdRong(); 
    this.processQueue(); 
},


    processQueue() {
        if (this.isSyncing) return;
        let queue = JSON.parse(localStorage.getItem('thuchi_queue')) || []; if (queue.length === 0) return;
        this.isSyncing = true; const currentItem = queue[0];
        fetch(this.WEB_APP_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(currentItem) })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(res => {
            if (res && res.status === "success") {
                let uQ = JSON.parse(localStorage.getItem('thuchi_queue')) || []; uQ.shift();
                localStorage.setItem('thuchi_queue', JSON.stringify(uQ)); 
                this.taiHoatDongHomNay(); 
            }
        }).catch(() => console.warn(`Đơn ${currentItem.hoaDon} đợi mạng.`))
        .finally(() => {
            this.isSyncing = false;
            if ((JSON.parse(localStorage.getItem('thuchi_queue')) || []).length > 0) setTimeout(() => this.processQueue(), 500);
        });
    }
};
ThuChiModule.init();
