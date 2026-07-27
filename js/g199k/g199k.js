const R199kModule = {
    // ⚠️ SAU NÀY BẠN SẼ ĐỔI ĐOẠN LINK APPS SCRIPT RIÊNG CỦA GOOGLE SHEET R199K VÀO ĐÂY
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzhh5Dzq2fuWK3zQPFB67DHf4QZE9efj0b2g6jQzsqUsXGK5hLnFgMSfdMt33hiyrAc/exec",
    mode: 'NEW', // Mặc định là Đăng ký mới
    searchId: 0,

    init: function() {
        // Đặt ngày bắt đầu mặc định là ngày hôm nay dạng YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('r-start').value = today;
        
        // Cập nhật tiền và ngày kết thúc dựa trên gói mặc định đang chọn ban đầu
        this.tínhNgàyKếtThúc();
        this.tựĐộngSinhGid(); 

        // [SỬA LỖI] ĐĂNG KÝ SỰ KIỆN LẮNG NGHE CHUẨN
        
        // 1. Khi gõ tên khách hàng
        document.getElementById('r-name').addEventListener('input', () => {
            if (this.mode === 'NEW') {
                this.tựĐộngSinhGid(); // Nếu đăng ký mới thì tự sinh GID [1]
            } else {
                this.tựĐộngTìmKiếmKháchHàng('NAME'); // Nếu gia hạn/hủy thì tự tìm kiếm theo Tên
            }
        });

        // 2. Khi chọn lại gói -> Cập nhật tiền và ngày kết thúc
        document.getElementById('r-goi').addEventListener('change', () => {
            this.tínhNgàyKếtThúc();
        });

        // 3. Khi chọn lại ngày bắt đầu -> Tính toán lại ngày kết thúc
        document.getElementById('r-start').addEventListener('change', () => {
            this.tínhNgàyKếtThúc();
        });

        // 4. Gắn sự kiện cho các nút chuyển Tab ĐĂNG KÝ MỚI / GIA HẠN
        document.getElementById('r-s-new').addEventListener('click', () => this.setMode('NEW'));
        document.getElementById('r-s-renew').addEventListener('click', () => this.setMode('RENEW'));
        
        // 4.5. Khi gõ mã GID ở tab Gia Hạn -> Tự động truy vấn tìm thông tin cũ để điền vào Form
        document.getElementById('r-gid').addEventListener('input', () => {
            this.tựĐộngTìmKiếmKháchHàng();
        });


        // 5. Gắn sự kiện cho nút Submit dữ liệu
        document.getElementById('btn-add-r199k').addEventListener('click', () => this.submitR199k());

        // Ẩn tùy chọn hủy đăng ký ngay khi trang web vừa tải xong ở chế độ Đăng ký mới
        if (document.getElementById('opt-cancel')) {
            document.getElementById('opt-cancel').style.display = 'none';
        }


    },

    setMode: function(action) {
        this.mode = action;
        const bNew = document.getElementById('r-s-new');
        const bRenew = document.getElementById('r-s-renew');
        const inputGid = document.getElementById('r-gid');
        const optCancel = document.getElementById('opt-cancel'); // Lấy thẻ option Hủy ĐK
        const selectGoi = document.getElementById('r-goi');

        bNew.className = bRenew.className = 'seg-btn';
        
        if (action === 'NEW') {
            bNew.classList.add('active', 'thu');
            inputGid.readOnly = true;
            
            // 🚫 ẨN tùy chọn Hủy Đăng Ký khi Đăng Ký Mới
            if (optCancel) optCancel.style.display = 'none';
            
            // Nếu vô tình đang chọn "Hủy ĐK" thì reset về gói mặc định "3 THÁNG"
            if (selectGoi.value === 'Hủy ĐK') {
                selectGoi.value = '3 THÁNG';
                this.tínhNgàyKếtThúc();
            }
            
            this.tựĐộngSinhGid(); // Sinh lại mã khi chuyển qua tab Mới
        } else {
            bRenew.classList.add('active', 'chi');
            inputGid.value = "";
            inputGid.placeholder = "Nhập GID cần gia hạn (Ví dụ: G2603060)";
            inputGid.readOnly = false;
            
            // ✨ HIỂN THỊ lại tùy chọn Hủy Đăng Ký khi sang tab Gia Hạn / Hủy
            if (optCancel) optCancel.style.display = 'block';
        }
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

    // 6 số cuối của thời gian hiện tại (mili giây)
    const seq = Date.now().toString().slice(-6);

    // 2 số ngẫu nhiên
    const rand = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");

    inputGid.value = `G${yy}${mm}${seq}${rand}`;
},

    tựĐộngTìmKiếmKháchHàng: function(type = 'GID') {
        if (this.mode !== 'RENEW') return; // Chỉ chạy ở tab Gia hạn / Hủy

        // Khóa tạm thời để tránh vòng lặp vô hạn khi điền dữ liệu tự động
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
                // Bật khóa bảo vệ trước khi gán giá trị vào các ô input
                this.isAutofilling = true;

                // Cập nhật dữ liệu thông minh: Không ghi đè lên ô người dùng đang gõ
                if (type === 'GID') {
                    inputName.value = res.data.name;
                } else {
                    inputGid.value = res.data.gid;
                }
                
                inputGmail.value = res.data.gmail;
                
                if (res.data.goi) {
                     selectGoi.value = res.data.goi;
                     this.tínhNgàyKếtThúc(); 
                }
                
            NotiModule.show(`Đã tìm thấy khách hàng: ${res.data.name}!`, "success");

            // Giải phóng khóa bảo vệ sau khi điền xong dữ liệu
            setTimeout(() => { this.isAutofilling = false; }, 100);
        } else if (res.status === "not_found") {
            // Bắn thông báo nếu Google Sheets phản hồi không có dữ liệu trùng khớp
            NotiModule.show(`Không tìm thấy khách hàng với thông tin: ${keyword}`, "error");
        }
    })
    .catch(err => {

            console.log("Lỗi tìm kiếm ngầm: ", err);
            this.isAutofilling = false; // Đảm bảo mở khóa nếu lỗi mạng
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
            inputEnd.value = date.toISOString().split('T')[0]; // [ĐÃ SỬA CHUẨN] Cắt chuỗi lấy YYYY-MM-DD
            inputTien.value = "200000";
        } else if (gói === '3 THÁNG') {
            date.setMonth(date.getMonth() + 3);
            inputEnd.value = date.toISOString().split('T')[0]; // [ĐÃ SỬA CHUẨN] Cắt chuỗi lấy YYYY-MM-DD
            inputTien.value = "500000";
        } else {
            inputEnd.value = "-";
            inputTien.value = "0";
        }
    },

    submitR199k: function() {
        const gid = document.getElementById('r-gid').value.trim().toUpperCase();
        const name = document.getElementById('r-name').value.trim();
        const gmail = document.getElementById('r-gmail').value.trim();
        const goi = document.getElementById('r-goi').value;
        const start = document.getElementById('r-start').value;
        const end = document.getElementById('r-end').value;
        const tien = document.getElementById('r-tien').value;

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
            adminName: "ADMIN"
        };

        fetch(this.WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(res => {
            if (res.status === "success") {
                NotiModule.show(`Đã đồng bộ thành viên vào bảng R-199K thành công!`, "success");
                document.getElementById('r-name').value = "";
                document.getElementById('r-gmail').value = "";
                this.init();
            } else {
                NotiModule.show("Lỗi từ Sheets: " + res.message, "error");
            }
        })
        .catch(() => {
            NotiModule.show("Đã gửi yêu cầu đăng ký lên hệ thống trực tuyến!", "info");
            document.getElementById('r-name').value = "";
            document.getElementById('r-gmail').value = "";
            this.init();
        })
        .finally(() => {
            btn.innerText = "NHẬP DỮ LIỆU BẢNG";
            btn.disabled = false;
        });
    }
};



// [BẮT BUỘC] Kích hoạt chạy khởi tạo ngay khi tải xong trang web
document.addEventListener("DOMContentLoaded", () => {
    R199kModule.init();
});
