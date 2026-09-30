// ======================
// TitleManager.js
// ======================

const startButton = document.getElementById("start-button");

if (startButton) {

    startButton.addEventListener("click", () => {
        showCharacterSelect();
    });

}


// ======================
// 遊び方ガイド
// ======================

const howToPlayButton = document.getElementById("how-to-play-button");
const howToPlayModal = document.getElementById("how-to-play-modal");
const howToPlayClose = document.getElementById("how-to-play-close");
const howToPlayCloseBottom = document.getElementById("how-to-play-close-bottom");

function openHowToPlay() {
    if (!howToPlayModal) return;
    howToPlayModal.classList.remove("hidden");
    howToPlayModal.setAttribute("aria-hidden", "false");
}

function closeHowToPlay() {
    if (!howToPlayModal) return;
    howToPlayModal.classList.add("hidden");
    howToPlayModal.setAttribute("aria-hidden", "true");
}

if (howToPlayButton) {
    howToPlayButton.addEventListener("click", openHowToPlay);
}

if (howToPlayClose) {
    howToPlayClose.addEventListener("click", closeHowToPlay);
}

if (howToPlayCloseBottom) {
    howToPlayCloseBottom.addEventListener("click", closeHowToPlay);
}

if (howToPlayModal) {
    howToPlayModal.addEventListener("click", event => {
        if (event.target === howToPlayModal) {
            closeHowToPlay();
        }
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && howToPlayModal && !howToPlayModal.classList.contains("hidden")) {
        closeHowToPlay();
    }
});
