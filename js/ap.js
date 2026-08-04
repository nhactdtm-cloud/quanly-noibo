function st(t) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.m-btn').forEach(b => b.classList.remove('active'));
    if (t == 'g') {
        document.getElementById('p-g').classList.add('active');
        document.getElementById('btn-g').classList.add('active');
    } else {
        document.getElementById('p-t').classList.add('active');
        document.getElementById('btn-t').classList.add('active');
    }
}

window.addEventListener('DOMContentLoaded', () => {

    if (typeof UserModule !== 'undefined' && typeof UserModule.checkLoginStatus === 'function') {
        UserModule.checkLoginStatus();
    }

    document.getElementById('btn-login-submit').addEventListener('click', () => UserModule.handleLogin());
    document.getElementById('btn-logout').addEventListener('click', () => UserModule.handleLogout());
    
    document.getElementById('btn-g').addEventListener('click', () => st('g'));
    document.getElementById('btn-t').addEventListener('click', () => st('t'));
    document.getElementById('s-thu').addEventListener('click', () => ThuChiModule.sm('THU'));
    document.getElementById('s-chi').addEventListener('click', () => ThuChiModule.sm('CHI'));
    document.getElementById('btn-add-data').addEventListener('click', () => ThuChiModule.subData());
});

// ==========================================================================
// TỰ ĐỘNG KHỞI CHẠY EMOJI CHO MỌI GIAO DIỆN ĐỘNG (DÁN VÀO CUỐI APP.JS)
// ==========================================================================
if (typeof renderEmojis === 'function') {
    const emojiObserver = new MutationObserver((mutations) => {
        // Kiểm tra xem trên trang có xuất hiện thẻ data-emoji chưa được render hay không
        const hasNewEmoji = document.querySelector('[data-emoji]:not(.ui-emoji-container)');
        if (hasNewEmoji) {
            renderEmojis();
        }
    });

    // Cấu hình camera giám sát toàn bộ sự thay đổi của các thẻ HTML trên trang web
    emojiObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}


const IdHoaDonModule = {
    sinhMaDuyNhat() {
        // 1. Lấy số đảo ngược thời gian (số càng lớn đơn càng cũ, số nhỏ đơn càng mới)
        const soDaoNguoc = 9999999999999 - Date.now();
        
        // 2. Chuyển dãy số này thành chuỗi chữ cái bằng hệ cơ số 36
        // Số đảo ngược nhỏ đi (theo thời gian) sẽ sinh ra chữ cái đứng trước trong bảng (A->Z)
        const chuoiFirebase = soDaoNguoc.toString(36).toUpperCase();
        
        // 3. Chuỗi ngẫu nhiên 3 ký tự chống trùng đơn
        const randomShort = Math.random().toString(36).slice(2, 5).toUpperCase();
        
        // Trả về kết quả: Chữ HD đứng đầu, tiếp theo là chuỗi sắp xếp và chuỗi ngẫu nhiên
        return `HD${chuoiFirebase}${randomShort}`;
    }
};

// ==========================================================================
// HÀM DÙNG CHUNG TOÀN CỤC: ĐẶT TẠI CUỐI FILE APP.JS (FIX CHÍNH XÁC 100%)
// ==========================================================================
function tựĐộngTìmKiếmKháchHàng(context, type = 'GID') {
    // 1. Nhận diện môi trường dựa trên chính Object truyền vào (Bảo đảm không bao giờ nhầm lẫn)
    // Nếu trong Object truyền vào có chứa mảng 'oT' (Loại giao dịch thu) -> Chắc chắn là ThuChiModule
    const isThuChiPage = context.oT !== undefined;
    
    if (context.mode !== 'RENEW' || context.isAutofilling) return;
    
    let iG, iN;
    if (isThuChiPage) {
        // Môi trường 1: Giao diện Thu Chi
        iG = document.getElementById('gid-thuchi'); // 🌟 ĐÃ CẬP NHẬT THEO ID MỚI
        iN = document.getElementById('kh') || document.querySelector('input[placeholder*="Huyền Aerobic"]');
    } else {
        // Môi trường 2: Giao diện R199k
        iG = document.getElementById('r-gid');
        iN = document.getElementById('r-name');
    }

    // Các phần tử bổ sung của form R199k (Bên Thu Chi không có sẽ tự là null)
    const iGm = document.getElementById('r-gmail'), 
          sG = document.getElementById('r-goi');
          
    if (!iG || !iN) return; // Chặn lỗi crash nếu giao diện thiếu thẻ HTML cốt lõi

    let kw = type === 'GID' ? iG.value.trim().toUpperCase() : iN.value.trim(); 
    
    // BỘ LỌC CHẶN LỖI: Không tìm kiếm nếu từ khóa là chữ "ADMIN", "CHỜ TỰ ĐỘNG" hoặc trống rỗng
    if (kw === "ADMIN" || kw === "CHỜ TỰ ĐỘNG" || kw === "") return;
    if ((type === 'GID' && kw.length < 5) || (type === 'NAME' && kw.length < 3)) return;

    const cId = ++context.searchId, cleanUrl = context.FB_URL.replace(/\/$/, '');
    
    fetch(`${cleanUrl}/r199k_members.json${context.FB_KEY ? '?auth='+context.FB_KEY : ''}`)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(res => {
        if (cId !== context.searchId || !res) return;
        
        let allInvoices = [];
        Object.keys(res).forEach(gidKey => {
            if (res[gidKey] && typeof res[gidKey] === 'object') {
                Object.keys(res[gidKey]).forEach(invoiceKey => {
                    let invData = res[gidKey][invoiceKey];
                    if (invData && typeof invData === 'object') {
                        allInvoices.push({
                            ...invData,
                            hoaDon: invoiceKey, 
                            gid: invData.gid || gidKey
                        });
                    }
                });
            }
        });

        let customerRows = allInvoices.filter(i => type === 'GID' ? (i.gid || '').toUpperCase() === kw : (i.name || '').toLowerCase().includes(kw.toLowerCase()));
        
        if (customerRows.length > 0) {
            let found = customerRows[0]; 

            context.currentGhiChu = found.ghiChu || ""; 
            context.isAutofilling = true;
            
            // Đổ dữ liệu tên khách hàng chính xác theo từng giao diện cụ thể
            if (isThuChiPage) {
                iN.value = found.name;
                iN.dispatchEvent(new Event('input')); // Kích hoạt sự kiện để giao diện nhận biết dữ liệu thay đổi
            } else {
                type === 'GID' ? (iN.value = found.name) : (iG.value = found.gid);
            }
            
            // Các trường phụ trợ điền dữ liệu của riêng trang R199k
            if (iGm) iGm.value = found.gmail || ""; 
            if (sG && found.goi) {
                sG.value = found.goi.toString().trim().toUpperCase();
                sG.dispatchEvent(new Event('change'));
            }
            
            // Kích hoạt hàm xử lý ngày kết thúc (chỉ chạy nếu bên file gọi có khai báo hàm này)
            if (typeof context.tínhNgàyKếtThúc === 'function') {
                context.tínhNgàyKếtThúc();
            }
            
            if (typeof NotiModule !== 'undefined') {
                NotiModule.show(`Đã tìm thấy: ${found.name}!`, "success"); 
            }
            setTimeout(() => context.isAutofilling = false, 100);
        } else if (type === 'GID') { 
            if (typeof NotiModule !== 'undefined' && kw !== "ADMIN") { 
                NotiModule.show(`Không thấy khách hàng: ${kw}`, "error"); 
            }
        }
    }).catch(e => { 
        console.log("Lỗi hệ thống truy vấn:", e); 
        context.isAutofilling = false; 
    });
}
