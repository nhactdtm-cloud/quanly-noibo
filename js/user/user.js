const UserModule = {
    // 🌟 LINK FIREBASE CỐ ĐỊNH CỦA BẠN
    FB_URL: "https://noibo-nhactdtm-default-rtdb.asia-southeast1.firebasedatabase.app",
    uName: 'ADMIN', uRole: 'STAFF',

    // 1. Kiểm tra trạng thái đăng nhập khi tải lại trang (F5)
    checkLoginStatus: function() {
        const u = localStorage.getItem('loggedUser'), r = localStorage.getItem('loggedRole');
        if (u && r) { this.uName = u; this.uRole = r; this.applyLoginUI(); }
    },

    // 2. Áp dụng giao diện sau khi đăng nhập thành công
    applyLoginUI: function() {
        document.getElementById('usr-disp').innerHTML = `<span data-icon="user"></span> Tài khoản: ${this.uName} <span class="role-badge role-${this.uRole.toLowerCase()}">[${this.uRole}]</span>`;
        document.getElementById('lg-sc').style.display = 'none'; document.getElementById('ap').classList.add('auth');
        this.applyRoleRestrictions();
        if (typeof renderIcons === 'function') renderIcons();
        if (typeof ThuChiModule !== 'undefined') { ThuChiModule.iId(); ThuChiModule.sm('THU'); ThuChiModule.taiHoatDongHomNay(); }
    },

    // 3. Hàm phân quyền hiển thị theo Vai trò
    applyRoleRestrictions: function() {
        const opt = document.getElementById("opt-cancel"), rev = document.getElementById("stat-total-revenue"), exp = document.getElementById("stat-total-expense");
        if (rev) { const c = rev.closest('.stat-card'); if (c) { c.style.display = "flex"; const l = c.querySelector('.stat-label'); if (l) l.innerText = this.uRole === 'STAFF' ? "Doanh thu của bạn" : "Tổng doanh thu"; } }
        if (exp) { const c = exp.closest('.stat-card'); if (c) { c.style.display = "flex"; const l = c.querySelector('.stat-label'); if (l) l.innerText = this.uRole === 'STAFF' ? "Chi phí của bạn" : "Tổng chi phí phát sinh"; } }
        if (opt) opt.disabled = (this.uRole === 'STAFF' || this.uRole === 'MANAGER');
    },

    // 🌟 4. THUẬT TOÁN MD5 NỘI BỘ MỚI - ĐÃ SỬA LỖI CHỮ BB THÀNH GG CHUẨN XÁC
    md5: function(string) {
        function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
        function AddUnsigned(lX, lY) {
            var lX4 = (lX & 0x40000000), lY4 = (lY & 0x40000000), lX8 = (lX & 0x80000000), lY8 = (lY & 0x80000000);
            var lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            if (lX4 | lY4) { if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8); else return (lResult ^ 0x40000000 ^ lX8 ^ lY8); }
            else return (lResult ^ lX8 ^ lY8);
        }
        function F(x,y,z) { return (x & y) | ((~x) & z); }
        function G(x,y,z) { return (x & z) | (y & (~z)); }
        function H(x,y,z) { return (x ^ y ^ z); }
        function I(x,y,z) { return (y ^ (x | (~z))); }
        function FF(a,b,c,d,x,s,ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b,c,d), x), ac)); return AddUnsigned(RotateLeft(a,s),b); };
        function GG(a,b,c,d,x,s,ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b,c,d), x), ac)); return AddUnsigned(RotateLeft(a,s),b); };
        function HH(a,b,c,d,x,s,ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b,c,d), x), ac)); return AddUnsigned(RotateLeft(a,s),b); };
        function II(a,b,c,d,x,s,ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b,c,d), x), ac)); return AddUnsigned(RotateLeft(a,s),b); };
        var k,AA,BB,CC,DD,a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476;
        var lMessageLength = string.length, lNumberOfWords_temp1 = lMessageLength + 4, lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64, lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16, x = Array(lNumberOfWords - 1), lBytePosition = 0, lByteCount = 0;
        while (lByteCount < lMessageLength) { k = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; x[k] = (x[k] | (string.charCodeAt(lByteCount) << lBytePosition)); lByteCount++; }
        k = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; x[k] = x[k] | (0x80 << lBytePosition); x[lNumberOfWords - 2] = lMessageLength << 3; x[lNumberOfWords - 1] = lMessageLength >>> 29;
        for (k=0; k<x.length; k+=16) {
            AA=a; BB=b; CC=c; DD=d;
            a=FF(a,b,c,d,x[k+0],7,0xD76AA478); d=FF(d,a,b,c,x[k+1],12,0xE8C7B756); c=FF(c,d,a,b,x[k+2],17,0x242070DB); b=FF(b,c,d,a,x[k+3],22,0xC1BDCEEE); a=FF(a,b,c,d,x[k+4],7,0xF57C0FAF); d=FF(d,a,b,c,x[k+5],12,0x4787C62A); c=FF(c,d,a,b,x[k+6],17,0xA8304613); b=FF(b,c,d,a,x[k+7],22,0xFD469501); a=FF(a,b,c,d,x[k+8],7,0x698098D8); d=FF(d,a,b,c,x[k+9],12,0x8B44F7AF); c=FF(c,d,a,b,x[k+10],17,0xFFFF5BB1); b=FF(b,c,d,a,x[k+11],22,0x895CD7BE); a=FF(a,b,c,d,x[k+12],7,0x6B901122); d=FF(d,a,b,c,x[k+13],12,0xFD987193); c=FF(c,d,a,b,x[k+14],17,0xA679438E); b=FF(b,c,d,a,x[k+15],22,0x49B40821);
            a=GG(a,b,c,d,x[k+1],5,0xF61E2562); d=GG(d,a,b,c,x[k+6],9,0xC040B340); c=GG(c,d,a,b,x[k+11],14,0x265E5A51); b=GG(b,c,d,a,x[k+0],20,0xE9B6C7AA); a=GG(a,b,c,d,x[k+5],5,0xD62F105D); d=GG(d,a,b,c,x[k+10],9,0x02441453); c=GG(c,d,a,b,x[k+15],14,0xD8A1E681); b=GG(b,c,d,a,x[k+4],20,0xE7D3FBC8); a=GG(a,b,c,d,x[k+9],5,0x21E1CDE6); d=GG(d,a,b,c,x[k+14],9,0xC33707D6); c=GG(c,d,a,b,x[k+3],14,0xF4D50D87); b=GG(b,c,d,a,x[k+8],20,0x455A14ED); a=GG(a,b,c,d,x[k+13],5,0xA9E3E905); d=GG(d,a,b,c,x[k+2],9,0xFCEFA3F8); c=GG(c,d,a,b,x[k+7],14,0x676F02D9); b=GG(b,c,d,a,x[k+12],20,0x8D2A4C8A);
            a=HH(a,b,c,d,x[k+5],4,0xFFFA3942); d=HH(d,a,b,c,x[k+8],11,0x8771F681); c=HH(c,d,a,b,x[k+11],16,0x6D9D6122); b=HH(b,c,d,a,x[k+14],23,0xFDE5380C); a=HH(a,b,c,d,x[k+1],4,0xA4BEEA44); d=HH(d,a,b,c,x[k+4],11,0x4BDECFA9); c=HH(c,d,a,b,x[k+7],16,0xF6BB4B60); b=HH(b,c,d,a,x[k+10],23,0xBEBFBC70); a=HH(a,b,c,d,x[k+13],4,0x681279174); d=HH(d,a,b,c,x[k+0],11,-358537222); c=HH(c,d,a,b,x[k+3],16,-722521979); b=HH(b,c,d,a,x[k+6],23,0x00760291); a=HH(a,b,c,d,x[k+9],4,-640364487); d=HH(d,a,b,c,x[k+12],11,-421815835); c=HH(c,d,a,b,x[k+15],16,0x05307425); b=HH(b,c,d,a,x[k+2],23,-995338651);
            a=II(a,b,c,d,x[k+0],6,0xF4292244); d=II(d,a,b,c,x[k+7],10,0x432AFF97); c=II(c,d,a,b,x[k+14],15,-1416354905); b=II(b,c,d,a,x[k+5],21,-57434055); a=II(a,b,c,d,x[k+12],6,0x1700485571); d=II(d,a,b,c,x[k+3],10,-1894986606); c=II(c,d,a,b,x[k+10],15,-1051523); b=II(b,c,d,a,x[k+1],21,-2054922799); a=II(a,b,c,d,x[k+8],6,0x1873313359); d=II(d,a,b,c,x[k+15],10,-30611744); c=II(c,d,a,b,x[k+6],15,-1560198380); b=II(b,c,d,a,x[k+13],21,0x1309151649); a=II(a,b,c,d,x[k+4],6,-145523070); d=II(d,a,b,c,x[k+11],10,-1120210379); c=II(c,d,a,b,x[k+2],15,0x0718787281); b=II(b,c,d,a,x[k+9],21,-343485551);
            a=AddUnsigned(a,AA); b=AddUnsigned(b,BB); c=AddUnsigned(c,CC); d=AddUnsigned(d,DD);
        }
        var WordToHex = function(lValue) { var WordToHexValue="", WordToHexValue_temp="", lByte, lCount; for (lCount = 0;lCount<=3;lCount++) { lByte = (lValue >>> (lCount * 8)) & 255; WordToHexValue_temp = "0" + lByte.toString(16); WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2); } return WordToHexValue; };
        return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toLowerCase();
    },

    // Logic Xử lý Đăng nhập qua Firebase Realtime Database (BẢN CHỮ THÔ KHÔNG MÃ HÓA)
    handleLogin: async function() {
        const u = document.getElementById('un').value.trim().toLowerCase(), p = document.getElementById('pw').value.trim();
        if (!u || !p) { NotiModule.show("Vui lòng điền đầy đủ thông tin!", "error"); return; }
        
        try {
            const cleanUrl = this.FB_URL.replace(/\/$/, '');
            const response = await fetch(`${cleanUrl}/noi_bo/${u}.json`);
            if (!response.ok) throw new Error("Lỗi kết nối máy chủ bảo mật!");
            
            const res = await response.json();
            if (res) {
                // 🌟 ĐÃ FIX: So sánh trực tiếp mật khẩu người dùng gõ (p) với mật khẩu thô trên Firebase (res.password_hash)
                if (res.password_hash === p) {
                    this.uName = u.toUpperCase(); this.uRole = res.role.toUpperCase();
                    localStorage.setItem('loggedUser', this.uName); localStorage.setItem('loggedRole', this.uRole);
                    this.applyLoginUI(); 
                    NotiModule.show(`Chào mừng ${this.uName} (${this.uRole}) quay trở lại!`, "success");
                } else {
                    NotiModule.show("Mật khẩu không chính xác!", "error");
                }
            } else {
                NotiModule.show("Tài khoản không tồn tại trên hệ thống!", "error");
            }
        } catch (e) { NotiModule.show("Lỗi hệ thống auth: " + e.message, "error"); }
    },


    // 6. Logic Xử lý Đăng xuất và dọn dẹp bộ nhớ màn hình
    handleLogout: function() {
        if (typeof ThuChiModule !== 'undefined') { ThuChiModule.totalOrders = ThuChiModule.totalRevenue = ThuChiModule.totalExpense = 0; ThuChiModule.duLieuGiaoDichHomNay = []; ThuChiModule.uSt(); ThuChiModule.capNhatKhoiDoiSoat([]); }
        localStorage.removeItem('r199k_members_cache'); localStorage.removeItem('r199k_members_cache_time');
        if (typeof RenewalModule !== 'undefined') RenewalModule.lichSuCache = {};
        if (document.getElementById('bảng-giao-dịch')) document.getElementById('bảng-giao-dịch').innerHTML = '';
        localStorage.removeItem('loggedUser'); localStorage.removeItem('loggedRole');
        this.uName = 'ADMIN'; this.uRole = 'STAFF';
        document.getElementById('pw').value = ''; document.getElementById('un').value = '';
        document.getElementById('ap').classList.remove('auth'); document.getElementById('lg-sc').style.display = 'flex';
        if (typeof st === 'function') st('t'); NotiModule.show("Đã đăng xuất tài khoản!", "info");
    }
};
