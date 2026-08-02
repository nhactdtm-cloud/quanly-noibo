const R199kModule = {
    // 🌟 ĐÃ SỬA: Điền chính xác link tên miền Firebase Singapore của dự án, KHÔNG CÓ DẤU / Ở CUỐI
    FB_URL: "https://noibo-nhactdtm-default-rtdb.asia-southeast1.firebasedatabase.app/", 
    FB_KEY: "", // Để trống nếu Firebase của bạn cấu hình Rules là public công khai
    mode: 'NEW', searchId: 0, isSubmitting: false, isAutofilling: false, isSubmittingMembers: false, currentGhiChu: "",

    // ĐÃ XÓA: Dòng khai báo searchId: 0 bị trùng lặp ở đây để chống lỗi crash code

    init: function() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('r-start').value = today;
        
        // Cập nhật tiền, ngày kết thúc và khởi tạo trạng thái hiển thị ban đầu
        this.tựĐộngSinhGid(); 
        this.tínhNgàyKếtThúc();

        // 1. Khi gõ tên khách hàng -> Sinh mã GID và đẩy ngay lập tức sang cột phải


        // [SỬA LỖI ĐỒNG BỘ MÃ GID LIÊN TỤC]
        
        // 1. Khi gõ tên khách hàng -> Sinh mã GID và đẩy ngay lập tức sang cột phải
        document.getElementById('r-name').addEventListener('input', () => {
            if (this.mode === 'NEW') {
                this.tựĐộngSinhGid(); 
            } else {
                this.tựĐộngTìmKiếmKháchHàng('NAME'); 
            }
            // Ép buộc cột phải cập nhật lại Mã GID vừa sinh
            this.capNhatKhungChamSocKhachHang(); 
        });

        // 2. Khi chọn lại gói -> Cập nhật tiền, ngày kết thúc và đồng bộ cột phải
        document.getElementById('r-goi').addEventListener('change', () => {
            this.tínhNgàyKếtThúc();
        });

        document.getElementById('r-start').addEventListener('change', () => {
            this.tínhNgàyKếtThúc();
        });

        // 4. Gắn sự kiện cho các nút chuyển Tab ĐĂNG KÝ MỚI / GIA HẠN
        document.getElementById('r-s-new').addEventListener('click', () => this.setMode('NEW'));
        document.getElementById('r-s-renew').addEventListener('click', () => this.setMode('RENEW'));
        
        // 4.5. Khi gõ hoặc sửa mã GID ở tab Gia Hạn -> Tự động truy vấn và đồng bộ sang cột phải
        document.getElementById('r-gid').addEventListener('input', () => {
            this.tựĐộngTìmKiếmKháchHàng();
            this.capNhatKhungChamSocKhachHang(); 
        });

        // 5. Gắn sự kiện cho nút Submit dữ liệu
        document.getElementById('btn-add-r199k').addEventListener('click', () => this.submitR199k());

        // [GIỮ LẠI ĐÂY] Kích hoạt tính năng Click-to-Copy cho các khối dữ liệu
        this.dangKySuKienCopy();

        // Ẩn tùy chọn hủy đăng ký ở chế độ Đăng ký mới
        if (document.getElementById('opt-cancel')) {
            document.getElementById('opt-cancel').style.display = 'none';
        }
    },


    setMode: function(action) {
        this.mode = action;
        const bNew = document.getElementById('r-s-new');
        const bRenew = document.getElementById('r-s-renew');
        const inputGid = document.getElementById('r-gid');
        const optCancel = document.getElementById('opt-cancel'); 
        const selectGoi = document.getElementById('r-goi');

        // Các phần tử bọc cột bên phải
        const cskhGroup = document.getElementById('cskh-group');
        const memberListGroup = document.getElementById('member-list-group');

        bNew.className = bRenew.className = 'seg-btn';
        
        if (action === 'NEW') {
            bNew.classList.add('active', 'thu');
            inputGid.readOnly = true;
            
            // Hiện Chăm sóc khách hàng - Ẩn danh sách thành viên
            if (cskhGroup) cskhGroup.classList.remove('d-none');
            if (memberListGroup) memberListGroup.classList.add('d-none');
            
            if (optCancel) optCancel.style.display = 'none';
            if (selectGoi.value === 'Hủy ĐK') {
                selectGoi.value = '1 THÁNG';
            }
            this.tựĐộngSinhGid(); 
        } else {
            bRenew.classList.add('active', 'chi');
            inputGid.value = "";
            inputGid.placeholder = "🔍︎ Tìm kiếm bằng GID";
            inputGid.readOnly = false;
            
            // Ẩn Chăm sóc khách hàng - Hiện danh sách thành viên
            if (cskhGroup) cskhGroup.classList.add('d-none');
            if (memberListGroup) memberListGroup.classList.remove('d-none');
            
            if (optCancel) optCancel.style.display = 'block';

            // Kích hoạt gọi nạp dữ liệu danh sách thành viên của nhân viên này
            this.taiDanhSachThanhVienTheoUser();
        }
        this.tínhNgàyKếtThúc(); 
    },


    tựĐộngSinhGid: function () {
        if (this.mode !== "NEW") return;

        const nameInput = document.getElementById("r-name").value.trim();
        const inputGid = document.getElementById("r-gid");

        if (nameInput === "") {
            inputGid.value = "TỰ ĐỘNG SINH";
            return;
        }

        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, "0");

        // Lấy 6 số cuối của thời gian hiện tại
        const seq = Date.now().toString().slice(-6);

        // Tạo thêm 2 số ngẫu nhiên để chống trùng lặp dữ liệu tuyệt đối
        const rand = Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, "0");

        // Gán mã GID mới vào ô nhập liệu bên trái
        inputGid.value = `G${yy}${mm}${seq}${rand}`;
    },

    tựĐộngTìmKiếmKháchHàng(type = 'GID') {
        if (this.mode !== 'RENEW' || this.isAutofilling) return;
        const iG = document.getElementById('r-gid'), iN = document.getElementById('r-name'), iGm = document.getElementById('r-gmail'), sG = document.getElementById('r-goi');
        let kw = type === 'GID' ? iG.value.trim().toUpperCase() : iN.value.trim(); if ((type === 'GID' && kw.length < 5) || (type === 'NAME' && kw.length < 3)) return;

        const cId = ++this.searchId, cleanUrl = this.FB_URL.replace(/\/$/, '');
        fetch(`${cleanUrl}/r199k_members.json${this.FB_KEY ? '?auth='+this.FB_KEY : ''}`)
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (cId !== this.searchId || !res) return;
            
            // 🌟 GIẢI NÉN CẤU TRÚC LỒNG: Biến đổi tất cả các hóa đơn nằm bên trong mọi GID thành mảng phẳng dạng dòng
            let allInvoices = [];
            Object.keys(res).forEach(gidKey => {
                if (res[gidKey] && typeof res[gidKey] === 'object') {
                    Object.values(res[gidKey]).forEach(inv => { if(inv && inv.gid) allInvoices.push(inv); });
                }
            });

            // Tìm tất cả các dòng giao dịch của khách hàng này
            let customerRows = allInvoices.filter(i => type === 'GID' ? (i.gid || '').toUpperCase() === kw : (i.name || '').toLowerCase().includes(kw.toLowerCase()));
            if (customerRows.length > 0) {
                // Sắp xếp lấy dòng giao dịch có mã hóa đơn mới nhất (mã HD tạo theo thời gian thực nên HD lớn hơn sẽ mới hơn)
                customerRows.sort((a, b) => (b.hoaDon || '').localeCompare(a.hoaDon || ''));
                let found = customerRows[0];

                this.currentGhiChu = found.ghiChu || ""; this.isAutofilling = true;
                type === 'GID' ? (iN.value = found.name) : (iG.value = found.gid);
                iGm.value = found.gmail || ""; if (found.goi) sG.value = found.goi; this.tínhNgàyKếtThúc();
                NotiModule.show(`Đã tìm thấy: ${found.name}!`, "success"); setTimeout(() => this.isAutofilling = false, 100);
            } else if (type === 'GID') { NotiModule.show(`Không thấy khách hàng: ${kw}`, "error"); }
        }).catch(e => { console.log("Lỗi:", e); this.isAutofilling = false; });
    },



    taiDanhSachThanhVienTheoUser: function() {
        const container = document.getElementById('r199k-member-container'); if (!container) return;
        const cleanUrl = this.FB_URL.replace(/\/$/, '');
        if (this.memberEventSource) this.memberEventSource.close();
        this.memberEventSource = new EventSource(`${cleanUrl}/r199k_members.json${this.FB_KEY ? '?auth='+this.FB_KEY : ''}`);

        const applyFilterData = (data) => {
            const f = document.getElementById('filterStatus'); if (!f) return data;
            return data.filter(item => { const g = (item.goi || '').trim(); return f.value === "ALL" ? true : f.value === "REGISTERED" ? (g.includes("THÁNG") || !g.includes("Hủy")) : g.includes("Hủy"); });
        };

        const renderGiaoDienSieuToc = (data) => {
            const filteredData = applyFilterData(data), fragment = document.createDocumentFragment();
            filteredData.forEach(item => {
                const itemDiv = document.createElement('div'); itemDiv.className = 'member-item'; itemDiv.setAttribute('data-gid', item.gid);
                itemDiv.innerHTML = `<div class="member-item-info" data-gid="${item.gid}"><span class="member-item-name r-click-name" style="cursor: pointer;" data-action="view-history" data-gid="${item.gid}">${item.name}</span><span class="member-item-gid" data-gid="${item.gid}">${item.gid}</span></div><span class="member-item-badge" data-gid="${item.gid}">${item.goi}</span>`;
                fragment.appendChild(itemDiv);
            });
            container.innerHTML = ''; if (filteredData.length === 0) { container.innerHTML = '<div class="member-empty-state">Không có thành viên nào phù hợp bộ lọc.</div>'; return; }
            container.appendChild(fragment);
            container.onclick = (e) => {
                const target = e.target, gid = target.getAttribute('data-gid'); if (!gid) return;
                if (target.getAttribute('data-action') === 'view-history') {
                    e.stopPropagation(); if (typeof RenewalModule !== 'undefined' && typeof RenewalModule.hienThiLichSuGiaHan === 'function') RenewalModule.hienThiLichSuGiaHan(gid);
                } else { const inputGid = document.getElementById('r-gid'); if (inputGid) { inputGid.value = gid; this.tựĐộngTìmKiếmKháchHàng('GID'); } }
            };
        };

        const filterElement = document.getElementById('filterStatus'); if (filterElement) filterElement.onchange = () => { if(this.cachedMembers) renderGiaoDienSieuToc(this.cachedMembers); };

        this.memberEventSource.addEventListener('put', (e) => {
            const res = JSON.parse(e.data); if (!res) return;
            
            if (res.path !== "/") {
                const parts = res.path.split('/'); const targetGid = parts, targetHd = parts;
                if (!targetGid) return; if (!this.rawFbMembers) this.rawFbMembers = {};
                if (res.data === null) {
                    if (targetHd && this.rawFbMembers[targetGid]) delete this.rawFbMembers[targetGid][targetHd];
                    if (!targetHd || Object.keys(this.rawFbMembers[targetGid] || {}).length === 0) delete this.rawFbMembers[targetGid];
                } else {
                    if (!this.rawFbMembers[targetGid]) this.rawFbMembers[targetGid] = {};
                    targetHd ? (this.rawFbMembers[targetGid][targetHd] = res.data) : (this.rawFbMembers[targetGid] = res.data);
                }
            } else { this.rawFbMembers = res.data || {}; }

            let allInvoices = [];
            Object.keys(this.rawFbMembers).forEach(gid => {
                if (this.rawFbMembers[gid]) {
                    let invs = Object.values(this.rawFbMembers[gid]).filter(inv => inv && inv.gid && inv.hoaDon);
                    if (invs.length > 0) { 
                        // Sắp xếp các hóa đơn bên trong của 1 khách hàng lấy đơn mới nhất
                        invs.sort((a, b) => (b.hoaDon || '').localeCompare(a.hoaDon || '')); 
                        allInvoices.push(invs[0]); 
                    }
                }
            });

            // 🌟 ĐÃ FIX: Sắp xếp toàn sàn danh sách khách hàng - Khách có hóa đơn mới nhất bay lên đầu bảng lập tức
            allInvoices.sort((a, b) => (b.hoaDon || '').localeCompare(a.hoaDon || ''));

            this.cachedMembers = allInvoices; renderGiaoDienSieuToc(allInvoices);
        });

    },



refreshRenewList: function () {
    localStorage.removeItem('r199k_members_cache');
    localStorage.removeItem('r199k_members_cache_time');

    this.taiDanhSachThanhVienTheoUser();
},


    tínhNgàyKếtThúc: function() {
        const ngàyBắtĐầuValue = document.getElementById('r-start').value;
        const gói = document.getElementById('r-goi').value;
        const inputEnd = document.getElementById('r-end');
        const inputTien = document.getElementById('r-tien');

        if (this.mode === 'NEW') { const oC = document.getElementById('opt-cancel'); if (oC) oC.remove(); } 
        else if (this.mode === 'RENEW' && !document.getElementById('opt-cancel')) {
            const sG = document.getElementById('r-goi'); if (sG) { const opt = new Option('HỦY ĐĂNG KÝ', 'Hủy ĐK'); opt.id = 'opt-cancel'; sG.add(opt); }
        }

        if (!gói || gói === "" || (this.mode === 'NEW' && gói === 'Hủy ĐK') || !ngàyBắtĐầuValue || ngàyBắtĐầuValue.trim() === "") {
            if (inputEnd) inputEnd.value = ""; if (inputTien) inputTien.value = "0"; if (this.mode === 'NEW' && gói === 'Hủy ĐK') document.getElementById('r-goi').value = "";
            this.ngayConLaiThucTe = 0; this.capNhatKhungChamSocKhachHang(); return;
        }

        let date = new Date(ngàyBắtĐầuValue); if (isNaN(date.getTime())) { if (inputEnd) inputEnd.value = ""; this.ngayConLaiThucTe = 0; return; }
        const địnhDạngKiểuLịch = (dObj) => `ngày ${dObj.getDate()} thg ${dObj.getMonth() + 1}, ${dObj.getFullYear()}`;
        
        if (gói === '1 THÁNG') { date.setMonth(date.getMonth() + 1); if (inputEnd) inputEnd.value = địnhDạngKiểuLịch(date); if (inputTien) inputTien.value = "199000"; } 
        else if (gói === '3 THÁNG') { date.setMonth(date.getMonth() + 3); if (inputEnd) inputEnd.value = địnhDạngKiểuLịch(date); if (inputTien) inputTien.value = "500000"; } 
        else if (gói === 'Hủy ĐK') { if (inputEnd) inputEnd.value = "HỦY NGAY"; if (inputTien) inputTien.value = "0"; }

        // 🌟 TÍNH SỐ NGÀY CÒN LẠI THỰC TẾ ĐỂ ĐẨY LÊN FIREBASE
        let diffDays = 0;
        if (gói !== 'Hủy ĐK') {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const diffTime = date - today; diffDays = Math.ceil(diffTime / 86400000);
            if (diffDays < 0) diffDays = 0;
        }
        this.ngayConLaiThucTe = diffDays; // Gán vào biến của module

        this.capNhatKhungChamSocKhachHang();
    },



    capNhatKhungChamSocKhachHang: function() {
        const gid = document.getElementById('r-gid').value || 'TỰ ĐỘNG SINH';
        const name = document.getElementById('r-name').value.trim() || 'Chưa nhập tên';
        const goi = document.getElementById('r-goi').value;
        const startVal = document.getElementById('r-start').value; // Định dạng HTML5: YYYY-MM-DD
        const endVal = document.getElementById('r-end').value;     
        const tienVal = document.getElementById('r-tien').value || 0;

        // Cập nhật Dòng 1: Mã GID ( Tên Khách Hàng )
        document.getElementById('display-customer-info').innerText = `${gid} ( ${name} )`;

        // 1. Định dạng Ngày bắt đầu (Luôn đảm bảo ra DD/MM/YYYY)
        let startFormatted = '--/--/----';
        if (startVal) {
            const [y, m, d] = startVal.split('-');
            startFormatted = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
        }

        // 2. SỬA ĐỊNH DẠNG LỊCH SAI & TÍNH NGÀY CÒN LẠI
        let endFormatted = '--/--/----';
        let endDateObj = null;

        if (endVal && endVal !== "HỦY NGAY") {
            // Dùng Regex trích xuất tất cả các cụm số bất kể chuỗi là "ngày 29 thg 8, 2026" hay "29/08/2026"
            const parts = endVal.match(/\d+/g);
            
            if (parts && parts.length >= 3) {
                const d = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10); // Tháng thực tế (1 - 12)
                const y = parseInt(parts[2], 10);
                
                // Ép lịch hiển thị quay trở lại dạng số truyền thống DD/MM/YYYY 
                const dayStr = String(d).padStart(2, '0');
                const monthStr = String(m).padStart(2, '0');
                endFormatted = `${dayStr}/${monthStr}/${y}`;
                
                // Khởi tạo đối tượng Date phục vụ tính toán (tháng trong JS trừ đi 1)
                endDateObj = new Date(y, m - 1, d);
            } else {
                endFormatted = endVal;
            }
        } else if (endVal === "HỦY NGAY") {
            endFormatted = "HỦY NGAY";
        }

        // 3. Tính số ngày còn lại thực tế từ HÔM NAY đến NGÀY KẾT THÚC
        let diffDays = 0;
        if (endDateObj && !isNaN(endDateObj.getTime())) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đưa mốc hôm nay về 00:00:00 để tính chính xác theo ngày
            
            const diffTime = endDateObj - today;
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) diffDays = 0; 
        }

        document.getElementById('lbl-goi').innerText = goi;
        document.getElementById('lbl-time').innerText = `${startFormatted} → ${endFormatted}`;
        document.getElementById('lbl-days').innerText = (goi === 'Hủy ĐK' || endVal === "HỦY NGAY") ? '0 ngày' : `${diffDays} ngày`;
        document.getElementById('lbl-tien').innerText = Number(tienVal).toLocaleString('vi-VN') + 'đ';
    },



    // HÀM MỚI: Đăng ký sự kiện Click là tự động sao chép văn bản
    dangKySuKienCopy: function() {
        // 1. Copy nhanh dữ liệu dòng Mã GID (Tên Khách Hàng)
        const copyGidBox = document.getElementById('copy-gid-box');
        if (copyGidBox) {
            copyGidBox.addEventListener('click', () => {
                const textToCopy = document.getElementById('display-customer-info').innerText;
                this.thucHienCopy(textToCopy, "Đã copy Mã GID & Tên khách hàng!");
            });
        }

        // 2. Copy nhanh toàn bộ khối văn bản "GIA HẠN THANH TOÁN NHÓM" gửi khách hàng
        const copyTextBox = document.getElementById('copy-text-box');
        if (copyTextBox) {
            copyTextBox.addEventListener('click', () => {
                const goi = document.getElementById('lbl-goi').innerText;
                const time = document.getElementById('lbl-time').innerText;
                const days = document.getElementById('lbl-days').innerText;
                const tien = document.getElementById('lbl-tien').innerText;

                const fullText = `GIA HẠN THANH TOÁN NHÓM\n• Gói: ${goi}\n• Thời gian: ${time}\n• Còn lại: ${days}\n• Số tiền: ${tien}`;
                this.thucHienCopy(fullText, "Đã copy mẫu văn bản gia hạn nhóm!");
            });
        }
    },

    // Hàm thực thi lệnh nạp chuỗi văn bản vào Clipboard hệ thống
    thucHienCopy: function(text, successMsg) {
        navigator.clipboard.writeText(text).then(() => {
            // Sử dụng hệ thống thông báo NotiModule có sẵn của bạn để hiển thị thay vì dùng alert thô sơ
            if (typeof NotiModule !== 'undefined') {
                NotiModule.show(successMsg, "success");
            } else {
                alert(successMsg);
            }
        }).catch(err => {
            console.error('Lỗi bộ nhớ đệm: ', err);
        });
    },

    taoHoaDon: function () { 
    return IdHoaDonModule.sinhMaDuyNhat(); 
},



    guiThuChi(hD, name, goi, tien) {
        if (goi === "Hủy ĐK") return Promise.resolve(); const cleanUrl = this.FB_URL.replace(/\/$/, ''); const bY = new Date();
        const thoiGianTao = bY.toLocaleDateString('vi-VN') + ' ' + bY.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        const ngayGiaoDich = bY.getFullYear() + '-' + String(bY.getMonth() + 1).padStart(2, '0') + '-' + String(bY.getDate()).padStart(2, '0');
        
        const payload = { hoaDon: hD, khachHang: name, ghiChu: goi, loaiGd: "R-199", soTien: Number(tien), mode: "THU TIỀN", adminName: (typeof UserModule !== 'undefined' ? UserModule.uName : "ADMIN"), thoiGian: thoiGianTao, ngayGiaoDich };
        return fetch(`${cleanUrl}/thuchi/${hD}.json${this.FB_KEY?'?auth='+this.FB_KEY:''}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(e => console.log("Lỗi ghi Thu Chi:", e));
    },


    // 🌟 HÀM SỬA ĐỔI: Tối ưu hóa luồng xử lý khi bấm nút nhập dữ liệu
    submitR199k: function() {
        if (this.isSubmitting) return; // Chặn bấm liên tiếp gây trùng đơn

        const gid = document.getElementById('r-gid').value.trim().toUpperCase();
        const name = document.getElementById('r-name').value.trim();
        const gmail = document.getElementById('r-gmail').value.trim();
        const goi = document.getElementById('r-goi').value;
        const start = document.getElementById('r-start').value;
        const end = document.getElementById('r-end').value;
        const tien = document.getElementById('r-tien').value;
        const hoaDon = this.taoHoaDon();
        const adminName = (typeof UserModule !== 'undefined' ? UserModule.uName : "ADMIN");

        if (this.mode === 'RENEW' && (!gid || gid === "TỰ ĐỘNG SINH")) {
            if (typeof NotiModule !== 'undefined') NotiModule.show("Vui lòng gõ mã GID để tìm kiếm khách hàng gia hạn!", "error");
            return;
        }
        if (!name) { 
            if (typeof NotiModule !== 'undefined') NotiModule.show("Vui lòng gõ tên khách hàng!", "error");  
            return; 
        }

    // 🔥 ĐOẠN BỔ SUNG MỚI: Chặn nếu chưa chọn gói đăng ký
    if (!goi || goi === "") {
        if (typeof NotiModule !== 'undefined') {
            NotiModule.show("Bạn chưa chọn gói đăng kí!", "error");
        } else {
            alert("Bạn chưa chọn gói đăng kí!");
        }
        document.getElementById('r-goi').focus();
        return;
    }

        const btn = document.getElementById('btn-add-r199k');
        const originalText = btn ? btn.innerText : "NHẬP DỮ LIỆU BẢNG";
        if (btn) {
            btn.innerText = "⏳ ĐANG ĐỒNG BỘ...";
            btn.disabled = true;
        }
        this.isSubmitting = true;

        const payload = { action: this.mode, gid, name, gmail, goi, start, end, tien, hoaDon, adminName, ngayConLai: this.ngayConLaiThucTe || 0 };
        const cleanUrl = this.FB_URL.replace(/\/$/, '');
        // 🌟 CẤU TRÚC LOG MỚI: Mỗi lần gia hạn tạo 1 node hóa đơn lồng bên trong mã GID (Không bị ghi đè)
        const targetUrl = `${cleanUrl}/r199k_members/${gid}/${hoaDon}.json${this.FB_KEY ? '?auth=' + this.FB_KEY : ''}`;

        fetch(targetUrl, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(res => {
            if (res) {
                this.guiThuChi(hoaDon, name, goi, tien).finally(() => {
                    if (typeof ThuChiModule !== "undefined" && typeof ThuChiModule.taiHoatDongHomNay === 'function')
                        ThuChiModule.taiHoatDongHomNay();

                    if (document.getElementById("r-name")) document.getElementById("r-name").value = "";
                    if (document.getElementById("r-gmail")) document.getElementById("r-gmail").value = "";
                    if (document.getElementById("r-goi")) document.getElementById("r-goi").value = "";
                    if (document.getElementById("r-start")) document.getElementById("r-start").value = new Date().toISOString().split("T")[0];

                    this.setMode("NEW"); this.tựĐộngSinhGid(); this.tínhNgàyKếtThúc();
                });
            } else {
                if (typeof NotiModule !== 'undefined') NotiModule.show("Lỗi cấu trúc phản hồi từ Firebase!", "error");
            }
        })
        .catch(err => {
            console.error("Lỗi đồng bộ hệ thống:", err);
            if (typeof NotiModule !== 'undefined') NotiModule.show("Mất kết nối mạng, vui lòng kiểm tra lại!", "error");
        })
        .finally(() => {
            this.isSubmitting = false; if (btn) { btn.innerText = originalText; btn.disabled = false; }
        });
    }

};

document.addEventListener("DOMContentLoaded", () => {
    R199kModule.init();
});
