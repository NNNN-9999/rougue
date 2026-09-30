// ======================
// CharacterManager.js
// ======================

let player = null;

let selectedCharacter = null;


// ======================
// 共通：回復処理
// ======================

function getHealingMultiplier() {
    return 1;
}

// v31: ゴールド獲得を一箇所に集約。
// 「封金の導体」は現在の所持金を残し、新規獲得だけを止める。
function gainGold(amount) {
    if (!player || amount <= 0) {
        return 0;
    }

    if (
        Array.isArray(player.relics) &&
        player.relics.includes("sealedPurseCore")
    ) {
        return 0;
    }

    const gained = Math.floor(amount);
    player.gold = (player.gold || 0) + gained;

    if (typeof updatePersistentRunHud === "function") {
        updatePersistentRunHud();
    }

    return gained;
}


function healPlayer(baseAmount) {

    if (!player || baseAmount <= 0) {
        return 0;
    }

    const actualAmount = Math.max(
        0,
        Math.floor(
            baseAmount * getHealingMultiplier()
        )
    );

    const beforeHp = player.hp;

    player.hp = Math.min(
        player.maxHp,
        player.hp + actualAmount
    );

    const healed = player.hp - beforeHp;

    if (healed > 0 && typeof playSe === "function") {
        playSe("heal", 0.62);
    }

    if (
        healed > 0 &&
        typeof currentScene !== "undefined" &&
        currentScene === "battle" &&
        typeof showFloatingCombatText === "function"
    ) {
        showFloatingCombatText("player", `+${healed}`, "heal");
        triggerBattleTargetEffect("player", "heal");
    }

    if (typeof updatePersistentRunHud === "function") {
        updatePersistentRunHud();
    }

    return healed;
}


// ======================
// 共通：所持レリックUI
// ======================

function updateOwnedRelicUI() {

    const list =
        document.getElementById("owned-relics-list");

    if (!list) {
        return;
    }

    const ownedIds =
        Array.isArray(player?.relics)
            ? player.relics
            : [];

    if (ownedIds.length === 0) {
        list.innerHTML = `
            <div class="owned-relic-empty">
                なし
            </div>
        `;
        return;
    }

    list.innerHTML = ownedIds
        .map(relicId => {

            const relic = relics[relicId];

            if (!relic) {
                return "";
            }

            const bossClass =
                relic.category === "boss"
                    ? " boss"
                    : "";

            const details =
                relic.category === "boss"
                    ? `
                        <div class="owned-relic-benefit">
                            <strong>▲ メリット</strong>
                            <span>${relic.benefit || ""}</span>
                        </div>
                        <div class="owned-relic-drawback">
                            <strong>▼ デメリット</strong>
                            <span>${relic.drawback || ""}</span>
                        </div>
                    `
                    : `
                        <div class="owned-relic-description">
                            ${relic.description}
                        </div>
                    `;

            return `
                <div class="owned-relic-item${bossClass}" title="${relic.description}">
                    <div class="owned-relic-name">
                        ${relic.icon || (relic.category === "boss" ? "👑" : "💎")}
                        ${relic.name}
                    </div>
                    ${details}
                </div>
            `;
        })
        .join("");
}


// ======================
// キャラクター選択画面
// ======================

function showCharacterSelect(){

    changeScene("character");

    const list =
        document.getElementById("character-list");

    list.innerHTML = "";


    Object.values(characters).forEach(character => {

        // ======================
        // 固有レリック
        // ======================

        const characterRelics =
            character.relics || [];


        // ======================
        // アイコン
        // ======================

        let icon = "⚔️";


        if(character.id === "wizard"){
            icon = "🔥";
        }


        if(character.id === "archer"){
            icon = "🏹";
        }


        if(character.id === "machinist"){
            icon = "⚙️";
        }

        if(character.id === "gravekeeper"){
            icon = "🪦";
        }


        // ======================
        // キャラクターカード
        // ======================

        const card =
            document.createElement("div");


        card.className =
            "character-card";


        // ======================
        // レリック表示
        // ======================

        const relicHTML =
            characterRelics
                .map(relicId => {

                    const relic =
                        relics[relicId];


                    if(!relic){
                        return "";
                    }


                    return `
                        <div class="character-relic">

                            <strong>
                                ${relic.name}
                            </strong>

                            <p>
                                ${relic.description}
                            </p>

                        </div>
                    `;

                })
                .join("");


        // ======================
        // カード内容
        // ======================

        card.innerHTML = `

            <div class="character-icon">
                ${icon}
            </div>

            <div class="character-name">
                ${character.name}
            </div>

            <div class="character-info">

                ❤️ HP：${character.maxHp}

                <br>

                ⚡ エナジー：${character.maxEnergy}

            </div>

            <div class="character-relic-section">

                <h3>🛡️ 固有レリック</h3>

                ${relicHTML}

            </div>

            <button class="character-select-button">

                このキャラクターで開始

            </button>

        `;


        // ======================
        // 開始ボタン
        // ======================

        card
            .querySelector("button")
            .onclick = () => {

                startGame(character.id);

            };


        list.appendChild(card);

    });

}


// ======================
// ゲーム開始
// ======================

function startGame(characterId){

    const character =
        characters[characterId];

    if (!character) {

        console.error(
            "キャラクターが存在しません:",
            characterId
        );

        return;

    }

    if (typeof clearRunSave === "function") {
        clearRunSave();
    }

    selectedCharacter = characterId;


    // ======================
    // キャラクターコピー
    // ======================

    player =
        structuredClone(
            character
        );


    // ======================
    // レリック初期化
    // ======================

    player.relics = [
        ...(character.relics || [])
    ];


    // ======================
    // スキルツリー
    // ======================

    const skillBonus =
        getSkillBonusTotals();


    player.maxHp +=
        skillBonus.maxHp;


    player.skillBonus =
        skillBonus;

    // 探索系スキル：ラン開始時の所持金を増やす。
    player.gold +=
        skillBonus.startGold || 0;


    // ======================
    // 戦闘ステータス
    // ======================

    player.hp =
        player.maxHp;

    player.energy =
        player.maxEnergy;

    player.block =
        0;

    updateOwnedRelicUI();


    // ======================
    // デッキ
    // ======================

    player.drawPile = [];

    player.discardPile = [];

    player.hand = [];


    // ======================
    // マップ開始
    // ======================

    startMap();

}