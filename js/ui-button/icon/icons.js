const ICON_LIBRARY = {
    "user": "user.svg",
    "log-out": "log-out.svg",

    "g-199k": "manage-g199.svg",
    "thu-chi": "money.svg",

    "tang-truong": "tang-truong.svg",

    "qlkh": "qlkh.svg",
    "community": "community.svg"
};

const ICON_BASE_PATH = "data/img/icon/";

// Tạo hàm để UserModule có thể gọi lại được
function renderIcons() {
    const iconElements = document.querySelectorAll("[data-icon]");
    
    iconElements.forEach(element => {
        // Nếu đã có ảnh icon bên trong rồi thì bỏ qua không chèn lại
        if (element.querySelector('.ui-icon-img')) return;

        const iconName = element.getAttribute("data-icon");
        
        if (ICON_LIBRARY[iconName]) {
            const fileName = ICON_LIBRARY[iconName];
            const fullPath = `${ICON_BASE_PATH}${fileName}`;
            
            element.innerHTML = `<img src="${fullPath}" alt="${iconName}" class="ui-icon-img">`;
            element.classList.add("ui-icon-container");
        } else {
            console.warn(`[Icon Error]: Không tìm thấy cấu hình cho icon "${iconName}"`);
        }
    });
}

// Tự động chạy lần đầu khi tải trang
document.addEventListener("DOMContentLoaded", () => {
    renderIcons();
});
