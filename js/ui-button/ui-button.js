const UIButton = {
    closeModal(id = "ui-close-btn") {
        return `<span id="${id}" class="ui-close-btn">&times;</span>`;
    },

    setupCloseEvent(id, modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const closeBtn = document.getElementById(id);

        // Cách viết an toàn: Xóa sự kiện cũ trước khi gán sự kiện mới để tránh lặp bộ nhớ
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
    }
};
