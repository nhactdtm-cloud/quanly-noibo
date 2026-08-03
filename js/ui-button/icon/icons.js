const ICON_LIBRARY = {
    "user": "user.svg",
    "log-out": "log-out.svg",

    "g-199k": "manage-g199.svg",
    "thu-chi": "money.svg",

    "tang-truong": "tang-truong.svg",

    "qlkh": "qlkh.svg",
    "repeat": "repeat.svg",    
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

//---------------------------------------------------

// Cấu hình danh sách file ảnh tương ứng cho từng Emoji
const EMOJI_LIBRARY = {
    "ℹ️": "info.svg",
    "✅": "success.svg",
    "❌": "error.svg",
    "⚠️": "warning.svg",
    "may-in": "may-in.svg",
    "delete": "delete.svg",
    "bat-dau": "bat-dau.svg",
    "ket-thuc": "ket-thuc.svg",
    "con-lai": "con-lai.svg" // Tên file ảnh nằm trong thư mục emoji của bạn
};

// Đường dẫn thư mục gốc chung cho Emoji (Giống như ICON_BASE_PATH)
const EMOJI_BASE_PATH = "data/img/emoji/";

// Hàm quét và chuyển đổi cấu hình emoji thành thẻ <img>
function renderEmojis() {
    const emojiElements = document.querySelectorAll("[data-emoji]");
    
    emojiElements.forEach(element => {
        // Nếu bên trong đã có ảnh rồi thì bỏ qua không chèn lại tránh lặp cấu trúc
        if (element.querySelector('.ui-emoji-img')) return;

        const emojiChar = element.getAttribute("data-emoji");
        
        // Nếu tìm thấy file cấu hình cho emoji này
        if (EMOJI_LIBRARY[emojiChar]) {
            const fileName = EMOJI_LIBRARY[emojiChar];
            const fullPath = `${EMOJI_BASE_PATH}${fileName}`; // Ghép đường dẫn chung
            
            // Tạo thẻ img và truyền link ảnh vào thuộc tính src
            element.innerHTML = `<img src="${fullPath}" alt="${emojiChar}" class="ui-emoji-img">`;
            element.classList.add("ui-emoji-container");
        } else {
            console.warn(`[Emoji Error]: Chưa cấu hình file ảnh cho emoji "${emojiChar}"`);
        }
    });
}

// Tự động kích hoạt quét cả Icon và Emoji khi trang web tải xong lần đầu
document.addEventListener("DOMContentLoaded", () => {
    renderIcons();
    renderEmojis();
});
