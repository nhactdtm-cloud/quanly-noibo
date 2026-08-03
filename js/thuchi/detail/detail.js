// js/thuchi/detail.js - FUNCTION DETAILED & DELETE FIREBASE (SIÊU TIẾT KIỆM DÒNG)
let thoiGianThongBaoXoaGanNhat = 0;

function moChiTietHoaDon(maHD) {
    khoiTaoModalHTML(); 
    const m = document.getElementById('detailModal'), 
          c = document.getElementById('detailRowsContainer'), 
          b = document.getElementById('detailDeleteBtn');
          
    if (m) m.classList.add('active');
    if (b) { 
        b.innerText = "XÓA HÓA ĐƠN"; 
        b.disabled = false; 
        b.style.background = "#ef4444"; 
        b.setAttribute('onclick', `xoaHoaDon('${maHD}')`); 
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
