const UIButton = {

    closeModal(targetFunction, id = "ui-close-btn") {
        return `
            <span 
                id="${id}"
                class="ui-close-btn">
                &times;
            </span>
        `;
    }

};