const NotiModule = {
    show: function(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        
        const titles = { 'success': 'Thành công', 'error': 'Lỗi hệ thống', 'info': 'Thông báo' };
        const currentTitle = titles[type] || 'Thông báo';

        // 🌟 GỌI HÀM: Chèn nút đóng được xuất từ UIButton.closeToast()
        toast.innerHTML = `
            <div class="toast-icon" data-emoji="${type}"></div>
            <div class="toast-body">
                <div class="toast-title">${currentTitle}</div>
                <div class="toast-message">${message}</div>
            </div>
            ${UIButton.closeToast()} 
        `;
        
        container.appendChild(toast);

        if (typeof renderEmojis === "function") {
            renderEmojis();
        }

        // 🌟 GỌI HÀM: Kích hoạt sự kiện bấm nút đóng thông báo từ UIButton
        UIButton.setupToastCloseEvent(toast);

        // Tự động đóng sau 3 giây nếu người dùng không tự tay bấm (X)
        setTimeout(() => {
            if (toast && toast.parentNode && !toast.classList.contains('fade-out')) {
                toast.classList.add('fade-out');
                setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
            }
        }, 3000); 
    }
};
