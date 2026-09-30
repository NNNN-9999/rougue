

// ======================
// 所持レリックパネル開閉
// ======================

function setupOwnedRelicsToggle() {

    const panel =
        document.getElementById("owned-relics-panel");

    const button =
        document.getElementById("owned-relics-toggle");

    if (!panel || !button) {
        return;
    }

    const storageKey =
        "cardRoguelike_relicPanelCollapsed";

    const savedState =
        localStorage.getItem(storageKey);

    if (savedState === "true") {
        panel.classList.add("collapsed");
    }

    updateOwnedRelicsToggleUI();

    button.addEventListener("click", function () {

        panel.classList.toggle("collapsed");

        const collapsed =
            panel.classList.contains("collapsed");

        localStorage.setItem(
            storageKey,
            String(collapsed)
        );

        updateOwnedRelicsToggleUI();
    });
}


function updateOwnedRelicsToggleUI() {

    const panel =
        document.getElementById("owned-relics-panel");

    const button =
        document.getElementById("owned-relics-toggle");

    if (!panel || !button) {
        return;
    }

    const collapsed =
        panel.classList.contains("collapsed");

    button.setAttribute(
        "aria-expanded",
        String(!collapsed)
    );

    const arrow =
        button.querySelector(
            ".owned-relics-toggle-arrow"
        );

    if (arrow) {
        arrow.textContent =
            collapsed
                ? "▶"
                : "◀";
    }

    const label =
        button.querySelector(
            ".owned-relics-toggle-label"
        );

    if (label) {
        label.textContent =
            collapsed
                ? "レリック"
                : "所持レリック";
    }
}

// ======================
// script.js
// 全体の最小初期化
// ======================

console.log("★★★ script.js 読み込み成功");

const endTurnButton = document.getElementById("end-turn");

if (endTurnButton) {
    endTurnButton.addEventListener("click", endTurn);
}


document.addEventListener("DOMContentLoaded", function () {
    setupOwnedRelicsToggle();
});

// ======================
// v44 戦闘画面ガイド
// ======================
const battleGuideSteps = [
    { selector: "#battle-player-hp", title: "❤️ HP", text: "ここが現在のHPです。0になると探索終了です。" },
    { selector: "#player-energy", title: "⚡ エナジー / 🛡️ ブロック", text: "左がカードを使うためのエナジー、右が敵の攻撃を防ぐブロックです。" },
    { selector: "#player-effects", title: "✨ 自分に付いている効果", text: "闘志・属性連鎖・バフ・デバフなど、今の自分に付いている効果がここに表示されます。" },
    { selector: ".enemy-unit.selected-target .enemy-intent-icon-only, .enemy-unit .enemy-intent-icon-only", title: "👁️ 次の敵の行動", text: "ここを見ると、敵が次に攻撃するのか、防御するのかなどを確認できます。ダメージ量が出ている場合は次の攻撃量です。" },
    { selector: ".enemy-unit.selected-target .enemy-hp-inline, .enemy-unit .enemy-hp-inline", title: "❤️ 敵のHP", text: "敵の残りHPとブロックです。複数の敵がいるときは、攻撃したい敵をクリックして対象を選べます。" },
    { selector: "#hand", title: "🃏 手札", text: "ここが今使えるカードです。カードにはコストと効果が書かれています。" },
    { selector: "#battle-draw-pile", title: "📚 山札", text: "これから引くカードが入っています。山札がなくなると、捨て札を混ぜて新しい山札を作ります。" },
    { selector: "#battle-side-piles", title: "🗑️ 捨て札など", text: "使ったカードなどの置き場です。押すと中身を確認できます。" },
    { selector: "#end-turn", title: "⏭️ ターン終了", text: "カードを使い終えたらここを押します。敵の行動後、次の自分のターンになります。" }
];

let battleGuideIndex = 0;

function getBattleGuideTarget(step) {
    if (!step?.selector) return null;
    return document.querySelector(step.selector);
}

function positionBattleGuide() {
    const overlay = document.getElementById("battle-guide-overlay");
    if (!overlay || overlay.classList.contains("hidden")) return;

    const step = battleGuideSteps[battleGuideIndex];
    const target = getBattleGuideTarget(step);
    const focus = document.getElementById("battle-guide-focus");
    const card = document.getElementById("battle-guide-card");
    if (!focus || !card) return;

    let rect;
    if (target) {
        rect = target.getBoundingClientRect();
    } else {
        rect = { left: window.innerWidth/2-70, top: window.innerHeight/2-35, width:140, height:70, right:window.innerWidth/2+70, bottom:window.innerHeight/2+35 };
    }

    const pad = 8;
    focus.style.left = `${Math.max(6, rect.left-pad)}px`;
    focus.style.top = `${Math.max(6, rect.top-pad)}px`;
    focus.style.width = `${Math.max(50, rect.width+pad*2)}px`;
    focus.style.height = `${Math.max(42, rect.height+pad*2)}px`;

    const cardW = Math.min(390, window.innerWidth-28);
    const cardH = card.offsetHeight || 180;
    let left = rect.right + 18;
    if (left + cardW > window.innerWidth - 10) left = rect.left - cardW - 18;
    if (left < 10) left = Math.max(10, (window.innerWidth-cardW)/2);

    let top = rect.top + rect.height/2 - cardH/2;
    top = Math.max(10, Math.min(top, window.innerHeight-cardH-10));
    if (window.innerWidth < 700) {
        left = 10;
        top = rect.bottom + 16;
        if (top + cardH > window.innerHeight - 10) top = Math.max(10, rect.top-cardH-16);
    }

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
}

function renderBattleGuideStep() {
    const step = battleGuideSteps[battleGuideIndex];
    if (!step) return;
    document.getElementById("battle-guide-title").textContent = step.title;
    document.getElementById("battle-guide-text").textContent = step.text;
    document.getElementById("battle-guide-step-now").textContent = String(battleGuideIndex + 1);
    document.getElementById("battle-guide-step-total").textContent = String(battleGuideSteps.length);
    const prev = document.getElementById("battle-guide-prev");
    const next = document.getElementById("battle-guide-next");
    if (prev) prev.disabled = battleGuideIndex === 0;
    if (next) next.textContent = battleGuideIndex === battleGuideSteps.length - 1 ? "完了" : "次へ";
    requestAnimationFrame(positionBattleGuide);
}

function openBattleGuide() {
    const overlay = document.getElementById("battle-guide-overlay");
    if (!overlay) return;
    battleGuideIndex = 0;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    renderBattleGuideStep();
}

function closeBattleGuide() {
    const overlay = document.getElementById("battle-guide-overlay");
    if (!overlay) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("battle-guide-button")?.addEventListener("click", openBattleGuide);
    document.getElementById("battle-guide-close")?.addEventListener("click", closeBattleGuide);
    document.getElementById("battle-guide-prev")?.addEventListener("click", () => {
        battleGuideIndex = Math.max(0, battleGuideIndex - 1);
        renderBattleGuideStep();
    });
    document.getElementById("battle-guide-next")?.addEventListener("click", () => {
        if (battleGuideIndex >= battleGuideSteps.length - 1) {
            closeBattleGuide();
            return;
        }
        battleGuideIndex += 1;
        renderBattleGuideStep();
    });
    window.addEventListener("resize", positionBattleGuide);
});
