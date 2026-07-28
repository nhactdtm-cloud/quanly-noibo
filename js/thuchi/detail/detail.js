function moChiTietHoaDon(maHD) {
    khoiTaoModalHTML();
    const modal = document.getElementById('detailModal');
    const container = document.getElementById('detailRowsContainer');
    
    modal.classList.add('active');

    // Tìm kiếm đơn hàng có mã trùng khớp trong mảng cache dữ liệu hôm nay
    const danhSachDon = ThuChiModule.duLieuGiaoDichHomNay || [];
    const item = danhSachDon.find(d => d.hoaDon === maHD);

    if (item) {
        const isThu = item.mode === 'THU TIỀN';
        const dinhDangTien = (item.soTien || 0).toLocaleString('vi-VN') + 'đ';
        const thoiGianHienThi = item.thoiGian || (new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}));

        // Đổ dữ liệu thật lấy từ mảng nguồn, đầy đủ Khách Hàng và Ghi Chú gốc
        container.innerHTML = `
            <div class="detail-row"><span class="detail-label">Mã ID Lệnh:</span><span class="detail-value" style="color:#1e40af;">${item.hoaDon}</span></div>
            <div class="detail-row"><span class="detail-label">Thời Gian:</span><span class="detail-value">${thoiGianHienThi}</span></div>
            <div class="detail-row"><span class="detail-label">Khách Hàng:</span><span class="detail-value">${item.khachHang || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Ghi Chú:</span><span class="detail-value">${item.ghiChu || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Quản Lý (Loại):</span><span class="detail-value" style="color:${isThu ? 'green' : 'red'}">${item.mode}</span></div>
            <div class="detail-row"><span class="detail-label">Loại GD:</span><span class="detail-value">${item.loaiGd || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Số Tiền:</span><span class="detail-value" style="color:${isThu ? 'green' : 'red'}">${dinhDangTien}</span></div>
            <div class="detail-row"><span class="detail-label">Trạng Thái:</span><span class="detail-value" style="color:green;">✨ HOÀN THÀNH</span></div>
            <div class="detail-row"><span class="detail-label">Nhân Viên:</span><span class="detail-value">${item.adminName || 'ADMIN'}</span></div>
        `;
    } else {
        container.innerHTML = '<div style="text-align:center;color:red;padding:20px 0;font-size:14px;">Không tìm thấy thông tin của mã đơn hàng này trong phiên làm việc!</div>';
    }
}

function dongModalChiTiet() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
}

function khoiTaoModalHTML() {
    if (document.getElementById('detailModal')) return; 
    const modalDiv = document.createElement('div');
    modalDiv.id = 'detailModal';
    modalDiv.className = 'detail-modal';
    modalDiv.innerHTML = `
        <div class="detail-content">
            <h3>🔍 Chi Tiết Giao Dịch</h3>
            <div id="detailRowsContainer"></div>
            <button class="detail-close-btn" onclick="dongModalChiTiet()">Đóng cửa sổ</button>
        </div>
    `;
    modalDiv.addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') dongModalChiTiet();
    });
    document.body.appendChild(modalDiv);
}
