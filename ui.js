
function ensurePileViewer(){
    let modal=document.getElementById("pile-viewer-modal");if(modal)return modal;
    modal=document.createElement("div");modal.id="pile-viewer-modal";modal.className="pile-viewer-modal hidden";
    modal.innerHTML=`<div class="pile-viewer-backdrop"></div><div class="pile-viewer-card"><button id="pile-viewer-close" class="pile-viewer-close" type="button">×</button><h3 id="pile-viewer-title"></h3><div id="pile-viewer-list"></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector(".pile-viewer-backdrop").addEventListener("click",()=>modal.classList.add("hidden"));
    modal.querySelector("#pile-viewer-close").addEventListener("click",()=>modal.classList.add("hidden"));
    return modal;
}
function showPileViewer(title,cardIds){
    const modal=ensurePileViewer();modal.querySelector("#pile-viewer-title").textContent=title;
    const counts=new Map();(cardIds||[]).forEach(id=>counts.set(id,(counts.get(id)||0)+1));
    modal.querySelector("#pile-viewer-list").innerHTML=counts.size?[...counts.entries()].map(([id,count])=>{const card=cards[id];if(!card)return"";return`<div class="pile-viewer-item ${card.rarity||"common"}"><div><strong>${card.name}</strong><small>${String(card.rarity||"common").toUpperCase()} / COST ${card.cost}</small></div><span>×${count}</span></div>`;}).join(""):`<p class="pile-viewer-empty">カードはありません。</p>`;
    modal.classList.remove("hidden");
}
function renderBattleDeckStatus(){
    if(!player)return;
    if(!Array.isArray(player.exhaustPile))player.exhaustPile=[];

    const drawContainer=document.getElementById("battle-draw-pile");
    const sideContainer=document.getElementById("battle-side-piles");
    const legacy=document.getElementById("battle-deck-status");

    const discard=player.discardPile?.length||0;
    let graveClass="";
    if(selectedCharacter==="gravekeeper"){
        graveClass=discard>=10?" grave-hot":discard>=6?" grave-ready":" grave-focus";
    }

    if(drawContainer){
        drawContainer.innerHTML=`<button class="pile-counter compact-pile draw" data-pile="draw" type="button" title="山札を確認"><span>📚</span><strong>${player.drawPile?.length||0}</strong></button>`;
    }

    if(sideContainer){
        sideContainer.innerHTML=`
          <button class="pile-counter compact-pile discard${graveClass}" data-pile="discard" type="button" title="捨て札を確認"><span>🪦</span><strong>${discard}</strong></button>
          <button class="pile-counter compact-pile exhaust" data-pile="exhaust" type="button" title="消滅を確認"><span>🔥</span><strong>${player.exhaustPile.length}</strong></button>`;
    }

    if(legacy){legacy.innerHTML="";}

    const config={
        draw:["📚 山札",player.drawPile||[]],
        discard:["🪦 捨て札",player.discardPile||[]],
        exhaust:["🔥 消滅",player.exhaustPile||[]]
    };

    [drawContainer,sideContainer].filter(Boolean).forEach(container=>{
        container.querySelectorAll("[data-pile]").forEach(button=>button.addEventListener("click",()=>{
            const[t,ids]=config[button.dataset.pile];
            showPileViewer(t,ids);
        }));
    });
}

// ======================
// v18 レリック取得演出
// ======================

function showRelicAcquired(relicId) {

    const relic =
        typeof relics !== "undefined"
            ? relics[relicId]
            : null;

    if (!relic) {
        return;
    }

    let overlay =
        document.getElementById("relic-acquire-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "relic-acquire-overlay";
        overlay.className = "relic-acquire-overlay";
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="relic-acquire-card">
            <div class="relic-acquire-kicker">NEW RELIC</div>
            <div class="relic-acquire-icon">${relic.icon || "💎"}</div>
            <div class="relic-acquire-name">${relic.name}</div>
            <div class="relic-acquire-description">${relic.description || ""}</div>
        </div>
    `;

    overlay.classList.remove("show");
    void overlay.offsetWidth;
    overlay.classList.add("show");

    window.clearTimeout(showRelicAcquired._hideTimer);
    window.clearTimeout(showRelicAcquired._clearTimer);

    showRelicAcquired._hideTimer =
        window.setTimeout(() => {
            overlay.classList.remove("show");
        }, 1450);

    showRelicAcquired._clearTimer =
        window.setTimeout(() => {
            if (!overlay.classList.contains("show")) {
                overlay.innerHTML = "";
            }
        }, 1800);
}


// ======================
// v16 戦闘フィードバック
// ======================

let combatFxStagger = 0;

function getCombatTargetElement(target) {
    if (target === "enemy") {
        return document.querySelector("#enemy-field .enemy-unit.selected-target") ||
            document.querySelector("#enemy-field .enemy-unit");
    }

    return document.getElementById("player-area");
}

function showFloatingCombatText(target, text, kind = "damage", delay = null) {

    const parent = getCombatTargetElement(target);

    if (!parent) {
        return;
    }

    const actualDelay =
        delay === null
            ? Math.min(combatFxStagger++ * 65, 260)
            : delay;

    window.setTimeout(() => {

        const element = document.createElement("div");
        element.className = `combat-floating-text ${kind}`;
        element.textContent = text;

        parent.appendChild(element);

        window.setTimeout(() => {
            element.remove();
        }, 850);

    }, actualDelay);

    window.clearTimeout(showFloatingCombatText._resetTimer);
    showFloatingCombatText._resetTimer = window.setTimeout(() => {
        combatFxStagger = 0;
    }, 330);
}

function triggerBattleTargetEffect(target, kind = "hit") {

    const element = getCombatTargetElement(target);

    if (!element) {
        return;
    }

    element.classList.remove("fx-hit", "fx-block", "fx-heal");
    void element.offsetWidth;
    element.classList.add(`fx-${kind}`);

    window.setTimeout(() => {
        element.classList.remove(`fx-${kind}`);
    }, 190);
}

function triggerCardCastEffect(card) {

    const battle =
        document.getElementById("battle-screen");

    if (!battle || !card) {
        return;
    }

    let effectClass =
        card.type === "attack"
            ? "cast-attack"
            : "cast-skill";

    if (card.element) {
        effectClass = `cast-${card.element}`;
    }

    battle.classList.remove(
        "cast-attack",
        "cast-skill",
        "cast-fire",
        "cast-lightning",
        "cast-ice"
    );

    void battle.offsetWidth;
    battle.classList.add(effectClass);

    window.setTimeout(() => {
        battle.classList.remove(effectClass);
    }, 210);
}

function showRelicTrigger(relicId, message = "") {

    const feed =
        document.getElementById("relic-trigger-feed");

    const relic =
        typeof relics !== "undefined"
            ? relics[relicId]
            : null;

    if (!feed || !relic) {
        return;
    }

    const toast = document.createElement("div");
    toast.className = "relic-trigger-toast";

    toast.innerHTML = `
        <span class="relic-trigger-icon">${relic.icon || "💎"}</span>
        <span>
            <strong>${relic.name}</strong>
            ${message ? `<small>${message}</small>` : ""}
        </span>
    `;

    feed.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add("leaving");
    }, 1300);

    window.setTimeout(() => {
        toast.remove();
    }, 1650);
}

function updateBattleHpBar(fillId, current, max) {

    const fill = document.getElementById(fillId);

    if (!fill) {
        return;
    }

    const percent =
        max > 0
            ? Math.max(0, Math.min(100, current / max * 100))
            : 0;

    fill.style.width = `${percent}%`;
}

function updatePersistentRunHud() {

    const hud = document.getElementById("persistent-run-hud");
    const hp = document.getElementById("persistent-run-hp");

    if (!hud || !hp) {
        return;
    }

    const runScene =
        typeof Scene !== "undefined" &&
        ["map", "reward"].includes(Scene.current);

    if (!player || !runScene) {
        hud.classList.add("hidden");
        return;
    }

    hp.textContent = `${player.hp} / ${player.maxHp}`;
    hud.classList.remove("hidden");
}


function updatePlayerUI() {

    updatePersistentRunHud();
    if (typeof renderPotionBelt === "function") renderPotionBelt();

    const playerName =
        document.getElementById("player-name");

    const playerAvatar =
        document.getElementById("player-avatar");

    const characterIcons = {
        warrior: "⚔️",
        wizard: "🔮",
        machinist: "⚙️",
        gravekeeper: "🪦"
    };

    if (playerName) {
        playerName.textContent =
            characters?.[selectedCharacter]?.name ||
            "Player";
    }

    if (playerAvatar) {
        playerAvatar.textContent =
            characterIcons[selectedCharacter] || "🧭";
    }

    const battleFloorIndicator =
        document.getElementById("battle-floor-indicator");

    if (battleFloorIndicator) {
        const floorLabel =
            typeof currentDepth !== "undefined"
                ? `B${currentDepth}`
                : "B1";

        battleFloorIndicator.textContent = floorLabel;
    }

    const battleGoldIndicator =
        document.getElementById("battle-gold-indicator");

    if (battleGoldIndicator) {
        battleGoldIndicator.textContent =
            `💰 ${player.gold || 0}`;
    }

    const playerHpText = document.getElementById("player-hp");
    if (playerHpText) {
        playerHpText.textContent = `HP : ${player.hp} / ${player.maxHp}`;
    }

    const battlePlayerHp = document.getElementById("battle-player-hp");
    if (battlePlayerHp) {
        battlePlayerHp.textContent = `❤️ ${player.hp} / ${player.maxHp}`;
    }

    const playerEnergy = document.getElementById("player-energy");
    if (playerEnergy) {
        playerEnergy.innerHTML = `
            <span class="player-resource energy" title="エナジー">⚡ <strong>${player.energy}</strong></span>
            <span class="player-resource block" title="ブロック">🛡️ <strong>${player.block}</strong></span>
        `;
    }

    updateBattleHpBar(
        "player-hp-bar-fill",
        player.hp,
        player.maxHp
    );

    renderPlayerEffects();
    renderBattleDeckStatus();
}


function renderPlayerEffects() {

    const container = document.getElementById("player-effects");

    if (!container || !player) {
        return;
    }

    const effects = [];

    if (selectedCharacter === "warrior") {
        effects.push({ className: "rage", icon: "🔥", value: player.rage || 0, name: "闘志", description: `現在の闘志：${player.rage || 0}` });
    }

    if (selectedCharacter === "wizard") {
        const elementIcons = {
            fire: "🔥",
            lightning: "⚡",
            ice: "❄️"
        };

        const nextHints = {
            fire: "🔥→⚡：追加ダメージ。次に雷属性を使うと連鎖します。",
            lightning: "⚡→❄️：ブロック獲得。次に氷属性を使うと連鎖します。",
            ice: "❄️→🔥：カードを1枚引く。次に火属性を使うと連鎖します。"
        };

        const description =
            player.lastElement
                ? nextHints[player.lastElement]
                : "属性カードを順番につなぐと追加効果。🔥→⚡：追加ダメージ / ⚡→❄️：ブロック / ❄️→🔥：1ドロー。";

        effects.push({
            className: "element",
            icon: player.lastElement
                ? (elementIcons[player.lastElement] || "✨")
                : "🔗",
            value: "",
            name: "属性連鎖",
            description
        });
    }

    if ((player.nextTurnEnergyBonus || 0) > 0) effects.push({ className: "positive", icon: "⚡↑", value: player.nextTurnEnergyBonus, name: "次ターン加速", description: `次のターン：エナジー +${player.nextTurnEnergyBonus}` });
    if ((player.nextTurnEnergyPenalty || 0) > 0) effects.push({ className: "negative", icon: "⚡↓", value: player.nextTurnEnergyPenalty, name: "次ターン反動", description: `次のターン：エナジー -${player.nextTurnEnergyPenalty}` });

    if (typeof getStatusEntries === "function") {
        getStatusEntries(player).forEach(status => {
            effects.push({
                className: status.kind === "debuff" ? "negative" : "positive",
                icon: status.icon,
                value: status.value,
                name: status.name,
                description: typeof formatStatusDescription === "function" ? formatStatusDescription(status.id, status.value) : String(status.description || "").replaceAll("X", String(status.value))
            });
        });
    }

    container.innerHTML = effects.map(effect => `
        <span class="battle-effect-icon ${effect.className}" data-tooltip="${effect.name}${effect.value !== "" ? ` ${effect.value}` : ""}：${effect.description}" tabindex="0">
            <span class="effect-symbol">${effect.icon}</span>
            <span class="effect-name">${effect.name}</span>
            ${effect.value !== "" ? `<strong>${effect.value}</strong>` : ""}
        </span>
    `).join("");
}

function updateEnemyUI() {

    const field = document.getElementById("enemy-field");
    if (!field) return;

    const units = (typeof battleEnemies !== "undefined" && battleEnemies.length) ? battleEnemies : (enemy ? [enemy] : []);
    if (!units.length) {
        field.innerHTML = "";
        return;
    }

    if (typeof syncSelectedEnemy === "function") syncSelectedEnemy();

    field.classList.toggle("multi-enemy", units.filter(unit => unit && unit.hp > 0).length > 1);

    field.innerHTML = units.map((unit, index) => {
        const dead = !unit || unit.hp <= 0;
        const selected = index === selectedEnemyIndex && !dead;
        const move = unit?.nextMove;
        let visibleIntent = "❔";
        let intentTooltip = "次の行動：不明";
        let intentClass = "special";

        if (move) {
            if (move.type === "attack") {
                intentClass = "attack";
                const shownDamage = typeof modifyAttackDamage === "function" ? modifyAttackDamage(unit, player, move.value) : move.value;
                const attackValue = move.hits && move.hits > 1 ? `${shownDamage}×${move.hits}` : `${shownDamage}`;
                visibleIntent = `⚔️ ${attackValue}`;
                intentTooltip = `攻撃：${attackValue}`;
                if (move.applyStatus && typeof STATUS_DEFS !== "undefined") {
                    const status = STATUS_DEFS[move.applyStatus.id];
                    if (status) {
                        const isDebuff = status.kind === "debuff";
                        visibleIntent += isDebuff ? " ☠️" : " ✨";
                        intentTooltip += isDebuff
                            ? " / デバフを付与しようとしている"
                            : " / バフを付与しようとしている";
                    }
                }
            } else if (move.type === "block") {
                intentClass = "block";
                visibleIntent = "🛡️";
                intentTooltip = "防御しようとしている";
            } else {
                visibleIntent = "✨";
                intentTooltip = "何かしようとしている（攻撃ではない）";
            }
        }

        const hpPercent = unit?.maxHp > 0 ? Math.max(0, Math.min(100, unit.hp / unit.maxHp * 100)) : 0;
        const statusHtml = typeof getStatusEntries === "function" ? getStatusEntries(unit).map(status => {
            const detail = typeof formatStatusDescription === "function" ? formatStatusDescription(status.id, status.value) : String(status.description || "").replaceAll("X", String(status.value));
            return `<span class="enemy-status ${status.kind}" data-tooltip="${status.name} ${status.value}：${detail}">${status.icon}<span>${status.name}</span><strong>${status.value}</strong></span>`;
        }).join("") : "";

        const passiveText = unit?.passive ? `${unit.passive.label || "特性"}${unit.passiveTriggered ? "（発動済み）" : ""}：${unit.passive.description || ""}` : "";
        const art = unit?.image
            ? `<div class="enemy-icon has-image" style="background-image:url('${unit.image}')" aria-label="${unit.name || "敵"}"></div>`
            : `<div class="enemy-icon">${unit?.icon || "❔"}</div>`;

        return `
            <div class="battle-actor enemy-actor enemy-unit${selected ? " selected-target" : ""}${dead ? " defeated-enemy" : ""}" data-enemy-index="${index}" ${dead ? "aria-disabled=\"true\"" : "tabindex=\"0\""}>
                <div class="enemy-overhead-ui">
                    ${passiveText ? `<button class="enemy-passive-indicator" type="button" data-tooltip="${passiveText}" aria-label="${passiveText}">◆</button>` : ""}
                    <p class="enemy-intent-icon-only enemy-intent-${intentClass}" data-tooltip="${intentTooltip}">${visibleIntent}</p>
                </div>
                ${art}
                <div class="battle-hp-bar enemy-hp-bar enemy-hp-inline" aria-label="敵HP">
                    <div class="battle-hp-bar-fill" style="width:${hpPercent}%"></div>
                    <span class="enemy-hp-inline-text">${unit.hp} / ${unit.maxHp}　🛡️ ${unit.block || 0}</span>
                </div>
                <div class="enemy-status-strip">${statusHtml}</div>
                ${units.filter(x => x && x.hp > 0).length > 1 ? `<div class="enemy-target-label">${selected ? "TARGET" : "クリックで対象選択"}</div>` : ""}
            </div>`;
    }).join("");

    field.querySelectorAll(".enemy-unit:not(.defeated-enemy)").forEach(unitEl => {
        const choose = () => {
            const index = Number(unitEl.dataset.enemyIndex);
            if (typeof selectEnemyTarget === "function") selectEnemyTarget(index);
        };
        unitEl.addEventListener("click", choose);
        unitEl.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                choose();
            }
        });
    });
}


function getDynamicCardDescription(card, target = enemy) {
    if (!card) return "";

    let description = card.description || "";

    if (card.type !== "attack" || !target || typeof getCardPreviewDamage !== "function") {
        return description;
    }

    const preview = getCardPreviewDamage(card, target);
    if (!preview) return description;

    // 表示だけを動的に変更する。カード本体のデータは書き換えない。
    if (preview.hits <= 1) {
        return description.replace(/\d+ダメージ/, `${preview.total}ダメージ`);
    }

    const multiHitPattern = /\d+ダメージを(\d+)回/;

    if (preview.first === preview.later && multiHitPattern.test(description)) {
        return description.replace(multiHitPattern, `${preview.first}ダメージを$1回`);
    }

    // 初撃だけ追加補正が入るなど、各ヒットが同じ値にならない場合。
    if (multiHitPattern.test(description)) {
        return description.replace(multiHitPattern, `合計${preview.total}ダメージ（現在）`);
    }

    return description.replace(/\d+ダメージ/, `${preview.total}ダメージ`);
}


function renderHand() {

    const handDiv = document.getElementById("hand");
    handDiv.innerHTML = "";

    player.hand.forEach((cardId, index) => {
        const card = cards[cardId];
        const cost = getCardCost(card);
        const affordable = !card.unplayable && player.energy >= cost;
        const cardElement = document.createElement("div");
        cardElement.className = `card ${card.rarity}${card.special ? " special-card" : ""}${card.upgraded ? " upgraded-card" : ""}${card.exhaust ? " exhaust-card" : ""}${affordable ? "" : " disabled"}`;

        const displayDescription = getDynamicCardDescription(card, enemy);

        cardElement.innerHTML = `
            ${card.exhaust ? `<span class="exhaust-card-badge">🔥 消滅</span>` : ""}
            ${card.upgraded ? `<span class="upgraded-card-badge">UP</span>` : ""}
            <h3>${card.name}</h3>
            <p>${card.unplayable ? "使用不可" : `Cost : ${cost}`}</p>
            <p>${displayDescription}</p>
        `;

        cardElement.addEventListener("click", () => {
            if (!affordable) return;
            playCard(index);
        });

        handDiv.appendChild(cardElement);
    });
    renderBattleDeckStatus();
}


function showPopup(title, buttonText){

    document
        .getElementById("popup-title")
        .textContent = title;

    document
        .getElementById("popup-button")
        .textContent = buttonText;

    document
        .getElementById("popup")
        .classList.remove("hidden");
}
