const NotiModule = {
    // Hàm hiển thị thông báo chung
    // type: 'success' (thành công), 'error' (lỗi), 'info' (thông tin)
    show: function(message, type = 'info') {
        let container = document.getElementById('toast-container');
        
        // Nếu trên giao diện chưa có khung chứa -> Tự động sinh ra bọc vào body
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        // Tạo thẻ div chứa nội dung tin nhắn đẩy
        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        
        // Gán biểu tượng icon tương ứng với từng trạng thái
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
        
        // Chèn thông báo mới lên đầu khung chứa
        container.appendChild(toast);

        // Tự động kích hoạt luồng xóa bỏ thông báo sau 4 giây hiển thị
        setTimeout(() => {
            toast.classList.add('fade-out');
            // Đợi hiệu ứng mờ dần hoàn tất rồi xóa hẳn thẻ khỏi HTML
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 4000);
    }
};
