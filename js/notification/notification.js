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
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `<span>${icon}</span><div>${message}</div>`;
        container.appendChild(toast);

        // ⏱️ Chờ đúng 3 giây (3000ms) thì bắt đầu kích hoạt hiệu ứng rút sang phải
        setTimeout(() => {
            toast.classList.add('fade-out');
            
            // Chờ thêm 350 miligiây cho hiệu ứng trượt hẳn sang phải kết thúc rồi mới xoá thẻ khỏi HTML
            setTimeout(() => {
                if (toast) toast.remove();
            }, 350);
            
        }, 1500); 
    }
};
