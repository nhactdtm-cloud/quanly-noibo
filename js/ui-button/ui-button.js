const UIButton = {
    // 1. Hàm tạo mã HTML cho nút đóng đóng Modal (Giữ nguyên của bạn)
    closeModal(id = "ui-close-btn") {
        return `<span id="${id}" class="ui-close-btn">&times;</span>`;
    },

    // 2. 🌟 HÀM MỚI: Tạo mã HTML cho Nút Xóa Tròn Hệ Thống (Dùng chung)
    deleteCircle(id = "", title = "Xóa dữ liệu") {
        // Trả về chuỗi HTML nút bấm tròn dính liền thẻ data-emoji
        return `<button id="${id}" class="ui-btn-delete-circle" title="${title}"><span data-emoji="delete"></span></button>`;
    },

    // 3. Gán sự kiện đóng đóng Modal (Giữ nguyên của bạn)
    setupCloseEvent(id, modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const closeBtn = document.getElementById(id);
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.remove('active');
                modal.classList.remove('show');
            };
        }

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                modal.classList.remove('show');
            }
        };
    },

    // 4. 🌟 HÀM MỚI: Gán sự kiện Click cho nút Xóa Tròn
    setupDeleteEvent(id, callback) {
        const deleteBtn = document.getElementById(id);
        if (!deleteBtn || typeof callback !== 'function') return;

        // Cách viết an toàn: Xóa sự kiện cũ trước khi gán sự kiện mới để tránh lặp bộ nhớ
        deleteBtn.onclick = null;
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            callback(); // Chạy hàm xử lý xóa truyền vào (ví dụ: xoaHoaDon, xoaGiaoDichLoi...)
        };
    }
};
