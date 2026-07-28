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
        // Thay đổi hiển thị tiêu đề để nhân viên biết đây là danh sách tổng của toàn bộ hệ thống
        const lblAdmin = document.getElementById('lbl-current-admin');
        if (lblAdmin) lblAdmin.innerText = "TẤT CẢ THÀNH VIÊN";
        
        const container = document.getElementById('r199k-member-container');
        container.innerHTML = '<div class="member-empty-state">🔄 Đang tải dữ liệu...</div>';

        // [ĐÃ SỬA] Loại bỏ tham số lọc &adminName để Backend Apps Script quét và trả về toàn bộ dữ liệu bảng
        const url = `${this.WEB_APP_URL}?action=GET_MEMBERS`;

        fetch(url)
        .then(response => response.json())
        .then(res => {
            if (res.status === "success" && res.data && res.data.length > 0) {
                container.innerHTML = ''; // Xóa dòng trạng thái chờ
                
                res.data.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'member-item';
                    itemDiv.innerHTML = `
                        <div class="member-item-info">
                            <span class="member-item-name">${item.name}</span>
                            <span class="member-item-gid">${item.gid}</span>
                        </div>
                        <span class="member-item-badge">${item.goi}</span>
                    `;
                    
                    // Sự kiện tương tác tiện ích: Click vào khách hàng trong danh sách sẽ tự điền nhanh vào form để gia hạn luôn
                    itemDiv.addEventListener('click', () => {
                        document.getElementById('r-gid').value = item.gid;
                        this.tựĐộngTìmKiếmKháchHàng('GID');
                    });
                    
                    container.appendChild(itemDiv);
                });
            } else {
                container.innerHTML = '<div class="member-empty-state">Chưa có thành viên nào trong hệ thống.</div>';
            }
        })
        .catch(err => {
            console.error("Lỗi tải danh sách thành viên:", err);
            container.innerHTML = '<div class="member-empty-state">❌ Không thể tải danh sách.</div>';
        });
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
            inputEnd.value = date.toISOString().split('T')[0]; // Định dạng chuẩn YYYY-MM-DD
            inputTien.value = "199000"; // Đổi số tiền thành 199.000đ theo yêu cầu mẫu văn bản
        } else if (gói === '3 THÁNG') {
            date.setMonth(date.getMonth() + 3);
            inputEnd.value = date.toISOString().split('T')[0]; // Định dạng chuẩn YYYY-MM-DD
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
        const startVal = document.getElementById('r-start').value;
        const endVal = document.getElementById('r-end').value;
        const tienVal = document.getElementById('r-tien').value || 0;

        // Cập nhật Dòng 1: Mã GID ( Tên Khách Hàng )
        document.getElementById('display-customer-info').innerText = `${gid} ( ${name} )`;

        // Định dạng ngày bắt đầu từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị đẹp mắt
        let startFormatted = '--/--/----';
        if (startVal) {
            const [y, m, d] = startVal.split('-');
            startFormatted = `${d}/${m}/${y}`;
        }

        // Định dạng ngày kết thúc từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị đẹp mắt
        let endFormatted = '--/--/----';
        if (endVal && endVal !== "HỦY NGAY") {
            const [y, m, d] = endVal.split('-');
            endFormatted = `${d}/${m}/${y}`;
        } else if (endVal === "HỦY NGAY") {
            endFormatted = "HỦY NGAY";
        }

        // [ĐÃ SỬA LỖI TÍNH NGÀY] Tính số ngày còn lại thực tế giữa ngày kết thúc và bắt đầu
        let diffDays = 0;
        if (startVal && endVal && endVal !== "HỦY NGAY") {
            const date1 = new Date(startVal);
            const date2 = new Date(endVal);
            const diffTime = Math.abs(date2 - date1);
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
