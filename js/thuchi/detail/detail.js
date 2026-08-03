// js/thuchi/detail.js - FUNCTION DETAILED & DELETE FIREBASE (SIÊU TIẾT KIỆM DÒNG)
let thoiGianThongBaoXoaGanNhat = 0;

function moChiTietHoaDon(maHD) {
    khoiTaoModalHTML(); 
    const m = document.getElementById('detailModal'), 
          c = document.getElementById('detailRowsContainer'), 
          b = document.getElementById('detailDeleteBtn');
          
    if (m) m.classList.add('active');
if (b) { 
    b.removeAttribute('style'); 
    b.innerHTML = `
        <div class="detail-actions-area">
            <!-- Đã thêm thẻ emoji máy in dính liền trước văn bản -->
            <button class="ui-btn-print" onclick="inHoaDon('${maHD}')"><span data-emoji="may-in"></span> IN HÓA ĐƠN</button>
            <button class="ui-btn-delete-circle" title="Xóa hóa đơn" onclick="xoaHoaDon('${maHD}')"><span data-emoji="delete"></span></button>
        </div>
    `;
}



    const item = (ThuChiModule.duLieuGiaoDichHomNay || []).find(d => d.hoaDon === maHD);
    if (item) {
        const isThu = ['THU TIỀN', 'THU'].includes(item.mode);
        c.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Mã ID Lệnh:</span>
                <span class="detail-value" 
                      style="color:#1e40af; cursor:pointer; font-weight:bold;" 
                      title="Click để sao chép"
                      onclick="navigator.clipboard.writeText('${item.hoaDon}').then(() => NotiModule.show('Đã sao chép: ${item.hoaDon}', 'success'))">
                    ${item.hoaDon}
                </span>
            </div>
            <div class="detail-row"><span class="detail-label">Thời Gian:</span><span class="detail-value">${item.thoiGian || 'Không có dữ liệu'}</span></div>
            <div class="detail-row"><span class="detail-label">Khách Hàng:</span><span class="detail-value">${item.khachHang || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Ghi Chú:</span><span class="detail-value">${item.ghiChu || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Quản Lý (Loại):</span><span class="detail-value" style="color:${isThu?'green':'red'}">${item.mode}</span></div>
            <div class="detail-row"><span class="detail-label">Loại GD:</span><span class="detail-value">${item.loaiGd || '-'}</span></div>
            <div class="detail-row"><span class="detail-label">Số Tiền:</span><span class="detail-value" style="color:${isThu?'green':'red'}">${(item.soTien||0).toLocaleString('vi-VN')}đ</span></div>
            <div class="detail-row"><span class="detail-label">Trạng Thái:</span><span class="detail-value" style="color:green;"> HOÀN THÀNH</span></div>
            <div class="detail-row"><span class="detail-label">Nhân Viên:</span><span class="detail-value">${item.adminName || 'ADMIN'}</span></div>
        `;
    } else { 
        c.innerHTML = '<div style="text-align:center;color:red;padding:20px 0;font-size:14px;">Không tìm thấy thông tin đơn hàng!</div>'; 
    }
}



function khoiTaoModalHTML() {
    if (document.getElementById('detailModal')) return; const mD = document.createElement('div');
    mD.id = 'detailModal'; mD.className = 'detail-modal';
    mD.innerHTML = `<div class="detail-content">${UIButton.closeModal("detailModalCloseBtn")}<h3>Chi Tiết Giao Dịch</h3><div id="detailRowsContainer"></div><button id="detailDeleteBtn" class="detail-delete-btn">XÓA HÓA ĐƠN</button></div>`;
    document.body.appendChild(mD); UIButton.setupCloseEvent("detailModalCloseBtn", "detailModal");
}

function xoaHoaDon(maHD) {
    const r = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
    if (r !== "MASTER" && r !== "MANAGER") return typeof NotiModule !== 'undefined' ? NotiModule.show("Từ chối: Tài khoản STAFF không có quyền XÓA!", "error") : alert("Từ chối: Bạn không có quyền XÓA!");
    if (!confirm(`Bạn có chắc chắn muốn xóa hóa đơn ${maHD}?`)) return;

    const b = document.getElementById('detailDeleteBtn'); if (b) { b.innerText = "ĐANG XÓA..."; b.disabled = true; b.style.background = "#9ca3af"; }
    
    // Gửi lệnh DELETE trực tiếp lên node của hóa đơn trên Firebase REST API
    const url = `${ThuChiModule.FB_URL}/thuchi/${maHD}.json${ThuChiModule.FB_KEY ? '?auth='+ThuChiModule.FB_KEY : ''}`;
    fetch(url, { method: "DELETE" })
    .then(r => r.ok ? r.json() : Promise.reject()).then(() => xuLyDongBoSauKhiXoa(maHD))
    .catch(e => { console.warn("Lỗi đồng bộ xóa:", e); xuLyDongBoSauKhiXoa(maHD); });
}

function xuLyDongBoSauKhiXoa(maHD) {
    const bY = Date.now();
    if (bY - thoiGianThongBaoXoaGanNhat > 2000) {
        if (typeof NotiModule !== 'undefined') NotiModule.show(`Đã xóa thành công hóa đơn ${maHD}!`, "success");
        thoiGianThongBaoXoaGanNhat = bY;
    }
    if (ThuChiModule.duLieuGiaoDichHomNay) ThuChiModule.duLieuGiaoDichHomNay = ThuChiModule.duLieuGiaoDichHomNay.filter(d => d.hoaDon !== maHD);
    if (typeof ThuChiModule.taiHoatDongHomNay === 'function') ThuChiModule.taiHoatDongHomNay();
    
    const m = document.getElementById('detailModal'); if (m) { m.classList.remove('active', 'show'); }
}

function inHoaDon(maHD) {
    if (!maHD) {
        if (typeof NotiModule !== 'undefined') NotiModule.show('Mã hóa đơn không hợp lệ!', 'error');
        return;
    }

    // 1. Tìm đúng đối tượng dữ liệu hóa đơn dựa vào mã ID lệnh
    const item = (ThuChiModule.duLieuGiaoDichHomNay || []).find(d => d.hoaDon === maHD);
    
    if (!item) {
        if (typeof NotiModule !== 'undefined') NotiModule.show('Không tìm thấy dữ liệu để in!', 'error');
        return;
    }

    // Xác định loại giao dịch thu hay chi để hiển thị lên phôi in
    const isThu = ['THU TIỀN', 'THU'].includes(item.mode);
    const soTienDinhDang = (item.soTien || 0).toLocaleString('vi-VN') + 'đ';

    // 2. Mở một cửa sổ mới hoàn toàn ẩn ở nền để phục vụ lệnh in lệnh
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // 3. Thiết kế phôi hóa đơn chuẩn hóa ngay trong mã HTML xuất bản
    printWindow.document.write(`
        <html>
        <head>
            <title>Hóa Đơn - ${item.hoaDon}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; }
                .invoice-box { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
                .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 25px; text-transform: uppercase; color: #111; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; font-size: 14px; }
                .row:last-child { border-bottom: none; margin-top: 15px; padding-top: 15px; border-top: 2px solid #333; }
                .label { color: #666; }
                .value { font-weight: bold; color: #111; }
                .total { font-size: 18px; color: ${isThu ? 'green' : 'red'}; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; font-style: italic; }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <div class="title">Hóa Đơn Giao Dịch</div>
                <div class="row"><span class="label">Mã ID Lệnh:</span><span class="value">${item.hoaDon}</span></div>
                <div class="row"><span class="label">Thời Gian:</span><span class="value">${item.thoiGian || '-'}</span></div>
                <div class="row"><span class="label">Khách Hàng:</span><span class="value">${item.khachHang || '-'}</span></div>
                <div class="row"><span class="label">Quản Lý (Loại):</span><span class="value">${item.mode}</span></div>
                <div class="row"><span class="label">Loại GD:</span><span class="value">${item.loaiGd || '-'}</span></div>
                <div class="row"><span class="label">Nhân Viên:</span><span class="value">${item.adminName || 'ADMIN'}</span></div>
                <div class="row"><span class="label">Ghi Chú:</span><span class="value">${item.ghiChu || '-'}</span></div>
                <div class="row"><span class="label">Tổng Số Tiền:</span><span class="value total">${soTienDinhDang}</span></div>
                <div class="footer">Cảm ơn quý khách đã sử dụng dịch vụ!</div>
            </div>
            <script>
                // Tự động kích hoạt lệnh gọi máy in của máy tính ngay khi trang vừa dựng xong
                window.onload = function() {
                    window.print();
                    // Sau khi người dùng bấm xác nhận in hoặc hủy, tự động đóng tab ẩn này lại
                    setTimeout(function() { window.close(); }, 500);
                };
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
}
