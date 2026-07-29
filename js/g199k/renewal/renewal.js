const RenewalModule = {
    // ⚠️ Sử dụng chung URL Web App của bạn để đồng bộ cấu trúc
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzhh5Dzq2fuWK3zQPFB67DHf4QZE9efj0b2g6jQzsqUsXGK5hLnFgMSfdMt33hiyrAc/exec",

    /**
     * Hàm chính được gọi khi click vào tên khách hàng từ module R199kModule
     * @param {string} gid - Mã GID của khách hàng cần xem lịch sử
     */
    hienThiLichSuGiaHan: function(gid) {
        if (!gid) return;
        this.khoiTaoKhungGiaoDien();

        const historyContainer = document.getElementById('renewal-history-list');
        const titleContainer = document.getElementById('renewal-history-title');
        
        titleContainer.innerText = `🔄 Đang tải lịch sử: ${gid}...`;
        historyContainer.innerHTML = '<div class="renewal-loading">🔄 Đang truy vấn dữ liệu từ Google Sheets...</div>';

        const url = `${this.WEB_APP_URL}?action=GET_HISTORY&gid=${encodeURIComponent(gid)}`;

        fetch(url)
        .then(response => response.json())
        .then(res => {
            if (res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
                const customerName = res.name || "Khách hàng";
                titleContainer.innerText = `📜 Lịch Sử Gia Hạn: ${customerName} (${gid})`;
                historyContainer.innerHTML = ''; 

                res.data.sort((a, b) => Number(b.lanGiaHan || 0) - Number(a.lanGiaHan || 0));

                res.data.forEach(item => {
                    const rowDiv = document.createElement('div');
                    rowDiv.className = `renewal-history-item ${item.goi === 'Hủy ĐK' ? 'cancelled' : ''}`;
                    
                    const startFormatted = this.dinhDangNgay(item.start);
                    const endFormatted = (item.end === "01/01/1970" || item.end === "HỦY NGAY" || item.goi === 'Hủy ĐK') ? "HỦY NGAY" : this.dinhDangNgay(item.end);

                    // HTML thuần túy không chứa mã độc hoặc nhồi style nội dòng
                    rowDiv.innerHTML = `
                        <div class="renewal-item-header">
                            <span class="renewal-badge-count">Lần ${item.lanGiaHan || 1}</span>
                            <span class="renewal-item-package">${item.goi || '1 THÁNG'}</span>
                        </div>
                        <div class="renewal-item-body">
                            <div class="renewal-time-line">
                                <span>📅 Bắt đầu: <b>${startFormatted}</b></span>
                                <span>⌛ Kết thúc: <b>${endFormatted}</b></span>
                                <div class="renewal-invoice-text">🧾 Mã HD: ${item.hoaDon || 'Không có'}</div>
                            </div>
                            <button class="renewal-delete-item-btn" title="Xóa giao dịch lỗi">
                                🗑️ Xóa
                            </button>
                        </div>
                    `;

                    const deleteBtn = rowDiv.querySelector('.renewal-delete-item-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => {
                            this.xoaGiaoDichLoiByHoaDon(item.hoaDon, item.lanGiaHan, rowDiv);
                        });
                    }
                    historyContainer.appendChild(rowDiv);
                });

            } else {
                titleContainer.innerText = `📜 Lịch Sử Gia Hạn: ${gid}`;
                historyContainer.innerHTML = '<div class="renewal-empty">⚠️ Không tìm thấy lịch sử gia hạn nào cho khách hàng này.</div>';
            }
        })
        .catch(err => {
            console.error("Lỗi tải lịch sử gia hạn:", err);
            historyContainer.innerHTML = '<div class="renewal-empty">❌ Lỗi kết nối máy chủ!</div>';
        });
    },

    /**
     * Tự động sinh cấu trúc HTML của Popup nếu chưa có trên trang index.html
     */
    khoiTaoKhungGiaoDien: function() {
        if (document.getElementById('renewal-history-popup')) {
            document.getElementById('renewal-history-popup').classList.add('show');
            return;
        }

        const popup = document.createElement('div');
        popup.id = 'renewal-history-popup';
        popup.className = 'renewal-popup-overlay show';
        popup.innerHTML = `
            <div class="renewal-popup-content">
                <div class="renewal-popup-header">
                    <h3 id="renewal-history-title">📜 Lịch Sử Gia Hạn</h3>
                    <button id="btn-close-renewal" class="renewal-close-btn">&times;</button>
                </div>
                <div id="renewal-history-list" class="renewal-popup-body">
                    <!-- Danh sách lịch sử gia hạn render tại đây -->
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Đóng popup khi click nút X hoặc click ra ngoài vùng nền đen
        document.getElementById('btn-close-renewal').addEventListener('click', () => this.dongPopup());
        popup.addEventListener('click', (e) => {
            if (e.target === popup) this.dongPopup();
        });
    },

    dongPopup: function() {
        const popup = document.getElementById('renewal-history-popup');
        if (popup) popup.classList.remove('show');
    },


    xoaGiaoDichLoiByHoaDon: function(hoaDon, lanGiaHan, elementDiv) {
        // [LOG CHẨN ĐOÁN] Kiểm tra giá trị hoaDon thực tế nhận từ thẻ HTML
        console.log("%c[FRONTEND-DELETE] Bắt đầu gọi hàm xóa!", "color: #ff5f56; font-weight: bold;");
        console.log("[FRONTEND-DELETE] Tham số hoaDon nhận được:", hoaDon);
        console.log("[FRONTEND-DELETE] Tham số lanGiaHan nhận được:", lanGiaHan);

        if (!hoaDon || hoaDon === "undefined" || hoaDon.trim() === "") {
            console.error("[FRONTEND-DELETE] Thất bại! Mã hóa đơn bị rỗng hoặc undefined.");
            alert("Lỗi: Giao dịch này không có mã hóa đơn hợp lệ trên giao diện Web. Vui lòng bấm Ctrl+F5 và mở lại!");
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn xóa lịch sử giao dịch [Lần ${lanGiaHan}] có mã hóa đơn ${hoaDon} không?`)) return;

        elementDiv.style.opacity = "0.4";
        elementDiv.style.pointerEvents = "none";

        const payload = {
            action: "DELETE_HISTORY_ROW",
            hoaDon: hoaDon.toString().trim()
        };
        
        console.log("[FRONTEND-DELETE] Gói Payload gửi đi dạng chuỗi:", JSON.stringify(payload));

        fetch(this.WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        })
        .then(response => {
            console.log("[FRONTEND-DELETE] HTTP Status nhận về:", response.status);
            return response.json();
        })
        .then(res => {
            console.log("[FRONTEND-DELETE] Kết quả giải mã JSON từ Máy chủ:", res);
            if (res.status === "success") {
                if (typeof NotiModule !== 'undefined') NotiModule.show("Đã xóa giao dịch lỗi thành công!", "success");
                elementDiv.remove();
                
                const container = document.getElementById('renewal-history-list');
                if (container.children.length === 0) {
                    container.innerHTML = '<div class="renewal-empty">⚠️ Không còn lịch sử gia hạn nào.</div>';
                }
            } else {
                elementDiv.style.opacity = "1";
                elementDiv.style.pointerEvents = "auto";
                alert("Lỗi từ hệ thống: " + res.message);
            }
        })
        .catch(err => {
            elementDiv.style.opacity = "1";
            elementDiv.style.pointerEvents = "auto";
            console.error("[FRONTEND-DELETE] Lỗi đường truyền FETCH:", err);
            alert("Không thể kết nối máy chủ để xóa dữ liệu!");
        });
    },


    dinhDangNgay: function(dateStr) {
        if (!dateStr) return '--/--/----';
        if (dateStr.includes('/')) return dateStr; // Nếu backend đã định dạng sẵn dạng DD/MM/YYYY
        const [y, m, d] = dateStr.split('-');
        return y && m && d ? `${d}/${m}/${y}` : dateStr;
    }
};

