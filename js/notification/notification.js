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
        
        // Định nghĩa tiêu đề ngôn ngữ tương ứng dựa vào type
        const titles = { 'success': 'Thành công', 'error': 'Lỗi hệ thống', 'info': 'Thông báo' };
        const currentTitle = titles[type] || 'Thông báo';

        // Cấu trúc HTML phân tầng chuẩn giao diện hiện đại
        toast.innerHTML = `
            <div class="toast-icon" data-emoji="${type}"></div>
            <div class="toast-body">
                <div class="toast-title">${currentTitle}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;
        
        container.appendChild(toast);

        // Chạy hàm quét thư viện emoji để tự động biến thẻ div.toast-icon thành thẻ img chứa SVG của bạn
        if (typeof renderEmojis === "function") {
            renderEmojis();
        }

        // Hàm xử lý đóng/xóa toast
        const closeToast = () => {
            if (toast.classList.contains('fade-out')) return;
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 350);
        };

        // Lắng nghe sự kiện click nút đóng (X)
        toast.querySelector('.toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeToast();
        });

        // Tự động tắt sau đúng 3 giây (3000ms) trùng với hiệu ứng thanh chạy ngầm
        setTimeout(closeToast, 3000); 
    }
};
