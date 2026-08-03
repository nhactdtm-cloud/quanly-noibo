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

// Tự động chạy lần đầu khi tải trang
document.addEventListener("DOMContentLoaded", () => {
    renderIcons();
});

//---------------------------------------------------

// 1. Danh sách cấu hình: Cứ gặp emoji này thì lấy link ảnh tương ứng
const EMOJI_LIBRARY = {
    "ℹ️": "data/img/emoji/info.svg",
    "✅": "data/img/emoji/success.svg",
    "❌": "data/img/emoji/error.svg",
    "⚠️": "data/img/emoji/warning.svg",
    "⏱️": "data/img/icon/community.svg"
    // Bạn có thể dán link ảnh dạng url web vào đây vẫn chạy tốt, ví dụ:
    // "🍎": "https://example.com"
};

// 2. Hàm quét và chuyển đổi link ảnh thành thẻ <img>
function renderEmojis() {
    const emojiElements = document.querySelectorAll("[data-emoji]");
    
    emojiElements.forEach(element => {
        // Nếu bên trong đã có ảnh rồi thì bỏ qua không chèn lại
        if (element.querySelector('.ui-emoji-img')) return;

        const emojiChar = element.getAttribute("data-emoji");
        
        // Nếu tìm thấy link ảnh cấu hình cho emoji này
        if (EMOJI_LIBRARY[emojiChar]) {
            const imgUrl = EMOJI_LIBRARY[emojiChar];
            
            // Tạo thẻ img và truyền link ảnh vào thuộc tính src
            element.innerHTML = `<img src="${imgUrl}" alt="${emojiChar}" class="ui-emoji-img">`;
            element.classList.add("ui-emoji-container");
        } else {
            console.warn(`[Emoji Error]: Chưa cấu hình link ảnh cho emoji "${emojiChar}"`);
        }
    });
}

// 3. Tự động chạy khi trang web tải xong
document.addEventListener("DOMContentLoaded", () => {
    renderIcons();
    renderEmojis();
});
