const R199kModule = {
    // ⚠️ LINK APPS SCRIPT RIÊNG CỦA GOOGLE SHEET R199K
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzhh5Dzq2fuWK3zQPFB67DHf4QZE9efj0b2g6jQzsqUsXGK5hLnFgMSfdMt33hiyrAc/exec",
    THUCHI_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwNA4KT2HEPkCCeQu8ZHLhapDREaNyOUHh9UcleiA6HrxVzLOfNRLpkEDj7zLRJ79kYsQ/exec",
    mode: 'NEW', // Mặc định là Đăng ký mới
    searchId: 0,

    init: function() {
        // Đặt ngày bắt đầu mặc định là ngày hôm nay dạng YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('r-start').value = today;
        
        // Cập nhật tiền, ngày kết thúc và khởi tạo trạng thái hiển thị ban đầu
        this.tựĐộngSinhGid(); 
        this.tínhNgàyKếtThúc();

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

        // 3. Khi chọn lại ngày bắt đầu -> Tính toán lại và đồng bộ cột phải
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
            inputGid.placeholder = "Nhập GID cần gia hạn (Ví dụ: G2603060)";
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

    tựĐộngTìmKiếmKháchHàng: function(type = 'GID') {
        if (this.mode !== 'RENEW') return; 

        if (this.isAutofilling) return; 

        let url = `${this.WEB_APP_URL}?action=GET_USER`;
        const inputGid = document.getElementById('r-gid');
        const inputName = document.getElementById('r-name');
        const inputGmail = document.getElementById('r-gmail');
        const selectGoi = document.getElementById('r-goi');
        
        let keyword = "";
        if (type === 'GID') {
            keyword = inputGid.value.trim().toUpperCase();
            if (keyword.length < 5) return; 
            url += `&gid=${encodeURIComponent(keyword)}`;
        } else {
            keyword = inputName.value.trim();
            if (keyword.length < 3) return; 
            url += `&name=${encodeURIComponent(keyword)}`;
        }

        const currentSearchId = ++this.searchId;

        fetch(url)
        .then(response => response.json())
        .then(res => {
            if (currentSearchId !== this.searchId) return;
            if (res.status === "success") {

                this.isAutofilling = true;

                if (type === 'GID') {
                    inputName.value = res.data.name;
                } else {
                    inputGid.value = res.data.gid;
                }
                
                inputGmail.value = res.data.gmail;
                
                if (res.data.goi) {
                     selectGoi.value = res.data.goi;
                }
                
                // Đồng bộ tính toán lại ngày kết thúc và ép hiển thị ngay sang cột phải
                this.tínhNgàyKếtThúc(); 
                
                NotiModule.show(`Đã tìm thấy khách hàng: ${res.data.name}!`, "success");

                setTimeout(() => { this.isAutofilling = false; }, 100);
            } else if (res.status === "not_found") {
                NotiModule.show(`Không tìm thấy khách hàng với thông tin: ${keyword}`, "error");
            }
        })
        .catch(err => {
            console.log("Lỗi tìm kiếm ngầm: ", err);
            this.isAutofilling = false; 
        });
    },


taiDanhSachThanhVienTheoUser: function() {
    const container = document.getElementById('r199k-member-container');
    if (!container) return;

    const cacheKey = 'r199k_members_cache';
    const cacheTimeKey = 'r199k_members_cache_time';
    const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 phút

    // Hàm render giao diện tối ưu (Gom DOM Fragment + Event Delegation)
    const renderGiaoDienSieuToc = (data) => {
        const fragment = document.createDocumentFragment();
        data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'member-item';
            itemDiv.setAttribute('data-gid', item.gid);
            itemDiv.innerHTML = `
                <div class="member-item-info" data-gid="${item.gid}">
                    <span class="member-item-name r-click-name" style="cursor: pointer;" data-action="view-history" data-gid="${item.gid}">${item.name}</span>
                    <span class="member-item-gid" data-gid="${item.gid}">${item.gid}</span>
                </div>
                <span class="member-item-badge" data-gid="${item.gid}">${item.goi}</span>
            `;
            fragment.appendChild(itemDiv);
        });
        container.innerHTML = ''; 
        container.appendChild(fragment);

        container.onclick = (e) => {
            const target = e.target;
            const gid = target.getAttribute('data-gid');
            if (!gid) return;

            if (target.getAttribute('data-action') === 'view-history') {
                e.stopPropagation();
                if (typeof RenewalModule !== 'undefined' && typeof RenewalModule.hienThiLichSuGiaHan === 'function') {
                    RenewalModule.hienThiLichSuGiaHan(gid);
                } else {
                    NotiModule.show(`Lịch sử: ${target.innerText} (${gid})`, "success");
                }
            } else {
                const inputGid = document.getElementById('r-gid');
                if (inputGid) { inputGid.value = gid; this.tựĐộngTìmKiếmKháchHàng('GID'); }
            }
        };
    };

    // Hàm gọi API đồng bộ mạng thực tế và cập nhật đè vào cache cứng
    const taiDuLieuMoiTuMang = (isBackground = false) => {
        if (this.isSubmittingMembers) return;
        this.isSubmittingMembers = true;

        if (!isBackground) container.innerHTML = '<div class="member-empty-state">🔄 Đang tải dữ liệu mạng...</div>';

        fetch(`${this.WEB_APP_URL}?action=GET_MEMBERS`)
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(res => {
            if (res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
                // Đóng dấu cục cache mới tinh vào máy
                localStorage.setItem(cacheKey, JSON.stringify(res.data));
                localStorage.setItem(cacheTimeKey, Date.now().toString());
                
                // Vẽ lại giao diện theo dữ liệu mới
                renderGiaoDienSieuToc(res.data);
                
                if (isBackground && typeof NotiModule !== 'undefined') {
                    NotiModule.show("Hệ thống đã tự động cập nhật dữ liệu mới tinh!", "success");
                }
            } else if (!isBackground) {
                container.innerHTML = '<div class="member-empty-state">Chưa có thành viên nào.</div>';
            }
        })
        .catch(err => {
            console.error("Lỗi tải mạng:", err);
            if (!isBackground) container.innerHTML = '<div class="member-empty-state">❌ Không thể tải danh sách.</div>';
        })
        .finally(() => {
            this.isSubmittingMembers = false;
        });
    };

    // ==========================================================================
    // LOGIC XỬ LÝ CACHE THÔNG MINH CHO THIẾT BỊ MOBILE
    // ==========================================================================
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    const now = Date.now();

    if (cachedData && cachedTime) {
        const parsedCache = JSON.parse(cachedData);
        
        // BƯỚC 1: Lập tức lôi dữ liệu cũ ra vẽ lên màn hình luôn (Tải tức thì 0ms cho mobile đỡ lag)
        renderGiaoDienSieuToc(parsedCache);

        // BƯỚC 2: Kiểm tra xem thời gian cache đã quá 5 phút chưa
        if (now - cachedTime > CACHE_TIMEOUT) {
            // Nếu quá 5 phút, tiến hành quét mới công khai
            taiDuLieuMoiTuMang(false);
        } else {
            // BƯỚC 3: NÚT THẮT QUYẾT ĐỊNH: Nếu chưa quá 5 phút, âm thầm gọi API chạy ngầm để kiểm tra đơn mới
            fetch(`${this.WEB_APP_URL}?action=GET_MEMBERS_COUNT`) // Hãy tạo tác vụ phụ này ở Backend nếu cần, hoặc gọi thẳng link gốc dạng nhẹ
            .then(r => r.json())
            .then(res => {
                // Kiểm tra xem số lượng phần tử trên Sheets trả về có khác với độ dài cục cache hiện tại không
                if (res.status === "success" && res.count !== parsedCache.length) {
                    console.log("🔔 Phát hiện có thành viên mới hoặc cập nhật mới trên Sheets! Tiến hành đồng bộ ngầm...");
                    taiDuLieuMoiTxTuMang(true); // Gọi cập nhật ngầm đè giao diện
                }
            }).catch(() => {
                // Nếu Backend không có hàm GET_MEMBERS_COUNT, ta fetch ngầm luôn link gốc để check dữ liệu
                fetch(`${this.WEB_APP_URL}?action=GET_MEMBERS`)
                .then(r => r.json())
                .then(res => {
                    if (res.status === "success" && res.data && res.data.length !== parsedCache.length) {
                        localStorage.setItem(cacheKey, JSON.stringify(res.data));
                        localStorage.setItem(cacheTimeKey, Date.now().toString());
                        renderGiaoDienSieuToc(res.data);
                    }
                });
            });
        }
    } else {
        // Nếu trong máy hoàn toàn chưa có cache, bắt buộc tải công khai lần đầu
        taiDuLieuMoiTuMang(false);
    }
},



    
tínhNgàyKếtThúc: function() {
        const ngàyBắtĐầuValue = document.getElementById('r-start').value;
        const gói = document.getElementById('r-goi').value;
        const inputEnd = document.getElementById('r-end');
        const inputTien = document.getElementById('r-tien');

        if (!ngàyBắtĐầuValue) {
            inputEnd.value = "";
            return;
        }

        // Tạo bản sao đối tượng Date để không ghi đè ngày bắt đầu
        let date = new Date(ngàyBắtĐầuValue);
        
        if (gói === '1 THÁNG') {
            date.setMonth(date.getMonth() + 1);
            
            // ĐỔI SỬA Ở ĐÂY: Định dạng thành DD/MM/YYYY
            let day = String(date.getDate()).padStart(2, '0');
            let month = String(date.getMonth() + 1).padStart(2, '0');
            let year = date.getFullYear();
            inputEnd.value = `${day}/${month}/${year}`; 
            
            inputTien.value = "199000"; 
        } else if (gói === '3 THÁNG') {
            date.setMonth(date.getMonth() + 3);
            
            // ĐỔI SỬA Ở ĐÂY: Định dạng thành DD/MM/YYYY
            let day = String(date.getDate()).padStart(2, '0');
            let month = String(date.getMonth() + 1).padStart(2, '0');
            let year = date.getFullYear();
            inputEnd.value = `${day}/${month}/${year}`;
            
            inputTien.value = "500000";
        } else {
            inputEnd.value = "HỦY NGAY";
            inputTien.value = "0";
        }

        // KÍCH HOẠT ĐỒNG BỘ: Cập nhật real-time sang cột bên phải ngay khi tính xong ngày
        this.capNhatKhungChamSocKhachHang();
    },


capNhatKhungChamSocKhachHang: function() {
        const gid = document.getElementById('r-gid').value || 'TỰ ĐỘNG SINH';
        const name = document.getElementById('r-name').value.trim() || 'Chưa nhập tên';
        const goi = document.getElementById('r-goi').value;
        const startVal = document.getElementById('r-start').value; // Định dạng HTML5: YYYY-MM-DD
        const endVal = document.getElementById('r-end').value;     // Đã đổi thành định dạng: DD/MM/YYYY
        const tienVal = document.getElementById('r-tien').value || 0;

        // Cập nhật Dòng 1: Mã GID ( Tên Khách Hàng )
        document.getElementById('display-customer-info').innerText = `${gid} ( ${name} )`;

        // Định dạng ngày bắt đầu từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị đẹp mắt
        let startFormatted = '--/--/----';
        if (startVal) {
            const [y, m, d] = startVal.split('-');
            startFormatted = `${d}/${m}/${y}`;
        }

        // 🌟 FIX TẠI ĐÂY: Vì endVal hiện tại đã là DD/MM/YYYY, không cần convert lại nữa
        let endFormatted = '--/--/----';
        let endDateObj = null;

        if (endVal && endVal !== "HỦY NGAY") {
            endFormatted = endVal; // Lấy trực tiếp chuỗi DD/MM/YYYY để hiển thị luôn
            
            // Tách chuỗi DD/MM/YYYY để tạo đối tượng Date phục vụ tính toán số ngày còn lại
            const parts = endVal.split('/');
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1; // Tháng trong JS chạy từ 0 - 11
            const y = parseInt(parts[2], 10);
            endDateObj = new Date(y, m, d);
        } else if (endVal === "HỦY NGAY") {
            endFormatted = "HỦY NGAY";
        }

        // 🌟 FIX TẠI ĐÂY: Tính số ngày còn lại thực tế từ HÔM NAY đến NGÀY KẾT THÚC
        let diffDays = 0;
        if (endDateObj) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đưa mốc hôm nay về 00:00:00 để tính chính xác theo ngày
            
            // Tính khoảng cách thời gian giữa ngày kết thúc và hôm nay
            const diffTime = endDateObj - today;
            // Đổi ra số ngày (nếu âm tức là đã quá hạn)
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) diffDays = 0; 
        }

        // Cập nhật Dòng 2: Khung thông tin gia hạn thanh toán nhóm
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
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        const h = String(now.getHours()).padStart(2, "0");
        const i = String(now.getMinutes()).padStart(2, "0");
        const s = String(now.getSeconds()).padStart(2, "0");
        const rand = Math.floor(Math.random() * 900 + 100);
        return `HD${y}${m}${d}${h}${i}${s}${rand}`;
    },

    guiThuChi: function(hoaDon, name, goi, tien) {
        fetch(this.THUCHI_WEB_APP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: JSON.stringify({
                hoaDon: hoaDon,
                khachHang: name,
                ghiChu: goi,
                loaiGd: "R-199",
                soTien: Number(tien),
                mode: "THU TIỀN",
                adminName: UserModule.uName || "ADMIN"
            })
        })
        .catch(err => console.log("Lỗi ghi Thu Chi:", err));
    },

    submitR199k: function() {
        const gid = document.getElementById('r-gid').value.trim().toUpperCase();
        const name = document.getElementById('r-name').value.trim();
        const gmail = document.getElementById('r-gmail').value.trim();
        const goi = document.getElementById('r-goi').value;
        const start = document.getElementById('r-start').value;
        const end = document.getElementById('r-end').value;
        const tien = document.getElementById('r-tien').value;
        const hoaDon = this.taoHoaDon();

        if (this.mode === 'RENEW' && (!gid || gid === "TỰ ĐỘNG SINH")) {
            NotiModule.show("Vui lòng gõ mã GID để tìm kiếm khách hàng gia hạn!", "error");
            return;
        }
        if (!name) { NotiModule.show("Vui lòng gõ tên khách hàng!", "error");  return; }

        const btn = document.getElementById('btn-add-r199k');
        btn.innerText = "ĐANG ĐỒNG BỘ...";
        btn.disabled = true;

        const payload = {
            action: this.mode,
            gid: gid,
            name: name,
            gmail: gmail,
            goi: goi,
            start: start,
            end: end,
            tien: tien,
            hoaDon: hoaDon,
            adminName: UserModule.uName || "ADMIN"
        };

fetch(this.WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(res => {
            if (res.status === "success") {
                this.guiThuChi(hoaDon, name, goi, tien);
                NotiModule.show(`Đã đồng bộ thành viên vào bảng R-199K thành công!`, "success");

                // ==========================================================================
                // ĐÃ THÊM: Đập tan bộ nhớ đệm cũ để bắt ép Mobile tải lại danh sách mới tinh
                // ==========================================================================
                localStorage.removeItem('r199k_members_cache');
                localStorage.removeItem('r199k_members_cache_time');

                // Reset form dữ liệu nhập
                document.getElementById("r-name").value = "";
                document.getElementById("r-gmail").value = "";

                const today = new Date().toISOString().split("T")[0];
                document.getElementById("r-start").value = today;

                this.setMode("NEW");
                this.tựĐộngSinhGid();
                this.tínhNgàyKếtThúc();
            }
        })
        .finally(() => {
            btn.innerText = "NHẬP DỮ LIỆU BẢNG";
            btn.disabled = false;
        });
    }
};


document.addEventListener("DOMContentLoaded", () => {
    R199kModule.init();
});
