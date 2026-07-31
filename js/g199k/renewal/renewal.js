const RenewalModule = {
    // ⚠️ Link App Script riêng của Google Sheet R199K quản lý thành viên
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzhh5Dzq2fuWK3zQPFB67DHf4QZE9efj0b2g6jQzsqUsXGK5hLnFgMSfdMt33hiyrAc/exec",
    
    // ⚠️ Link App Script riêng của Google Sheet QL (Thu Chi)
    THUCHI_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwNA4KT2HEPkCCeQu8ZHLhapDREaNyOUHh9UcleiA6HrxVzLOfNRLpkEDj7zLRJ79kYsQ/exec",

    hienThiLichSuGiaHan: function(gid) {
        if (!gid) return;
        this.khoiTaoKhungGiaoDien();

        const historyContainer = document.getElementById('renewal-history-list');
        const titleContainer = document.getElementById('renewal-history-title');
        
        titleContainer.innerText = `Đang tải lịch sử: ${gid}...`;
        historyContainer.innerHTML = '<div class="renewal-loading">Đang tải lịch sử gia hạn khách hàng...</div>';

        const url = `${this.WEB_APP_URL}?action=GET_HISTORY&gid=${encodeURIComponent(gid)}`;

        fetch(url)
        .then(response => response.json())
        .then(res => {
            if (res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
                const customerName = res.name || "Khách hàng";
                titleContainer.innerText = `KHÁCH HÀNG: ${customerName} (${gid})`;
                historyContainer.innerHTML = ''; 

                res.data.sort((a, b) => Number(b.lanGiaHan || 0) - Number(a.lanGiaHan || 0));

                res.data.forEach(item => {
                    const rowDiv = document.createElement('div');
                    rowDiv.className = `renewal-history-item ${item.goi === 'Hủy ĐK' ? 'cancelled' : ''}`;
                    
                    const startFormatted = this.dinhDangNgay(item.start);
                    const endFormatted = (item.end === "01/01/1970" || item.end === "HỦY NGAY" || item.goi === 'Hủy ĐK') ? "HỦY NGAY" : this.dinhDangNgay(item.end);

                    rowDiv.innerHTML = `
                        <div class="renewal-item-header">
                            <span class="renewal-badge-count">Lần ${item.lanGiaHan || 1}</span>
                            <span class="renewal-item-package">${item.goi || '1 THÁNG'}</span>
                        </div>
                        <div class="renewal-item-body">
                            <div class="renewal-time-line">
                                <span>📅 Bắt đầu: <b>${startFormatted}</b></span>
                                <span>⌛ Kết thúc: <b>${endFormatted}</b></span>
                                <div class="renewal-invoice-text">Mã HD: ${item.hoaDon || 'Không có'}</div>
                            </div>
                            <button class="renewal-delete-item-btn" title="Xóa giao dịch lỗi">
                                🗑️ Xóa
                            </button>
                        </div>
                    `;

                    const deleteBtn = rowDiv.querySelector('.renewal-delete-item-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => {
                            // 🌟 Truyền hoaDon và adminName (Cột L) vào hàm xóa đồng bộ
                            this.xoaGiaoDichLoiByHoaDon(item.hoaDon, item.lanGiaHan, rowDiv, item.adminName);
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

    xoaGiaoDichLoiByHoaDon: function(hoaDon, lanGiaHan, elementDiv, adminName) {
        // ==========================================================================
        // KHỐI CHẶN BẢO MẬT: CHỈ MASTER VÀ MANAGER ĐƯỢC PHÉP XÓA (STAFF BỊ CHẶN)
        // ==========================================================================
        const savedRole = localStorage.getItem('loggedRole');
        const currentRole = (savedRole || '').trim().toUpperCase();

        if (currentRole !== "MASTER" && currentRole !== "MANAGER") {
            if (typeof NotiModule !== 'undefined') {
                NotiModule.show("Từ chối: Tài khoản STAFF không đủ thẩm quyền để thực hiện thao tác XÓA hóa đơn này!", "error");
            } else {
                alert("Từ chối: Tài khoản STAFF không đủ thẩm quyền để thực hiện thao tác XÓA hóa đơn này!");
            }
            return; // NGẮT HÀM LẬP TỨC: Chặn đứng hoàn toàn, không chạy lệnh fetch API xóa ở dưới
        }

        // ==========================================================================
        // CÁC LUỒNG KIỂM TRA VÀ LOGIC XỬ LÝ XÓA GỐC CỦA BẠN (GIỮ NGUYÊN)
        // ==========================================================================
        if (!hoaDon) {
            alert("Giao dịch này không có mã hóa đơn nên không thể xóa đích danh!");
            return;
        }
        if (!confirm(`Bạn có chắc chắn muốn xóa lịch sử giao dịch [Lần ${lanGiaHan}] và ĐỒNG BỘ XÓA dòng tiền Thu Chi tương ứng không?`)) return;

        elementDiv.style.opacity = "0.4";
        elementDiv.style.pointerEvents = "none";

        // 🌟 BƯỚC 1: Gửi yêu cầu POST xóa dòng trên Sheet G_199K
        fetch(this.WEB_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "DELETE_HISTORY_ROW",
                hoaDon: hoaDon
            })
        })
        .then(response => response.json())
        .then(res => {
            if (res.status === "success") {
                
                // 🌟 BƯỚC 2: Xóa G_199K thành công -> Gọi hàm xóa đồng bộ Thu Chi theo định dạng GET của bạn
                var targetAdmin = adminName ? adminName.toString().trim() : "ADMIN";
                this.xoaDongTienThuChiByGet(hoaDon, targetAdmin);

                if (typeof ThuChiModule !== "undefined") {
                    ThuChiModule.taiHoatDongHomNay();
                }

                if (typeof R199kModule !== "undefined") {
                    R199kModule.refreshRenewList();
                }

                if (typeof NotiModule !== 'undefined') {
                    NotiModule.show("Đã dọn dẹp thành viên và dòng tiền thành công!", "success");
                }
                
                elementDiv.remove();
                
                const container = document.getElementById('renewal-history-list');
                if (container && container.children.length === 0) {
                    container.innerHTML = '<div class="renewal-empty">⚠️ Không còn lịch sử gia hạn nào.</div>';
                }
            } else {
                elementDiv.style.opacity = "1";
                elementDiv.style.pointerEvents = "auto";
                alert("Lỗi từ hệ thống G_199K: " + res.message);
            }
        })
        .catch(err => {
            elementDiv.style.opacity = "1";
            elementDiv.style.pointerEvents = "auto";
            alert("Không thể kết nối máy chủ để xử lý xóa!");
        });
    },


    /**
     * 🌟 HÀM ĐỒNG BỘ MỚI: Gọi lệnh GET khớp 100% với TÁC VỤ 1 (action=delete) trong hàm doGet của bảng Thu Chi
     */
    xoaDongTienThuChiByGet: function(hoaDon, adminName) {
        // Build chuỗi URL tham số theo đúng định dạng Backend yêu cầu: action=delete&maId=...&adminName=...
        const thuChiUrl = `${this.THUCHI_WEB_APP_URL}?action=delete&maId=${encodeURIComponent(hoaDon)}&adminName=${encodeURIComponent(adminName)}`;
        console.log("[LOG THU CHI] Đang đồng bộ lệnh xóa sang URL:", thuChiUrl);

        fetch(thuChiUrl)
        .then(response => response.json())
        .then(res => {
            console.log("[LOG THU CHI KẾT QUẢ]:", res.message);
        })
        .catch(err => {
            console.error("[LOG THU CHI ERROR] Lỗi truyền dữ liệu xóa ngầm:", err);
        });
    },

    khoiTaoKhungGiaoDien: function() {
        if (document.getElementById('renewal-history-popup')) {
            document.getElementById('renewal-history-popup').classList.add('show');
            return;
        }

        const popup = document.createElement('div');
        popup.id = 'renewal-history-popup';
        popup.className = 'renewal-popup-overlay show';

        const closeButtonHtml = UIButton.closeModal("btn-close-renewal");

        popup.innerHTML = `
            <div class="renewal-popup-content">
                <div class="renewal-popup-header">
                    <h3 id="renewal-history-title">📜 Lịch Sử Gia Hạn</h3>
                    ${closeButtonHtml}
                </div>
                <div id="renewal-history-list" class="renewal-popup-body"></div>
            </div>
        `;

        document.body.appendChild(popup);

        // Gọi UIButton để lo việc click nút x và click vùng nền tối
        UIButton.setupCloseEvent("btn-close-renewal", "renewal-history-popup");
    },

    // BẮT BUỘC KHÔI PHỤC HÀM NÀY: Để các logic kết nối máy chủ gọi ẩn popup không bị lỗi sập mã nguồn
    dongPopup: function() {
        const popup = document.getElementById('renewal-history-popup');
        if (popup) popup.classList.remove('show');
    },

    dinhDangNgay: function(dateStr) {
        if (!dateStr) return '--/--/----';
        if (dateStr.includes('/')) return dateStr; 
        const [y, m, d] = dateStr.split('-');
        return y && m && d ? `${d}/${m}/${y}` : dateStr;
    }

};
