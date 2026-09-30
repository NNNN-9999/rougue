// ======================
// RewardManager.js
// ======================

const REWARD_CONFIG = {
    normal: {
        goldMin: 10,
        goldMax: 20
    },

    elite: {
        goldMin: 30,
        goldMax: 45
    },

    boss: {
        goldMin: 60,
        goldMax: 90
    }
};

// エリートは高確率で通常レリックを落とす。
// 0.75 = 75%。調整したい場合はここだけ変更。
const ELITE_RELIC_DROP_RATE = 0.75;

// レリックが落ちなかった場合の追加ゴールド。
const ELITE_NO_RELIC_BONUS_GOLD = 25;

let rewardCards = [];
let rewardRelics = [];

let currentRewardType = "normal";
let currentRewardGold = 0;
let eliteDroppedRelic = null;
let eliteBonusRelic = null;
let currentRewardPotion = null;
let selectedBossRelic = null;


// ======================
// 共通
// ======================

function getRandomRewardGold(type) {

    const config =
        REWARD_CONFIG[type] ||
        REWARD_CONFIG.normal;

    const baseGold = Math.floor(
        Math.random() *
        (config.goldMax - config.goldMin + 1)
    ) + config.goldMin;

    // 黄金の仮面：戦闘ゴールド+50%
    let relicMultiplier = 1;

    if (typeof hasRelic === "function") {
        if (hasRelic("gildedMask")) {
            relicMultiplier *= 1.25;
        }

        if (hasRelic("luckyCharm")) {
            relicMultiplier *= 1.15;
        }
    }

    // スキルツリー：戦闘ゴールド増加。
    const skillMultiplier =
        1 + (player?.skillBonus?.battleGoldBonus || 0);

    return Math.ceil(
        baseGold * relicMultiplier * skillMultiplier
    );
}


function beginBattleReward(type) {

    currentRewardType = type;
    currentRewardGold = getRandomRewardGold(type);
    currentRewardPotion = null;

    if (typeof gainGold === "function") {
        currentRewardGold = gainGold(currentRewardGold);
    } else {
        player.gold += currentRewardGold;
    }

    if (typeof potions !== "undefined" && typeof addPotion === "function") {
        const chance = type === "boss" ? 1 : type === "elite" ? 0.55 : 0.30;
        if (Math.random() < chance) {
            const ids = typeof getUnlockedPotionIds === "function" ? getUnlockedPotionIds() : Object.keys(potions);
            const potionId = ids[Math.floor(Math.random() * ids.length)];
            if (addPotion(potionId)) currentRewardPotion = potionId;
        }
    }
}

function getPotionRewardHtml() {
    if (!currentRewardPotion || typeof potions === "undefined") return "";
    const potion = potions[currentRewardPotion];
    return potion ? `<div class="reward-potion">🧪 ${potion.icon} ${potion.name} を獲得</div>` : "";
}


function setSkipRewardVisible(visible) {

    const skipButton =
        document.getElementById(
            "skip-reward"
        );

    if (!skipButton) {
        return;
    }

    skipButton.classList.toggle(
        "hidden",
        !visible
    );
}


function getOwnedRelicIds() {

    return new Set(
        player.relics || []
    );
}


function getAvailableRelics() {

    const owned = getOwnedRelicIds();

    return Object.values(relics)
        .filter(relic =>
            relic.category === "normal" &&
            !owned.has(relic.id) &&
            (
                !relic.character ||
                relic.character === selectedCharacter
            ) &&
            (
                typeof isRelicUnlockedForCharacter !== "function" ||
                isRelicUnlockedForCharacter(
                    relic,
                    selectedCharacter
                )
            )
        );
}


function getAvailableBossRelics() {

    const owned = getOwnedRelicIds();

    return Object.values(relics)
        .filter(relic =>
            relic.category === "boss" &&
            !owned.has(relic.id)
        );
}


function getRarityLabel(rarity) {

    const labels = {
        common: "COMMON",
        uncommon: "UNCOMMON",
        rare: "RARE",
        epic: "EPIC",
        legendary: "LEGENDARY"
    };

    return labels[rarity] || "COMMON";
}


function getRarityRank(rarity) {

    const ranks = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 3,
        legendary: 4
    };

    return ranks[rarity] ?? 0;
}


function getRewardRarityWeights(type = "normal") {

    const tables = {
        normal: {
            common: 56,
            uncommon: 31,
            rare: 13,
            epic: 0,
            legendary: 0
        },

        elite: {
            common: 8,
            uncommon: 27,
            rare: 38,
            epic: 20,
            legendary: 7
        },

        boss: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 70,
            legendary: 30
        }
    };

    return tables[type] || tables.normal;
}


function pickWeightedRarity(weights, availableCards) {

    const availableRarities = Object.keys(weights)
        .filter(rarity =>
            weights[rarity] > 0 &&
            availableCards.some(card => card.rarity === rarity)
        );

    if (availableRarities.length === 0) {
        return null;
    }

    const totalWeight = availableRarities
        .reduce((sum, rarity) => sum + weights[rarity], 0);

    let roll = Math.random() * totalWeight;

    for (const rarity of availableRarities) {
        roll -= weights[rarity];

        if (roll <= 0) {
            return rarity;
        }
    }

    return availableRarities[availableRarities.length - 1];
}


function getRewardCardChoices(count = 3, type = "normal") {

    let pool = [
        ...getCardPoolForCharacter(selectedCharacter)
    ];

    // 通常戦ではRAREまで。
    // EPIC / LEGENDARY はエリート・ボスなど、より特別な報酬に残す。
    if (type === "normal") {
        pool = pool.filter(card =>
            getRarityRank(card.rarity) <= getRarityRank("rare")
        );
    }

    const weights = getRewardRarityWeights(type);
    const selected = [];
    const remaining = [...pool];

    while (selected.length < count && remaining.length > 0) {
        const rarity = pickWeightedRarity(weights, remaining);

        let candidates = rarity
            ? remaining.filter(card => card.rarity === rarity)
            : remaining;

        if (candidates.length === 0) {
            candidates = remaining;
        }

        const chosen = candidates[
            Math.floor(Math.random() * candidates.length)
        ];

        selected.push(chosen);

        const removeIndex = remaining.findIndex(
            card => card.id === chosen.id
        );

        if (removeIndex >= 0) {
            remaining.splice(removeIndex, 1);
        }
    }

    return selected;
}


function getHighRarityCards(count = 3) {

    // v13：ボス報酬でもスキルツリー未解放カードは出さない。
    // その代わり、各キャラに最初から使えるEPIC/LEGENDARYを追加している。
    const pool = getCardPoolForCharacter(selectedCharacter)
        .filter(card =>
            card.rarity === "epic" ||
            card.rarity === "legendary"
        );

    const weights = getRewardRarityWeights("boss");
    const selected = [];
    const remaining = [...pool];

    while (selected.length < count && remaining.length > 0) {
        const rarity = pickWeightedRarity(weights, remaining);

        let candidates = rarity
            ? remaining.filter(card => card.rarity === rarity)
            : remaining;

        if (candidates.length === 0) {
            candidates = remaining;
        }

        const chosen = candidates[
            Math.floor(Math.random() * candidates.length)
        ];

        selected.push(chosen);

        const removeIndex = remaining.findIndex(
            card => card.id === chosen.id
        );

        if (removeIndex >= 0) {
            remaining.splice(removeIndex, 1);
        }
    }

    return selected;
}


function addRelicDirectly(relicId) {

    const relic = relics[relicId];

    if (!relic) {
        return false;
    }

    if (!Array.isArray(player.relics)) {
        player.relics = [];
    }

    if (player.relics.includes(relicId)) {
        return false;
    }

    player.relics.push(relicId);

    if (
        typeof updateOwnedRelicUI === "function"
    ) {
        updateOwnedRelicUI();
    }

    if (
        typeof showRelicAcquired === "function"
    ) {
        showRelicAcquired(relicId);
    }

    return true;
}


function applyBossRelicOnAcquire(relicId) {

    const addMaxEnergy = () => {
        player.maxEnergy += 1;
        player.energy = player.maxEnergy;
    };

    switch (relicId) {

        case "abyssCore":
            addMaxEnergy();
            break;

        case "deepHeart":
            addMaxEnergy();
            player.maxHp = Math.max(1, player.maxHp - 18);
            player.hp = Math.min(player.hp, player.maxHp);
            break;

        case "endlessSpark":
            // デバフカード「過熱」は各戦闘開始時に一時追加。
            addMaxEnergy();
            break;

        case "cursedCore":
            addMaxEnergy();
            // 1つのレリック効果につき、追加する呪いは1枚だけ。
            // 呪いカード自体の総所持枚数には上限を設けない。
            if (Array.isArray(player.starterDeck)) {
                player.starterDeck.push("burningShardCurse");
            }
            break;

        case "sealedPurseCore":
            // 既に持っているゴールドは失わない。
            // 以降の新規獲得だけ gainGold() 側で止める。
            addMaxEnergy();
            break;

        case "crimsonCrown":
            // メリット・デメリットともに battle.js 側で処理。
            break;
    }

    if (typeof updateOwnedRelicUI === "function") {
        updateOwnedRelicUI();
    }

    if (typeof updatePersistentRunHud === "function") {
        updatePersistentRunHud();
    }
}



// ======================
// 通常戦：カード報酬
// ======================

function showRewardScreen(type = "normal") {

    changeScene("reward");
    setSkipRewardVisible(true);

    beginBattleReward(type);
    renderRewardCards();
}


function renderRewardCards() {

    const container =
        document.getElementById(
            "reward-cards"
        );

    if (!container) {
        console.error(
            "reward-cards が見つかりません"
        );
        return;
    }

    container.innerHTML = `
        <div class="reward-gold">
            💰 ${currentRewardGold}G を獲得
        </div>
        ${getPotionRewardHtml()}
    `;

    const skillBonus =
        player?.skillBonus || {};

    const commonRewardChoice =
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_reward_choice", "common")
            ? 1
            : 0;

    const rewardCount =
        3 +
        (skillBonus.extraRewardChoice || 0) +
        commonRewardChoice;

    rewardCards =
        getRewardCardChoices(
            rewardCount,
            currentRewardType
        );

    // v29: 共通ツリー「磨かれた戦利品」
    // 通常報酬だけ、各候補が15%で強化済みになる。
    if (
        currentRewardType === "normal" &&
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_reward_upgrade", "common")
    ) {
        const upgradeChance =
            isSkillUnlockedForCharacter("common_upgrade_cap", "common")
                ? 0.30
                : 0.15;

        rewardCards = rewardCards.map(card => {
            if (Math.random() >= upgradeChance) return card;
            const upgradedId = typeof getUpgradedCardId === "function"
                ? getUpgradedCardId(card.id)
                : null;
            return upgradedId && cards[upgradedId]
                ? cards[upgradedId]
                : card;
        });
    }

    renderCardChoices(
        container,
        rewardCards,
        addCardToDeck
    );
}


function renderCardChoices(
    container,
    cardChoices,
    clickHandler
) {

    cardChoices.forEach(card => {

        const cardElement =
            document.createElement("div");

        cardElement.className =
            `reward-card ${card.rarity || "common"}`;

        cardElement.innerHTML = `
            <div class="reward-rarity rarity-${card.rarity || "common"}">
                ${getRarityLabel(card.rarity)}
            </div>

            <h3>${card.name}</h3>

            <p>
                タイプ：${card.type}
            </p>

            <p>
                コスト：${card.cost}
            </p>

            <p>
                ${card.description}
            </p>
        `;

        cardElement.addEventListener(
            "click",
            () => {
                clickHandler(card.id);
            }
        );

        container.appendChild(
            cardElement
        );
    });
}


function addCardToDeck(cardId) {

    const card = cards[cardId];

    if (!card) {
        console.error(
            "カードが存在しません:",
            cardId
        );
        return;
    }

    player.starterDeck.push(cardId);

    finishReward(
        `${card.name} を選択しました！`
    );
}


function finishReward(message) {

    setSkipRewardVisible(false);

    const container =
        document.getElementById(
            "reward-cards"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <h2>${message}</h2>

        <p>
            💰 ${currentRewardGold}G を獲得しました
        </p>

        <button id="reward-next-button">
            🗺️ 次へ進む
        </button>
    `;

    document
        .getElementById(
            "reward-next-button"
        )
        .addEventListener(
            "click",
            goToNextMap
        );
}


// ======================
// エリート報酬
// ======================

function showEliteRewardScreen() {

    changeScene("reward");
    setSkipRewardVisible(false);

    beginBattleReward("elite");

    eliteDroppedRelic = null;
    eliteBonusRelic = null;

    const doubleRelicActive = typeof hasRelic === "function" && hasRelic("eliteDoubleDrop");

    const availableRelics =
        getAvailableRelics();

    const eliteRelicDropRate =
        Math.min(
            0.95,
            ELITE_RELIC_DROP_RATE +
            (
                typeof hasRelic === "function" &&
                hasRelic("eliteCompass")
                    ? 0.10
                    : 0
            )
        );

    const relicDrops =
        availableRelics.length > 0 &&
        Math.random() < eliteRelicDropRate;

    if (relicDrops) {

        eliteDroppedRelic =
            randomFrom(availableRelics);

        addRelicDirectly(
            eliteDroppedRelic.id
        );

        if (doubleRelicActive && Math.random() < 0.20) {
            const remaining = getAvailableRelics();
            if (remaining.length > 0) {
                eliteBonusRelic = randomFrom(remaining);
                addRelicDirectly(eliteBonusRelic.id);
            }
        }

    } else {

        // レリックなしでも報酬を豪華にする。
        const bonusGold =
            typeof gainGold === "function"
                ? gainGold(ELITE_NO_RELIC_BONUS_GOLD)
                : ELITE_NO_RELIC_BONUS_GOLD;

        if (typeof gainGold !== "function") {
            player.gold += bonusGold;
        }

        currentRewardGold += bonusGold;
    }

    renderEliteReward();
}


// 古いbattle.js等との互換用
function showRelicRewardScreen() {
    showEliteRewardScreen();
}


function renderEliteReward() {

    const container =
        document.getElementById(
            "reward-cards"
        );

    if (!container) {
        return;
    }

    const skillBonus =
        player?.skillBonus || {};

    // レリックありでも通常より1枚多い。
    // レリックなしならさらに1枚増やす。
    const cardCount =
        4 +
        (eliteDroppedRelic ? 0 : 1) +
        (skillBonus.extraRewardChoice || 0);

    rewardCards =
        getRewardCardChoices(cardCount, "elite");

    const relicMessage =
        eliteDroppedRelic
            ? `
                <div class="elite-relic-drop">
                    <h2>⭐ レリック獲得</h2>
                    <h3>🛡️ ${eliteDroppedRelic.name}</h3>
                    <p>${eliteDroppedRelic.description}</p>
                    ${eliteBonusRelic ? `<h3>✨ 追加：${eliteBonusRelic.name}</h3><p>${eliteBonusRelic.description}</p>` : ""}
                </div>
            `
            : `
                <div class="elite-no-relic">
                    <h2>✨ ボーナス報酬</h2>
                    <p>
                        レリックは落ちなかったため、
                        追加で ${ELITE_NO_RELIC_BONUS_GOLD}G と
                        カード候補+1を獲得しました。
                    </p>
                </div>
            `;

    container.innerHTML = `
        <div class="reward-gold">
            💰 ${currentRewardGold}G を獲得
        </div>
        ${getPotionRewardHtml()}

        ${relicMessage}

        <h2>カード報酬</h2>
    `;

    renderCardChoices(
        container,
        rewardCards,
        addEliteCardToDeck
    );
}


function addEliteCardToDeck(cardId) {

    const card = cards[cardId];

    if (!card) {
        return;
    }

    player.starterDeck.push(cardId);

    const relicText =
        eliteDroppedRelic
            ? ` / ${eliteDroppedRelic.name} 獲得`
            : "";

    finishReward(
        `${card.name} を選択しました！${relicText}`
    );
}


// ======================
// ボス報酬
// ======================

function showBossRewardScreen() {

    changeScene("reward");
    setSkipRewardVisible(false);

    beginBattleReward("boss");

    selectedBossRelic = null;

    renderBossRelicChoices();
}


function renderBossRelicChoices() {

    const container =
        document.getElementById(
            "reward-cards"
        );

    if (!container) {
        return;
    }

    let bossRelics =
        getAvailableBossRelics();

    // 全て所持している場合でも進行不能にはしない。
    if (bossRelics.length === 0) {
        renderBossCardChoices();
        return;
    }

    bossRelics =
        shuffle([...bossRelics])
            .slice(0, 3);

    container.innerHTML = `
        <div class="reward-gold">
            💰 ${currentRewardGold}G を獲得
        </div>
        ${getPotionRewardHtml()}

        <h2>👑 ボスレリック</h2>

        <p>
            1つ選択してください
        </p>
    `;

    bossRelics.forEach(relic => {

        const relicElement =
            document.createElement("div");

        relicElement.className =
            "reward-card boss-relic-reward";

        const grantedCard =
            relic.grantedCardId && typeof cards !== "undefined"
                ? cards[relic.grantedCardId]
                : null;

        const grantedCardHtml = grantedCard
            ? `
                <div class="boss-relic-granted-card">
                    <div class="boss-relic-granted-card-label">付与カード</div>
                    <div class="boss-relic-granted-card-head">
                        <strong>${grantedCard.name}</strong>
                        <span>${String(grantedCard.rarity || grantedCard.type || "SPECIAL").toUpperCase()}</span>
                    </div>
                    <p>${grantedCard.description}</p>
                    ${
                        relic.grantedCardContext
                            ? `<small>${relic.grantedCardContext}</small>`
                            : ""
                    }
                </div>
            `
            : "";

        relicElement.innerHTML = `
            <div class="boss-relic-crown">BOSS RELIC</div>
            <h3>${relic.icon || "👑"} ${relic.name}</h3>

            <div class="boss-relic-effect-box benefit">
                <div class="boss-relic-effect-label">▲ メリット</div>
                <div class="boss-relic-effect-text">
                    ${relic.benefit || relic.description}
                </div>
            </div>

            <div class="boss-relic-effect-box drawback">
                <div class="boss-relic-effect-label">▼ デメリット</div>
                <div class="boss-relic-effect-text">
                    ${relic.drawback || "デメリットなし"}
                </div>
            </div>

            ${grantedCardHtml}
        `;

        relicElement.addEventListener(
            "click",
            () => {
                selectBossRelic(relic.id);
            }
        );

        container.appendChild(
            relicElement
        );
    });
}


function selectBossRelic(relicId) {

    const relic = relics[relicId];

    if (!relic) {
        return;
    }

    if (
        !addRelicDirectly(relicId)
    ) {
        return;
    }

    selectedBossRelic = relic;

    applyBossRelicOnAcquire(
        relicId
    );

    renderBossCardChoices();
}


function renderBossCardChoices() {

    const container =
        document.getElementById(
            "reward-cards"
        );

    if (!container) {
        return;
    }

    const skillBonus =
        player?.skillBonus || {};

    const cardCount =
        3 +
        (skillBonus.extraRewardChoice || 0);

    rewardCards =
        getHighRarityCards(cardCount);

    const relicText =
        selectedBossRelic
            ? `
                <div class="boss-relic-selected">
                    <h3>
                        👑 ${selectedBossRelic.name} を獲得
                    </h3>
                </div>
            `
            : "";

    container.innerHTML = `
        <div class="reward-gold">
            💰 ${currentRewardGold}G を獲得
        </div>
        ${getPotionRewardHtml()}

        ${relicText}

        <h2>✨ 高レアリティカード報酬</h2>

        <p>
            カードを1枚選択してください
        </p>
    `;

    renderCardChoices(
        container,
        rewardCards,
        addBossCardToDeck
    );
}


function addBossCardToDeck(cardId) {

    const card = cards[cardId];

    if (!card) {
        return;
    }

    player.starterDeck.push(cardId);

    finishBossReward(
        `${card.name} を獲得しました！`
    );
}


function finishBossReward(message) {

    const container =
        document.getElementById(
            "reward-cards"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <h2>${message}</h2>

        <p>
            BOSS報酬を獲得しました
        </p>

        <button id="boss-reward-next-button">
            ⬇️ 次の階層に進む
        </button>
    `;

    document
        .getElementById(
            "boss-reward-next-button"
        )
        .addEventListener(
            "click",
            goToNextMap
        );
}


// ======================
// 宝箱
// ======================

function showTreasureReward() {

    changeScene("reward");
    setSkipRewardVisible(false);

    const container =
        document.getElementById(
            "reward-cards"
        );

    const relicList =
        getAvailableRelics();

    if (relicList.length === 0) {

        container.innerHTML = `
            <h2>🎁 宝箱</h2>

            <p>
                獲得できる新しい通常レリックはありません。
            </p>

            <button id="treasure-next-button">
                🗺️ 次へ進む
            </button>
        `;

        document
            .getElementById(
                "treasure-next-button"
            )
            .addEventListener(
                "click",
                goToNextMap
            );

        return;
    }

    container.innerHTML = `
        <h2>🎁 宝箱を発見！</h2>

        <p>
            レリックを1つ選択してください
        </p>
    `;

    // v47: 宝箱もスキルツリー未解放レリックを除外する。
    const treasureRelics =
        shuffle(
            typeof getAvailableRelics === "function"
                ? [...getAvailableRelics()]
                : [...relicList]
        )
            .slice(0, 3);

    treasureRelics.forEach(relic => {

        const relicElement =
            document.createElement("div");

        relicElement.className =
            "reward-card relic-reward";

        relicElement.innerHTML = `
            <h3>${relic.icon || "💎"} ${relic.name}</h3>
            <p>${relic.description}</p>
        `;

        relicElement.addEventListener(
            "click",
            () => {
                obtainRelic(relic.id);
            }
        );

        container.appendChild(
            relicElement
        );
    });
}


function obtainRelic(relicId) {

    const relic = relics[relicId];

    if (!relic) {
        return;
    }

    if (!addRelicDirectly(relicId)) {
        return;
    }

    finishTreasureReward(
        `${relic.icon || "💎"} ${relic.name} を獲得しました！`
    );
}


function finishTreasureReward(message) {

    const container =
        document.getElementById(
            "reward-cards"
        );

    container.innerHTML = `
        <h2>${message}</h2>

        <button id="treasure-next-button">
            🗺️ 次へ進む
        </button>
    `;

    document
        .getElementById(
            "treasure-next-button"
        )
        .addEventListener(
            "click",
            goToNextMap
        );
}


// ======================
// 次へ
// ======================

function goToNextMap() {

    if (
        typeof advanceFromCurrentNode !==
        "function"
    ) {

        console.error(
            "advanceFromCurrentNode() が見つかりません"
        );

        return;
    }

    advanceFromCurrentNode();
}


// ======================
// スキップ
// ======================

const skipRewardButton =
    document.getElementById(
        "skip-reward"
    );

if (skipRewardButton) {

    skipRewardButton.addEventListener(
        "click",
        () => {

            // ボス・エリートはスキップ不可。
            if (
                currentRewardType === "boss" ||
                currentRewardType === "elite"
            ) {
                return;
            }

            finishReward(
                "カード報酬をスキップしました"
            );
        }
    );
}
