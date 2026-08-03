// js/r199k/renewal.js - FULL RENEWAL MODULE FIREBASE COMPLETE (SIÊU TIẾT KIỆM DÒNG)
const RenewalModule = {
    getFBConfig() {
        return {
            url: (typeof R199kModule !== 'undefined' ? R199kModule.FB_URL : "https://firebasedatabase.app").replace(/\/$/, ''),
            key: typeof R199kModule !== 'undefined' ? R199kModule.FB_KEY : ""
        };
    },

    hienThiLichSuGiaHan(gid) {
        if (!gid) return; this.khoiTaoKhungGiaoDien();
        const hC = document.getElementById('renewal-history-list'), tC = document.getElementById('renewal-history-title');
        tC.innerText = `Đang tải lịch sử: ${gid}...`; hC.innerHTML = '<div class="renewal-loading">Đang tải lịch sử...</div>';

        const cfg = this.getFBConfig();
        fetch(`${cfg.url}/r199k_members/${gid}.json?_nocache=${Date.now()}${cfg.key ? '&auth='+cfg.key : ''}`)
        .then(r => r.ok ? r.json() : Promise.reject()).then(res => {
            if (!res) { hC.innerHTML = '<div class="renewal-empty">⚠️ Không có lịch sử dữ liệu.</div>'; return; }
            
            let invoiceObj = res;
            if (res.history) {
                invoiceObj = res.history; 
            }
            
            // Chuyển đối tượng Object từ Firebase thành mảng các hóa đơn sạch
            let data = Object.values(invoiceObj).filter(item => item && typeof item === 'object' && item.hoaDon);
            
            if (data.length === 0) {
                hC.innerHTML = '<div class="renewal-empty">⚠️ Không tìm thấy bản ghi hóa đơn hợp lệ.</div>';
                return;
            }

            tC.innerText = `KHÁCH HÀNG: ${res.name || data[0]?.name || "Thành viên"} (${gid})`; hC.innerHTML = '';
            
            // 🌟 1. THUẬT TOÁN MỚI: Sắp xếp GIẢM DẦN theo mã Hóa Đơn (Hóa đơn mới nhất, sinh sau cùng sẽ lên ĐẦU mảng)
            data.sort((a, b) => (b.hoaDon || '').localeCompare(a.hoaDon || ''));
            
            // 🌟 2. Đánh số Lần: Phần tử đầu tiên (Mới nhất) sẽ là Lần 1, cũ hơn tăng dần thành Lần 2, Lần 3... khớp 100% hình vẽ
            data.forEach((item, idx) => {
                item.soLanGiaHanThucTe = idx + 1; 
            });
            
            // Vì mảng đã được sắp xếp sẵn mới nhất lên đầu ở bước 1, chúng ta lặp render trực tiếp ra giao diện luôn
            data.forEach((item) => {
                const rowDiv = document.createElement('div'); rowDiv.className = `renewal-history-item ${item.goi === 'HẾT HẠN' ? 'cancelled' : ''}`;
                const startFmt = item.start ? item.start.split('-').reverse().join('/') : '--/--/----';
                
                let diff = Number(item.ngayConLai !== undefined ? item.ngayConLai : 0);
                
                let labelDays = "";
                if (item.goi === 'HẾT HẠN' || item.end === 'HỦY NGAY') {
                    labelDays = 'Hủy';
                } else if (diff < 0) {
                    labelDays = `Quá hạn: ${Math.abs(diff)} ngày`;
                } else {
                    labelDays = `Còn lại: ${diff} ngày`;
                }

                rowDiv.innerHTML = `
                    <div class="renewal-item-header">
                        <!-- Hiển thị số lần thực tế đã băm ngược: Mới nhất = Lần 1 -->
                        <span class="renewal-badge-count">Lần ${item.soLanGiaHanThucTe}</span>
                        <span class="renewal-item-package">${item.goi || '1 THÁNG'}</span>
                    </div>
                    <div class="renewal-item-body">
                        <div class="renewal-time-line">
                            <div class="renewal-days-left ..."><span><span data-emoji="bat-dau"></span> Bắt đầu:</span> <b>${startFmt}</b></div>
                            <div class="renewal-days-left ..."><span><span data-emoji="ket-thuc"></span> Kết thúc:</span> <b>${item.end || '--/--/----'}</b></div>
                            <span class="renewal-days-left ..."><span data-emoji="con-lai"></span> ${labelDays}</span>
                            <div class="renewal-invoice-text">Mã HD: ${item.hoaDon || 'Không có'}</div>
                        </div>
                        <div class="renewal-action-area">
                            <button class="renewal-delete-item-btn" title="Xóa giao dịch lỗi"><span data-emoji="delete"></span></button>

                        </div>
                    </div>
                `;
                const btnDel = rowDiv.querySelector('.renewal-delete-item-btn');
                if (btnDel) {
                    btnDel.addEventListener('click', () => {
                        this.xoaGiaoDichLoiByHoaDon(item.hoaDon, item.soLanGiaHanThucTe, rowDiv, item.adminName);
                    });
                }
                hC.appendChild(rowDiv);
            });
        }).catch(err => { console.error("Lỗi:", err); tC.innerText = `📜 Lịch Sử Gia Hạn: ${gid}`; hC.innerHTML = '<div class="renewal-empty">⚠️ Không thể kết nối dữ liệu.</div>'; });
    },



    xoaGiaoDichLoiByHoaDon(hoaDon, lanGiaHan, elementDiv, adminName) {
        const role = (localStorage.getItem('loggedRole') || '').trim().toUpperCase();
        if (role !== "MASTER" && role !== "MANAGER") return typeof NotiModule !== 'undefined' ? NotiModule.show("Từ chối quyền xóa!", "error") : alert("Từ chối quyền xóa!");
        if (!hoaDon) return alert("Giao dịch không có mã hóa đơn!");
        if (!confirm(`Bạn có chắc chắn muốn xóa lịch sử giao dịch [Lần ${lanGiaHan}] không?`)) return;

        elementDiv.style.opacity = "0.4"; elementDiv.style.pointerEvents = "none"; const cfg = this.getFBConfig();
        const titleText = document.getElementById('renewal-history-title').innerText;
        const match = titleText.match(/\(([^)]+)\)/); const gid = match ? match[1] : null;

        // 🌟 LUỒNG XÓA ĐỒNG BỘ: Xóa song song hóa đơn ở cả nhánh dòng tiền và nhánh lịch sử nhóm
        Promise.all([
            fetch(`${cfg.url}/thuchi/${hoaDon}.json${cfg.key ? '?auth='+cfg.key : ''}`, { method: "DELETE" }),
            gid ? fetch(`${cfg.url}/r199k_members/${gid}/${hoaDon}.json${cfg.key ? '?auth='+cfg.key : ''}`, { method: "DELETE" }) : Promise.resolve()
        ])
        .then(() => {
            if (typeof ThuChiModule !== "undefined" && typeof ThuChiModule.taiHoatDongHomNay === 'function') ThuChiModule.taiHoatDongHomNay();
            if (typeof R199kModule !== "undefined" && typeof R199kModule.refreshRenewList === 'function') R199kModule.refreshRenewList();
            NotiModule.show("Đã xóa giao dịch rác thành công!", "success"); elementDiv.remove();
            
            const container = document.getElementById('renewal-history-list');
            if (container && container.children.length === 0) container.innerHTML = '<div class="renewal-empty">⚠️ Không còn lịch sử gia hạn nào.</div>';
        })
        .catch(err => { elementDiv.style.opacity = "1"; elementDiv.style.pointerEvents = "auto"; alert("Lỗi mạng xóa thất bại!"); });
    },


    xoaKhachHangR199kNeuCần(gid, hoaDon) {
        if (!gid) return; const cfg = this.getFBConfig();
        fetch(`${cfg.url}/r199k_members/${gid}.json${cfg.key ? '?auth='+cfg.key : ''}`)
        .then(r => r.json()).then(res => {
            // 🌟 LUỒNG ĐỒNG BỘ CACHE NGẦM: Tìm và xóa phần tử lỗi trong LocalStorage của máy
            const cacheKey = 'r199k_members_cache';
            let localData = []; try { localData = JSON.parse(localStorage.getItem(cacheKey)) || []; } catch(e) { localData = []; }

            if (!res || Object.keys(res).length === 0) {
                // Nếu trên Firebase không còn hóa đơn nào -> Xóa trắng node GID trên Server
                fetch(`${cfg.url}/r199k_members/${gid}.json${cfg.key ? '?auth='+cfg.key : ''}`, { method: "DELETE" })
                .then(() => {
                    // Đồng thời xóa sổ khách hàng này khỏi bộ nhớ lưu ngầm LocalStorage
                    localData = localData.filter(item => item.gid !== gid);
                    localStorage.setItem(cacheKey, JSON.stringify(localData));
                    if (typeof R199kModule !== "undefined") R199kModule.taiDanhSachThanhVienTheoUser();
                });
            } else if (res[hoaDon]) {
                // Nếu vẫn còn các lần gia hạn cũ -> Chỉ xóa hóa đơn lỗi hiện tại trên Server
                fetch(`${cfg.url}/r199k_members/${gid}/${hoaDon}.json${cfg.key ? '?auth='+cfg.key : ''}`, { method: "DELETE" })
                .then(() => {
                    // Cập nhật lại thông tin gói lưu ngầm trong máy bằng dữ liệu của hóa đơn còn lại mới nhất
                    let invoices = Object.values(res).filter(inv => inv && inv.hoaDon !== hoaDon);
                    invoices.sort((a, b) => (b.hoaDon || '').localeCompare(a.hoaDon || ''));
                    
                    let idx = localData.findIndex(item => item.gid === gid);
                    if (idx !== -1 && invoices.length > 0) {
                        localData[idx] = { ...localData[idx], goi: invoices[0].goi, name: invoices[0].name };
                    } else if (idx !== -1) {
                        localData = localData.filter(item => item.gid !== gid);
                    }
                    localStorage.setItem(cacheKey, JSON.stringify(localData));
                    if (typeof R199kModule !== "undefined") R199kModule.taiDanhSachThanhVienTheoUser();
                });
            }
        }).catch(e => console.error("Lỗi dọn cache ngầm:", e));
    },


    khoiTaoKhungGiaoDien() {
        if (document.getElementById('renewal-history-popup')) { document.getElementById('renewal-history-popup').classList.add('show'); return; }
        const p = document.createElement('div'); p.id = 'renewal-history-popup'; p.className = 'renewal-popup-overlay show';
        p.innerHTML = `<div class="renewal-popup-content"><div class="renewal-popup-header"><h3 id="renewal-history-title">📜 Lịch Sử Gia Hạn</h3>${UIButton.closeModal("btn-close-renewal")}</div><div id="renewal-history-list" class="renewal-popup-body"></div></div>`;
        document.body.appendChild(p); UIButton.setupCloseEvent("btn-close-renewal", "renewal-history-popup");
    },

    dongPopup() { const p = document.getElementById('renewal-history-popup'); if (p) p.classList.remove('show'); },
    dinhDangNgay(dStr) { if (!dStr) return '--/--/----'; if (dStr.includes('/')) return dStr; const [y, m, d] = dStr.split('-'); return y && m && d ? `${d}/${m}/${y}` : dStr; }
};
