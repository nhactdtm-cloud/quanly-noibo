const G199kModule = {
    rRow: function(id, kh, gc, lgd, st, m, user) {
        const fS = st.toLocaleString('vi-VN');
        const isT = m === 'THU';
        const sign = isT ? `+${fS}` : `-${fS}`;
        const cls = isT ? 'thu' : 'chi';

        // 1. Chèn vào khối đối soát vừa nhập (Cột phải trang Thu Chi)
        const miniHtml = `
            <div class="history-mini-item">
                <div><b>#${id}</b> • ${kh}</div>
                <div class="${cls}">${sign}đ</div>
            </div>
        `;
        document.getElementById('mini-rows').insertAdjacentHTML('afterbegin', miniHtml);

        // 2. Chèn vào danh sách tổng (Trang G_199K)
        const fullHtml = `
            <div class="item">
                <div class="it-l">
                    <div class="it-id">#${id} • ${user}</div>
                    <div class="it-t">${kh} (${gc})</div>
                    <div class="it-m">${lgd} • THANH TOÁN</div>
                </div>
                <div class="it-r">
                    <span class="it-a ${cls}">${sign}đ</span>
                </div>
            </div>
        `;
        document.getElementById('l-r').insertAdjacentHTML('afterbegin', fullHtml);
    }
};
