function moChiTietHoaDon(maHD) {
    khoiTaoModalHTML();
    const modal = document.getElementById('detailModal');
    const container = document.getElementById('detailRowsContainer');
    
    modal.classList.add('active');

    // FIX LỖI TẠI ĐÂY: Reset lại nút bấm về trạng thái ban đầu mỗi khi mở một hóa đơn mới
    const btnDelete = document.getElementById('detailDeleteBtn');
    if (btnDelete) {
        btnDelete.innerText = "XÓA HÓA ĐƠN";
        btnDelete.disabled = false;
        btnDelete.style.background = "#ef4444"; // Trả lại màu đỏ nguyên bản từ file CSS
        btnDelete.setAttribute('onclick', `xoaHoaDon('${maHD}')`); // Gán mã hóa đơn hiện tại vào nút bấm
    }

    // Tìm kiếm đơn hàng có mã trùng khớp trong mảng cache dữ liệu hôm nay
    const danhSachDon = ThuChiModule.duLieuGiaoDichHomNay || [];
    const item = danhSachDon.find(d => d.hoaDon === maHD);

    if (item) {
        const isThu = item.mode === 'THU TIỀN';
        const dinhDangTien = (item.soTien || 0).toLocaleString('vi-VN') + 'đ';
        const thoiGianHienThi = item.thoiGian || (new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}));

        // Đổ dữ liệu thật lấy từ mảng nguồn
        container.innerHTML = `
            <div class="detail-row"><span class="detail-label">Mã ID Lệnh:</span><span class="detail-value" style="color:#1e40af;">${item.hoaDon}</span></div>
            <div class="detail-row"><span class="detail-label">Thời Gian:</span><span class="detail-value">${thoiGianHienThi}</span></div>
            <div class="detail-row"><span class="detail-label">Khách Hàng:</span><span class="detail-value">${item.khachHang || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Ghi Chú:</span><span class="detail-value">${item.ghiChu || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Quản Lý (Loại):</span><span class="detail-value" style="color:${isThu ? 'green' : 'red'}">${item.mode}</span></div>
            <div class="detail-row"><span class="detail-label">Loại GD:</span><span class="detail-value">${item.loaiGd || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Số Tiền:</span><span class="detail-value" style="color:${isThu ? 'green' : 'red'}">${dinhDangTien}</span></div>
            <div class="detail-row"><span class="detail-label">Trạng Thái:</span><span class="detail-value" style="color:green;"> HOÀN THÀNH</span></div>
            <div class="detail-row"><span class="detail-label">Nhân Viên:</span><span class="detail-value">${item.adminName || 'ADMIN'}</span></div>
        `;
    } else {
        container.innerHTML = '<div style="text-align:center;color:red;padding:20px 0;font-size:14px;">Không tìm thấy thông tin của mã đơn hàng này trong phiên làm việc!</div>';
    }
}


// Hàm bổ trợ dọn dẹp dữ liệu cục bộ và vẽ lại giao diện ngay lập tức
function xuLyDongBoSauKhiXoa(maHD) {
    if (typeof NotiModule !== 'undefined' && typeof NotiModule.show === 'function') {
        NotiModule.show(`Đã xóa thành công hóa đơn ${maHD}!`, "success");
    }

    // Xóa đơn hàng khỏi bộ nhớ đệm cache cục bộ trên Web
    if (ThuChiModule.duLieuGiaoDichHomNay) {
        ThuChiModule.duLieuGiaoDichHomNay = ThuChiModule.duLieuGiaoDichHomNay.filter(d => d.hoaDon !== maHD);
    }

    // Tải lại dữ liệu ngày hôm nay để cập nhật bảng giao dịch và tổng số tiền Thu/Chi
    if (typeof ThuChiModule.taiHoatDongHomNay === 'function') {
        ThuChiModule.taiHoatDongHomNay();
    }

    dongModalChiTiet(); // Đóng Modal chi tiết
}

function khoiTaoModalHTML() {
    if (document.getElementById('detailModal')) return; 
    const modalDiv = document.createElement('div');
    modalDiv.id = 'detailModal';
    modalDiv.className = 'detail-modal';
    
    const closeButtonHtml = UIButton.closeModal("detailModalCloseBtn");

    modalDiv.innerHTML = `
        <div class="detail-content">
            ${closeButtonHtml}
            <h3>🔍 Chi Tiết Giao Dịch</h3>
            <div id="detailRowsContainer"></div>
            <button id="detailDeleteBtn" class="detail-delete-btn">XÓA HÓA ĐƠN</button>
        </div>
    `;

    document.body.appendChild(modalDiv);

    // Dòng này bây giờ tự động kích hoạt cả tính năng bấm nút x lẫn bấm ra ngoài màn hình
    UIButton.setupCloseEvent("detailModalCloseBtn", "detailModal");
}


function xoaHoaDon(maHD) {
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
        return; 
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa hóa đơn ${maHD} này không? Hành động này không thể hoàn tác!`)) return;

    // 1. Đổi giao diện nút bấm sang trạng thái chờ xử lý
    const btnDelete = document.getElementById('detailDeleteBtn');
    if (btnDelete) {
        btnDelete.innerText = "ĐANG XÓA...";
        btnDelete.disabled = true;
        btnDelete.style.background = "#9ca3af";
    }

    const webAppUrl = ThuChiModule.WEB_APP_URL;

    // 2. Thực hiện gọi API xóa dòng tiền tập trung trên 1 Sheet
    fetch(`${webAppUrl}?action=delete&maId=${encodeURIComponent(maHD)}`)
        .then(response => {
            if (response.ok) return response.json();
            throw new Error("Mạng phản hồi chậm");
        })
        .then(res => {
            // ĐÃ XÓA LỆNH NOTI TẠI ĐÂY: Nhường quyền hiển thị hoàn toàn cho hàm đồng bộ phía sau
            xuLyDongBoSauKhiXoa(maHD);
        })
        .catch(err => {
            console.warn("Đồng bộ giao diện sau khi lệnh gửi đi:", err);
            xuLyDongBoSauKhiXoa(maHD);
        });
}


// Biến lưu mốc thời gian hiển thị thông báo gần nhất bên ngoài hàm để tránh lặp
let thoiGianThongBaoXoaGanNhat = 0;

function xuLyDongBoSauKhiXoa(maHD) {
    const bayGio = Date.now();
    
    // CHẶN LẶP: Nếu thông báo trước đó vừa hiển thị cách đây chưa đầy 2 giây, bỏ qua không hiện lại
    if (bayGio - thoiGianThongBaoXoaGanNhat > 2000) {
        if (typeof NotiModule !== 'undefined' && typeof NotiModule.show === 'function') {
            NotiModule.show(`Đã xóa thành công hóa đơn ${maHD}!`, "success");
        }
        thoiGianThongBaoXoaGanNhat = bayGio; // Cập nhật lại mốc thời gian vừa thông báo
    }

    // Xóa đơn hàng khỏi bộ nhớ đệm cache cục bộ trên Web
    if (ThuChiModule.duLieuGiaoDichHomNay) {
        ThuChiModule.duLieuGiaoDichHomNay = ThuChiModule.duLieuGiaoDichHomNay.filter(d => d.hoaDon !== maHD);
    }

    // Tải lại dữ liệu ngày hôm nay để cập nhật bảng giao dịch và tổng số tiền Thu/Chi
    if (typeof ThuChiModule.taiHoatDongHomNay === 'function') {
        ThuChiModule.taiHoatDongHomNay();
    }

    // ĐÓNG MODAL THEO CƠ CHẾ CỦA UIBUTTON NHÚNG TRÊN INDEX.HTML
    // Bạn hãy thay 'detailModal' bằng đúng ID của thẻ div Modal chi tiết trong file index.html của bạn nhé
    const modalChiTiet = document.getElementById('detailModal'); 
    if (modalChiTiet) {
        modalChiTiet.classList.remove('active');
        modalChiTiet.classList.remove('show');
    }
}

