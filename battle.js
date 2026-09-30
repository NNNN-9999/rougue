console.log("★★★ battle.js 読み込み成功");

let battleEnded = false;
let enemy = null;
let battleEnemies = [];
let selectedEnemyIndex = 0;
let currentBattleType = "normal";

function getLivingBattleEnemies() {
    return (battleEnemies || []).filter(unit => unit && unit.hp > 0);
}

function syncSelectedEnemy() {
    if (!battleEnemies.length) {
        enemy = null;
        selectedEnemyIndex = 0;
        return null;
    }

    if (!battleEnemies[selectedEnemyIndex] || battleEnemies[selectedEnemyIndex].hp <= 0) {
        const nextIndex = battleEnemies.findIndex(unit => unit && unit.hp > 0);
        selectedEnemyIndex = nextIndex >= 0 ? nextIndex : 0;
    }

    enemy = battleEnemies[selectedEnemyIndex] || null;
    return enemy;
}

function selectEnemyTarget(index) {
    if (battleEnded || !battleEnemies[index] || battleEnemies[index].hp <= 0) return;
    selectedEnemyIndex = index;
    enemy = battleEnemies[index];
    if (typeof updateEnemyUI === "function") updateEnemyUI();
    if (typeof renderHand === "function") renderHand();
}


// ======================
// レリック所持判定
// ======================

function hasRelic(relicId) {

    return Array.isArray(player?.relics) &&
        player.relics.includes(relicId);
}


// ======================
// 戦士：闘志
// ======================

function getMaxRage() {
    return Infinity;
}

function gainRage(amount) {

    if (selectedCharacter !== "warrior") {
        return;
    }

    player.rage = Math.max(
        0,
        (player.rage || 0) + amount
    );
}

function spendRage(amount) {

    if (selectedCharacter !== "warrior") {
        return false;
    }

    if ((player.rage || 0) < amount) {
        return false;
    }

    player.rage -= amount;

    // 闘志の留め金：闘志を消費したとき4ブロック。
    if (hasRelic("rageClasp")) {
        player.block += 4;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger("rageClasp", "+4ブロック");
        }
    }

    return true;
}


// ======================
// 魔法使い：属性連鎖
// 火→雷：+6ダメージ
// 雷→氷：+8ブロック
// 氷→火：+1ドロー
// ======================

function getElementalChainEffect(card) {

    const effect = {
        triggered: false,
        damage: 0,
        block: 0,
        draw: 0,
        label: ""
    };

    if (
        selectedCharacter !== "wizard" ||
        !card?.element ||
        !player.lastElement
    ) {
        return effect;
    }

    const previous = player.lastElement;
    const current = card.element;

    if (previous === "fire" && current === "lightning") {
        effect.triggered = true;
        effect.damage =
            6 + (player?.skillBonus?.chainDamageBonus || 0);

        effect.label =
            `🔥→⚡ +${effect.damage}ダメージ`;
    }

    if (previous === "lightning" && current === "ice") {
        effect.triggered = true;
        effect.block =
            8 + (player?.skillBonus?.chainBlockBonus || 0);

        effect.label =
            `⚡→❄️ +${effect.block}ブロック`;
    }

    if (previous === "ice" && current === "fire") {
        effect.triggered = true;
        effect.draw = 1;
        effect.label = "❄️→🔥 +1ドロー";
    }

    return effect;
}


// ======================
// 墓守：捨て札操作
// ======================

function returnCardsFromDiscard(amount) {

    if (selectedCharacter !== "gravekeeper") {
        return 0;
    }

    let returned = 0;

    for (let i = 0; i < amount; i++) {

        if (player.discardPile.length === 0) {
            break;
        }

        const index = Math.floor(
            Math.random() * player.discardPile.length
        );

        const [cardId] = player.discardPile.splice(index, 1);
        player.hand.push(cardId);
        returned += 1;

        // 煤けた灯籠：各戦闘で最初の回収時だけエナジー+1
        if (
            hasRelic("sootLantern") &&
            !player.graveLanternUsed
        ) {
            player.energy += 1;
            player.graveLanternUsed = true;

            if (typeof showRelicTrigger === "function") {
                showRelicTrigger("sootLantern", "エナジー+1");
            }
        }

        // 骨の数珠：回収するたび3ブロック
        if (hasRelic("boneRosary")) {
            player.block += 3;

            if (typeof showRelicTrigger === "function") {
                showRelicTrigger("boneRosary", "+3ブロック");
            }
        }

        const recoveryBlock =
            player?.skillBonus?.recoveredCardBlock || 0;

        if (recoveryBlock > 0) {
            player.block += recoveryBlock;
        }

        player.recoveredCardsThisTurn =
            (player.recoveredCardsThisTurn || 0) + 1;

        if (
            player.recoveredCardsThisTurn === 1 &&
            hasRelic("ferrymanCoin")
        ) {
            if (typeof showRelicTrigger === "function") {
                showRelicTrigger(
                    "ferrymanCoin",
                    "+1ドロー"
                );
            }

            drawCards(1);
        }

        if (
            player.recoveredCardsThisTurn === 1 &&
            (player?.skillBonus?.firstRecoveryEnergy || 0) > 0
        ) {
            player.energy +=
                player.skillBonus.firstRecoveryEnergy;
        }

        if (
            player.recoveredCardsThisTurn === 2 &&
            (player?.skillBonus?.secondRecoveryDraw || 0) > 0
        ) {
            drawCards(
                player.skillBonus.secondRecoveryDraw
            );
        }
    }

    return returned;
}

function discardRandomCardsFromHand(amount) {

    let discarded = 0;

    for (let i = 0; i < amount; i++) {

        if (player.hand.length === 0) {
            break;
        }

        const index = Math.floor(
            Math.random() * player.hand.length
        );

        const [cardId] = player.hand.splice(index, 1);
        player.discardPile.push(cardId);
        discarded += 1;
    }

    return discarded;
}

function consumeDiscardCards(amount) {

    let consumed = 0;

    while (
        consumed < amount &&
        player.discardPile.length > 0
    ) {
        const index = Math.floor(
            Math.random() * player.discardPile.length
        );

        const [consumedCardId] = player.discardPile.splice(index, 1);
        if (!Array.isArray(player.exhaustPile)) player.exhaustPile = [];
        if (consumedCardId) player.exhaustPile.push(consumedCardId);
        consumed += 1;
    }

    return consumed;
}


// ======================
// ボス：HP条件の特殊フェーズ
// ======================

function checkEnemySpecialPhase() {

    if (
        !enemy ||
        enemy.hp <= 0 ||
        !enemy.special ||
        enemy.specialTriggered
    ) {
        return false;
    }

    const special = enemy.special;
    const threshold = special.threshold ?? 0.5;

    if (enemy.hp > enemy.maxHp * threshold) {
        return false;
    }

    enemy.specialTriggered = true;
    enemy.phaseLabel = special.label || "特殊形態";
    enemy.specialNotice = special.message || "敵が形態変化した！";

    if (special.nameAfter) {
        enemy.name = special.nameAfter;
    }

    if (special.block) {
        enemy.block += special.block;
    }

    if (special.heal) {
        enemy.hp = Math.min(
            enemy.maxHp,
            enemy.hp + special.heal
        );
    }

    if (special.attackBonus) {
        enemy.moves = enemy.moves.map(move => ({
            ...move,
            value:
                move.type === "attack"
                    ? move.value + special.attackBonus
                    : move.value
        }));
    }

    if (special.moves?.length) {
        enemy.moves = structuredClone(special.moves);
        enemy.moveIndex = 0;
    }

    if (special.energyPenalty) {
        player.nextTurnEnergyPenalty += special.energyPenalty;
    }

    if (special.stealEnergy) {
        player.energy = Math.max(
            0,
            player.energy - special.stealEnergy
        );
    }

    enemy.nextMove = enemy.moves[enemy.moveIndex] || enemy.moves[0];

    updatePlayerUI();
    updateEnemyUI();

    return true;
}




// ======================
// v16 敵の小さな固有能力
// ======================

function triggerEnemyPassiveAfterHit() {

    if (
        !enemy ||
        enemy.hp <= 0 ||
        !enemy.passive
    ) {
        return;
    }

    const passive = enemy.passive;

    if (passive.type === "oozeArmor") {

        if (Math.random() < (passive.chance || 0)) {
            enemy.block += passive.block || 0;

            if (typeof showFloatingCombatText === "function") {
                showFloatingCombatText(
                    "enemy",
                    `+${passive.block || 0} BLOCK`,
                    "block"
                );
            }

            if (typeof triggerBattleTargetEffect === "function") {
                triggerBattleTargetEffect("enemy", "block");
            }
        }

        return;
    }

    if (enemy.passiveTriggered) {
        return;
    }

    const threshold =
        passive.threshold ?? 0.5;

    if (
        enemy.hp >
        enemy.maxHp * threshold
    ) {
        return;
    }

    enemy.passiveTriggered = true;

    if (passive.block) {
        enemy.block += passive.block;

        if (typeof showFloatingCombatText === "function") {
            showFloatingCombatText(
                "enemy",
                `+${passive.block} BLOCK`,
                "block"
            );
        }
    }

    if (passive.attackBonus) {
        enemy.moves = enemy.moves.map(move => ({
            ...move,
            value:
                move.type === "attack"
                    ? move.value + passive.attackBonus
                    : move.value
        }));
    }

    if (passive.attackPenalty) {
        enemy.moves = enemy.moves.map(move => ({
            ...move,
            value:
                move.type === "attack"
                    ? Math.max(1, move.value - passive.attackPenalty)
                    : move.value
        }));
    }

    enemy.nextMove =
        enemy.moves[enemy.moveIndex] ||
        enemy.moves[0];

    enemy.specialNotice =
        `${passive.label} 発動！`;
}

// ======================
// 戦闘開始
// ======================

function startBattle(type = "normal") {

    console.log("★★★ startBattle:", type);

    if (!player) {
        console.error("player が初期化されていません");
        return;
    }

    battleEnded = false;
    currentBattleType = type;

    createEnemy(type);

    if (!enemy) {
        return;
    }

    player.energy = player.maxEnergy;
    player.block = 0;
    player.statuses = {};
    player.confusionCosts = {};
    player.chainCount = 0;
    player.reflectDamageThisTurn = 0;
    player.magicDiscountUsed = false;
    player.highCostDiscountUsed = false;
    player.forbiddenTomeUsedThisTurn = false;
    player.nextTurnEnergyBonus = 0;
    player.nextTurnEnergyPenalty = 0;

    applyStartTurnStatuses(player);

    // キャラクター固有の戦闘状態
    player.rage = 0;
    player.lastElement = null;
    player.lastElementalChain = "";
    player.elementalPrismUsed = false;
    player.arcaneCompassUsedThisTurn = false;

    // 墓守：戦闘ごとの回収レリック状態
    player.graveLanternUsed = false;

    // v16：ターン/戦闘中レリック状態
    player.cardsPlayedThisTurn = 0;
    player.zeroCostDrawUsedThisTurn = false;
    player.firstAttackGuardUsed = false;
    player.glassBeadTriggered = false;
    player.lastCardType = null;

    // v19 スキルツリー戦闘状態
    player.firstChainSkillEnergyUsed = false;
    player.sameElementDrawUsedThisTurn = false;
    player.sameElementStreak = 0;
    player.highMagicDiscountUsedThisTurn = false;
    player.highMagicDrawUsedThisTurn = false;
    player.firstEnergyGainBonusUsedThisTurn = false;
    player.firstHeavyAttackUsed = false;
    player.recoveredCardsThisTurn = 0;

    player.hand = [];
    player.discardPile = [];
    player.exhaustPile = [];
    player.drawPile = shuffle([
        ...player.starterDeck
    ]);

    // 葬送の鐘：戦闘開始時、山札から2枚を捨て札へ。
    if (hasRelic("funeralBell")) {
        for (let i = 0; i < 2 && player.drawPile.length > 0; i++) {
            const index = Math.floor(Math.random() * player.drawPile.length);
            const [cardId] = player.drawPile.splice(index, 1);
            player.discardPile.push(cardId);
        }
    }

    // 墓土の小瓶：最初から捨て札を2枚用意する。
    if (hasRelic("graveDust")) {
        player.discardPile.push("strike", "strike");
    }

    const skillStartDiscard =
        player?.skillBonus?.startDiscard || 0;

    for (
        let i = 0;
        i < skillStartDiscard &&
        player.drawPile.length > 0;
        i++
    ) {
        const index =
            Math.floor(
                Math.random() *
                player.drawPile.length
            );

        const [cardId] =
            player.drawPile.splice(index, 1);

        player.discardPile.push(cardId);
    }

    let drawAmount = 5;

    // 勇者の紋章：初期ドロー +1、闘志 +1
    if (hasRelic("hero")) {
        drawAmount += 1;
        gainRage(1);
    }

    // 戦太鼓：闘志 +1
    if (hasRelic("warDrum")) {
        gainRage(1);
    }

    if (hasRelic("rageReservoir")) {
        gainRage(1);
    }

    // 狩人の羽根：戦闘開始時エナジー +1
    if (hasRelic("hunterFeather")) {
        player.energy += 1;
    }

    // 通常レリック
    if (hasRelic("stoneCharm")) {
        player.block += 5;
    }

    if (hasRelic("scoutLens")) {
        drawAmount += 1;
    }

    if (hasRelic("healingSeed")) {
        healPlayer(3);
    }

    // v33 状態系レリック
    if (hasRelic("warSigil")) addStatus(player, "strength", 2, { ignoreResistance:true });
    if (hasRelic("fortressHeart")) addStatus(player, "fortress", 4, { ignoreResistance:true });
    if (hasRelic("wardCharm")) addStatus(player, "resistance", 1, { ignoreResistance:true });
    if (hasRelic("livingMoss")) addStatus(player, "regeneration", 3, { ignoreResistance:true });

    applyStartTurnStatuses(player);
    battleEnemies.forEach(unit => applyStartTurnStatuses(unit));

    // v31 通常レリック
    if (hasRelic("echoCrystal")) {
        drawAmount += 1;
    }

    if (hasRelic("cursedHourglass")) {
        drawAmount += 1;
    }

    if (hasRelic("guardianShell")) {
        player.block += 8;
    }

    // スキルツリー効果
    const skillBonus = player.skillBonus || {};

    player.energy += skillBonus.startEnergy || 0;
    player.block += skillBonus.startBlock || 0;
    drawAmount += skillBonus.extraDraw || 0;

    updatePlayerUI();
    updateEnemyUI();
    drawCards(drawAmount);

    // 尽きない火花：毎戦闘の最初の手札に一時デバフを1枚だけ追加。
    if (hasRelic("endlessSpark")) {
        player.hand.push("overheatStatus");
        renderHand();
    }

    if (typeof saveRunState === "function") {
        saveRunState();
    }
}


// ======================
// 敵生成
// ======================

function createEnemy(type = "normal") {

    console.log("★★★ createEnemy:", type);

    let enemyList = Object.values(enemies)
        .filter(enemyData => enemyData.type === type);

    // ボスは地下階層ごとに専用ボスを優先する。
    if (type === "boss") {
        const depth =
            typeof currentDepth === "number"
                ? currentDepth
                : 1;

        const exactBosses = enemyList
            .filter(enemyData => enemyData.bossDepth === depth);

        if (exactBosses.length > 0) {
            enemyList = exactBosses;
        } else {
            // B5以降など専用ボスがまだ無い階層では、
            // これまで登場したボスからランダムで選ぶ。
            const unlockedBosses = enemyList
                .filter(enemyData =>
                    !enemyData.bossDepth ||
                    enemyData.bossDepth <= depth
                );

            if (unlockedBosses.length > 0) {
                enemyList = unlockedBosses;
            }
        }
    }

    if (enemyList.length === 0) {

        console.error(
            "指定された種類の敵が存在しません:",
            type
        );

        enemy = null;
        return;
    }

    const baseEnemy = enemyList[
        Math.floor(
            Math.random() * enemyList.length
        )
    ];

    enemy = structuredClone(baseEnemy);

    // B2以降は同じ敵でも少しずつ強くなる。
    const depth =
        typeof currentDepth === "number"
            ? currentDepth
            : 1;

    const hpMultiplier =
        1 + (depth - 1) * 0.15;

    const moveMultiplier =
        1 + (depth - 1) * 0.10;

    enemy.maxHp = Math.round(
        enemy.maxHp * hpMultiplier
    );

    enemy.moves = enemy.moves.map(move => ({
        ...move,
        value: Math.max(
            1,
            Math.round(move.value * moveMultiplier)
        )
    }));

    if (enemy.special?.moves) {
        enemy.special.moves = enemy.special.moves.map(move => ({
            ...move,
            value: Math.max(
                1,
                Math.round(move.value * moveMultiplier)
            )
        }));
    }

    if (enemy.special?.block) {
        enemy.special.block = Math.round(
            enemy.special.block * moveMultiplier
        );
    }

    if (enemy.special?.heal) {
        enemy.special.heal = Math.round(
            enemy.special.heal * hpMultiplier
        );
    }

    enemy.hp = enemy.maxHp;
    enemy.block = 0;
    enemy.moveIndex = 0;
    enemy.specialTriggered = false;
    enemy.passiveTriggered = false;
    enemy.phaseLabel = "";
    enemy.specialNotice = "";
    enemy.statuses = { ...(enemy.initialStatuses || {}) };
    enemy.nextMove = enemy.moves[0];
    battleEnemies = [enemy];
    selectedEnemyIndex = 0;
}

// 将来の複数敵編成用。敵データの配列を渡せば同じ戦闘UIで扱える。
function setBattleEnemyGroup(enemyUnits) {
    battleEnemies = (enemyUnits || []).filter(Boolean);
    selectedEnemyIndex = 0;
    syncSelectedEnemy();
    if (typeof updateEnemyUI === "function") updateEnemyUI();
    if (typeof renderHand === "function") renderHand();
}


// ======================
// シャッフル
// ======================

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}


// ======================
// ドロー
// ======================

function drawCards(amount) {

    for (let i = 0; i < amount; i++) {

        if (player.drawPile.length === 0) {

            player.drawPile = shuffle([
                ...player.discardPile
            ]);

            player.discardPile = [];
        }

        if (player.drawPile.length === 0) {
            break;
        }

        const cardId = player.drawPile.pop();
        player.hand.push(cardId);
    }

    renderHand();

    if (amount > 0 && typeof playSe === "function") {
        playSe("draw", 0.24);
    }
}


// ======================
// ダメージ
// ======================

function dealDamage(target, damage) {

    if (!target || damage <= 0) {
        return;
    }

    const blocked = Math.min(
        target.block || 0,
        damage
    );

    target.block =
        Math.max(0, (target.block || 0) - blocked);

    const hpDamage = damage - blocked;
    const beforeHp = target.hp;

    if (hpDamage > 0) {

        target.hp = Math.max(
            0,
            target.hp - hpDamage
        );
    }

    const actualHpDamage =
        Math.max(0, beforeHp - target.hp);

    const targetName =
        target === enemy
            ? "enemy"
            : "player";

    if (typeof playSe === "function") {
        // v34.13: HP減少時の追加SEは鳴らさない。
        // 攻撃カード側の斬撃SEなどと二重に聞こえるのを防ぐ。
        if (actualHpDamage <= 0 && blocked > 0) {
            playSe("block", 0.78);
        }
    }

    if (blocked > 0 && typeof showFloatingCombatText === "function") {
        showFloatingCombatText(
            targetName,
            `🛡 ${blocked}`,
            "block"
        );
    }

    if (actualHpDamage > 0) {

        if (typeof showFloatingCombatText === "function") {
            showFloatingCombatText(
                targetName,
                `-${actualHpDamage}`,
                "damage"
            );
        }

        if (typeof triggerBattleTargetEffect === "function") {
            triggerBattleTargetEffect(targetName, "hit");
        }
    } else if (
        blocked > 0 &&
        typeof triggerBattleTargetEffect === "function"
    ) {
        triggerBattleTargetEffect(targetName, "block");
    }

    // v33 鉄壁：HPまで攻撃が通ったヒット1回につき1減少。
    if (actualHpDamage > 0 && getStatus(target, "fortress") > 0) {
        setStatus(target, "fortress", getStatus(target, "fortress") - 1);
    }

    // 不死鳥の羽根：1ランに1回だけ50%で復活。
    if (target === player && player.hp <= 0 && hasRelic("phoenixPlume") && !player.phoenixPlumeUsed) {
        player.phoenixPlumeUsed = true;
        player.hp = Math.max(1, Math.floor(player.maxHp * 0.5));
        if (typeof showRelicTrigger === "function") showRelicTrigger("phoenixPlume", `HP ${player.hp}で復活`);
    }

    // 棘鉄の欠片：敵からHPダメージを受けたら反射。
    if (
        target === player &&
        actualHpDamage > 0 &&
        hasRelic("thornMail") &&
        enemy &&
        enemy.hp > 0
    ) {
        const reflected = Math.min(2, enemy.hp);
        enemy.hp = Math.max(0, enemy.hp - reflected);

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger("thornMail", `反射 ${reflected}ダメージ`);
        }

        if (typeof showFloatingCombatText === "function") {
            showFloatingCombatText(
                "enemy",
                `-${reflected}`,
                "relic"
            );
        }
    }

    // ひび割れた玻璃玉：初めて50%以下になった瞬間に2ドロー。
    if (
        target === player &&
        !player.glassBeadTriggered &&
        hasRelic("glassBead") &&
        player.hp > 0 &&
        beforeHp > player.maxHp * 0.5 &&
        player.hp <= player.maxHp * 0.5
    ) {
        player.glassBeadTriggered = true;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger("glassBead", "カードを2枚引く");
        }

        drawCards(2);
    }
}


// ======================
// カードコスト
// ======================

function getCardCost(card) {

    if (!card) {
        return Infinity;
    }

    let cost = card.cost;

    // v31 禁忌の書：各ターン最初のスキルだけ-1コスト。
    if (
        hasRelic("forbiddenTome") &&
        card.type === "skill" &&
        card.cost > 0 &&
        !player.forbiddenTomeUsedThisTurn
    ) {
        cost = Math.max(0, cost - 1);
    }

    // 壊れかけの蓄電器
    if (
        hasRelic("crackedCapacitor") &&
        card.cost >= 2 &&
        !player.highCostDiscountUsed
    ) {
        cost = Math.max(0, cost - 1);
    }

    // 魔導書
    if (
        hasRelic("magicBook") &&
        card.magic &&
        !player.magicDiscountUsed
    ) {
        cost = Math.max(0, cost - 1);
    }

    // 三拍子の指輪：各ターン3枚目のカードを-1コスト。
    if (
        hasRelic("echoRing") &&
        (player.cardsPlayedThisTurn || 0) === 2
    ) {
        cost = Math.max(0, cost - 1);
    }

    // v19 戦士：5枚目のカードを軽減。
    if (
        selectedCharacter === "warrior" &&
        (player.cardsPlayedThisTurn || 0) === 4 &&
        (player?.skillBonus?.fifthCardDiscount || 0) > 0
    ) {
        cost = Math.max(
            0,
            cost -
            player.skillBonus.fifthCardDiscount
        );
    }

    // v19 魔法使い：各ターン最初の高コスト魔法を軽減。
    if (
        selectedCharacter === "wizard" &&
        card.magic &&
        card.cost >= 2 &&
        !player.highMagicDiscountUsedThisTurn &&
        (player?.skillBonus?.firstHighMagicDiscount || 0) > 0
    ) {
        cost = Math.max(
            0,
            cost -
            player.skillBonus.firstHighMagicDiscount
        );
    }

    if (getStatus(player, "confusion") > 0) {
        if (!player.confusionCosts) player.confusionCosts = {};
        if (typeof player.confusionCosts[card.id] !== "number") {
            player.confusionCosts[card.id] = Math.floor(Math.random() * 5);
        }
        cost = player.confusionCosts[card.id];
    }

    return cost;
}


// ======================
// カード使用
// ======================

function playCard(index) {

    if (battleEnded || !enemy) {
        return;
    }

    const cardId = player.hand[index];
    const card = cards[cardId];

    if (!card) {
        console.error("カードが存在しません:", cardId);
        return;
    }

    if (card.unplayable) {
        return;
    }

    const cost = getCardCost(card);

    if (player.energy < cost) {
        return;
    }

    if (typeof playSe === "function") {
        if (card.id === "strike") {
            playSe("slash", 0.96);
        } else if (card.id === "defend") {
            playSe("guardReady", 0.92);
        } else if (card.type !== "attack") {
            playSe("cardPlay", 0.58);
        }
    }

    const blockBeforeCard =
        player.block || 0;

    const previousElement =
        player.lastElement;

    const sameElementBeforePlay =
        Boolean(
            selectedCharacter === "wizard" &&
            card.element &&
            previousElement === card.element
        );

    if (typeof triggerCardCastEffect === "function") {
        triggerCardCastEffect(card);
    }

    if (
        hasRelic("crackedCapacitor") &&
        card.cost >= 2 &&
        !player.highCostDiscountUsed
    ) {
        player.highCostDiscountUsed = true;
    }

    if (
        hasRelic("magicBook") &&
        card.magic &&
        !player.magicDiscountUsed
    ) {
        player.magicDiscountUsed = true;
    }

    if (
        selectedCharacter === "wizard" &&
        card.magic &&
        card.cost >= 2 &&
        !player.highMagicDiscountUsedThisTurn &&
        (player?.skillBonus?.firstHighMagicDiscount || 0) > 0
    ) {
        player.highMagicDiscountUsedThisTurn = true;
    }

    const tomeDiscountApplied =
        hasRelic("forbiddenTome") &&
        card.type === "skill" &&
        card.cost > 0 &&
        !player.forbiddenTomeUsedThisTurn;

    player.energy -= cost;

    if (tomeDiscountApplied) {
        player.forbiddenTomeUsedThisTurn = true;
    }

    if (
        hasRelic("echoRing") &&
        (player.cardsPlayedThisTurn || 0) === 2 &&
        card.cost > cost &&
        typeof showRelicTrigger === "function"
    ) {
        showRelicTrigger("echoRing", "3枚目のカード -1コスト");
    }

    // 戦士：闘志条件を満たす場合だけ消費して強化。
    let rageTriggered = false;

    if (
        selectedCharacter === "warrior" &&
        card.rageCost &&
        (player.rage || 0) >= card.rageCost
    ) {
        rageTriggered = spendRage(card.rageCost);
    }

    // 魔法使い：属性連鎖をカード解決前に確定。
    const elementalChain =
        getElementalChainEffect(card);

    let extraDamage = 0;
    let extraBlock = 0;
    let extraDraw = 0;

    const skillBonus =
        player?.skillBonus || {};

    // ===== v22 アンロックレリック =====

    if (
        card.type === "attack" &&
        hasRelic("duelistRibbon") &&
        (player.attacksPlayedThisTurn || 0) === 0
    ) {
        extraDamage += 3;
    }

    if (
        card.type === "attack" &&
        hasRelic("guardedPommel") &&
        (player.attacksPlayedThisTurn || 0) === 0
    ) {
        player.block += 4;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger(
                "guardedPommel",
                "+4ブロック"
            );
        }
    }

    if (
        card.type === "attack" &&
        card.element === "fire" &&
        hasRelic("emberLens")
    ) {
        extraDamage += 3;
    }

    if (
        card.type === "skill" &&
        card.element === "ice" &&
        hasRelic("frostBead")
    ) {
        extraBlock += 4;
    }

    if (
        card.type === "attack" &&
        card.cost >= 2 &&
        hasRelic("heavySpring")
    ) {
        extraDamage += 4;
    }

    if (
        card.type === "attack" &&
        selectedCharacter === "gravekeeper" &&
        (player.discardPile?.length || 0) >= 6 &&
        hasRelic("graveMarker")
    ) {
        extraDamage += 4;
    }

    // ===== v19 戦士 =====
    if (
        selectedCharacter === "warrior" &&
        card.type === "attack"
    ) {
        if (
            player.hp <= player.maxHp * 0.5
        ) {
            extraDamage +=
                skillBonus.lowHpAttackBonus || 0;
        }

        if (
            (player.cardsPlayedThisTurn || 0) === 2
        ) {
            extraDamage +=
                skillBonus.thirdCardAttackBonus || 0;
        }

        if (
            (player.cardsPlayedThisTurn || 0) >= 4
        ) {
            extraDamage +=
                skillBonus.lateComboAttackBonus || 0;
        }

        player.block +=
            skillBonus.attackCardBlock || 0;
    }

    // ===== v19 魔法使い =====
    if (
        selectedCharacter === "wizard" &&
        card.element &&
        sameElementBeforePlay
    ) {
        extraBlock +=
            skillBonus.sameElementBlock || 0;

        if (card.type === "attack") {
            extraDamage +=
                skillBonus.sameElementAttackBonus || 0;
        }

        if (
            !player.sameElementDrawUsedThisTurn &&
            (skillBonus.sameElementFirstDraw || 0) > 0
        ) {
            extraDraw +=
                skillBonus.sameElementFirstDraw;

            player.sameElementDrawUsedThisTurn = true;
        }
    }

    if (
        selectedCharacter === "wizard" &&
        card.magic &&
        card.cost >= 2 &&
        card.type === "attack"
    ) {
        extraDamage +=
            skillBonus.highCostMagicAttackBonus || 0;
    }

    // ===== v19 機工士 =====
    if (
        selectedCharacter === "machinist" &&
        card.type === "attack" &&
        card.cost >= 2
    ) {
        extraDamage +=
            skillBonus.highCostAttackBonus || 0;

        if (card.cost >= 3) {
            extraDamage +=
                skillBonus.veryHighCostAttackBonus || 0;

            if (
                !player.firstHeavyAttackUsed
            ) {
                extraDamage +=
                    skillBonus.firstHeavyAttackBonus || 0;

                player.firstHeavyAttackUsed = true;
            }

            player.block +=
                skillBonus.heavyAttackBlock || 0;
        }
    }

    // 連撃の護符：スキル→攻撃で追加ダメージ。
    if (
        card.type === "attack" &&
        hasRelic("comboCharm") &&
        player.lastCardType === "skill"
    ) {
        extraDamage += 4;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger("comboCharm", "+4ダメージ");
        }
    }

    // 血珀：HP50%以下で攻撃強化。
    if (
        card.type === "attack" &&
        hasRelic("bloodAmber") &&
        player.hp <= player.maxHp * 0.5
    ) {
        extraDamage += 3;
    }

    // 双生の魔印：同じ属性を連続使用で防御。
    if (
        selectedCharacter === "wizard" &&
        card.element &&
        player.lastElement === card.element &&
        hasRelic("twinSigil")
    ) {
        extraBlock += 4;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger("twinSigil", "+4ブロック");
        }
    }

    // 墓守：現在の捨て札枚数を攻撃・防御へ変換する。
    const discardCount = player.discardPile.length;
    const discardScale = Math.min(
        discardCount,
        card.discardScalingCap ?? discardCount
    );

    if (card.damagePerDiscard) {
        extraDamage +=
            discardScale *
            (
                card.damagePerDiscard +
                (
                    selectedCharacter === "gravekeeper"
                        ? (skillBonus.discardScalingBonus || 0)
                        : 0
                )
            );
    }

    if (card.blockPerDiscard) {
        extraBlock +=
            discardScale *
            (
                card.blockPerDiscard +
                (
                    selectedCharacter === "gravekeeper"
                        ? (skillBonus.discardScalingBonus || 0)
                        : 0
                )
            );
    }

    if (
        selectedCharacter === "gravekeeper" &&
        card.type === "attack" &&
        discardCount >= 8
    ) {
        extraDamage +=
            skillBonus.discardThresholdAttackBonus || 0;
    }

    if (
        selectedCharacter === "gravekeeper" &&
        card.type === "attack" &&
        discardCount >= 10
    ) {
        extraDamage +=
            skillBonus.deepDiscardAttackBonus || 0;
    }

    if (
        selectedCharacter === "gravekeeper" &&
        card.type === "skill" &&
        discardCount >= 6
    ) {
        extraBlock +=
            skillBonus.discardThresholdSkillBlock || 0;
    }

    // v33 各キャラの固有リソース・フィニッシャー
    if (card.rageScaling) {
        extraDamage += Math.min((player.rage || 0) * card.rageScaling, card.rageScalingCap || Infinity);
    }
    if (card.chainScaling) {
        extraDamage += Math.min((player.chainCount || 0) * card.chainScaling, card.chainScalingCap || Infinity);
    }
    if (card.recoilScaling) {
        const pressure = (player.nextTurnEnergyBonus || 0) + (player.nextTurnEnergyPenalty || 0) + getStatus(player, "overcharge") + getStatus(player, "leakage");
        extraDamage += Math.min(pressure * card.recoilScaling, card.recoilScalingCap || Infinity);
    }
    if (card.discardFinisherScaling) {
        extraDamage += Math.min(discardCount * card.discardFinisherScaling, card.discardFinisherCap || Infinity);
    }

    if (rageTriggered) {
        extraDamage +=
            (card.rageBonusDamage || 0) +
            (
                card.type === "attack"
                    ? (skillBonus.rageSpendAttackBonus || 0)
                    : 0
            );

        extraBlock += card.rageBonusBlock || 0;
        extraDraw += card.rageBonusDraw || 0;
    }

    if (elementalChain.triggered) {
        extraDamage += elementalChain.damage;
        extraBlock += elementalChain.block;
        extraDraw += elementalChain.draw;

        player.lastElementalChain = elementalChain.label;
        player.chainCount = (player.chainCount || 0) + 1;

        // v19：各ターン最初の属性連鎖でエナジー。
        if (
            !player.firstChainSkillEnergyUsed &&
            (skillBonus.firstChainEnergy || 0) > 0
        ) {
            player.energy +=
                skillBonus.firstChainEnergy;

            player.firstChainSkillEnergyUsed = true;
        }

        // 三色の欠片：各戦闘で最初の属性連鎖時に+1エナジー
        if (
            hasRelic("prismShard") &&
            !player.elementalPrismUsed
        ) {
            player.energy += 1;
            player.elementalPrismUsed = true;

            if (typeof showRelicTrigger === "function") {
                showRelicTrigger("prismShard", "エナジー+1");
            }
        }

        // 秘術の羅針盤：各ターン最初の属性連鎖で1ドロー。
        if (
            hasRelic("arcaneCompass") &&
            !player.arcaneCompassUsedThisTurn
        ) {
            extraDraw += 1;
            player.arcaneCompassUsedThisTurn = true;

            if (typeof showRelicTrigger === "function") {
                showRelicTrigger("arcaneCompass", "+1ドロー");
            }
        }
    } else {
        player.lastElementalChain = "";
    }

    switch (card.type) {

        case "attack": {

            if (
                hasRelic("guardianCoin") &&
                !player.firstAttackGuardUsed
            ) {
                player.block += 5;
                player.firstAttackGuardUsed = true;

                if (typeof showRelicTrigger === "function") {
                    showRelicTrigger("guardianCoin", "+5ブロック");
                }
            }

            const hits = card.hits || 1;

            for (let i = 0; i < hits; i++) {

                if (enemy.hp <= 0) {
                    break;
                }

                // 追加ダメージは多段攻撃でも合計1回分だけ。
                const bossRelicDamage =
                    hasRelic("crimsonCrown")
                        ? 4
                        : 0;

                const whetstoneDamage =
                    hasRelic("sharpenedWhetstone")
                        ? 2
                        : 0;

                const rawDamage =
                    (card.damage || 0) +
                    bossRelicDamage +
                    whetstoneDamage +
                    (i === 0 ? extraDamage : 0);

                const damage = modifyAttackDamage(player, enemy, rawDamage);
                dealDamage(enemy, damage);
                triggerEnemyPassiveAfterHit();
            }

            break;
        }

        case "skill": {

            player.energy += card.energy || 0;

            const buckleBlock =
                hasRelic("ironBuckle") && (card.block || 0) > 0
                    ? 2
                    : 0;

            const treeSkillBlock =
                (card.block || 0) > 0
                    ? (skillBonus.skillBlockBonus || 0)
                    : 0;

            const energySkillBlock =
                (card.energy || 0) > 0
                    ? (skillBonus.energySkillBlock || 0)
                    : 0;

            player.block += modifyBlockGain(
                player,
                (card.block || 0) +
                extraBlock +
                buckleBlock +
                treeSkillBlock +
                energySkillBlock
            );

            if (card.reflectThisTurn) {
                player.reflectDamageThisTurn = Math.max(player.reflectDamageThisTurn || 0, card.reflectThisTurn);
            }

            if (card.heal) {
                let healAmount = card.heal;

                if (
                    selectedCharacter === "warrior" &&
                    typeof card.rageHealThreshold === "number" &&
                    (player.rage || 0) >= card.rageHealThreshold
                ) {
                    healAmount += card.rageBonusHeal || 0;
                }

                healPlayer(healAmount);
            }

            break;
        }

        default:
            console.warn(
                "未対応のカードタイプ:",
                card.type
            );
            break;
    }

    // 紅蓮の王冠：攻撃カードの代償としてHPを2失う。
    if (
        card.type === "attack" &&
        hasRelic("crimsonCrown")
    ) {
        dealSelfDamage(2);
    }

    // 攻撃カードでも属性連鎖のブロックが発生する可能性に対応。
    if (card.type !== "skill" && extraBlock > 0) {
        player.block += modifyBlockGain(player, extraBlock);
    }

    // 戦士：闘志獲得。
    if (selectedCharacter === "warrior") {

        if (card.rageGain) {
            gainRage(card.rageGain);

        } else if (
            card.type === "attack" &&
            !rageTriggered
        ) {
            gainRage(
                hasRelic("bloodBanner") &&
                player.hp <= player.maxHp * 0.5
                    ? 2
                    : 1
            );

            if (
                hasRelic("bloodBanner") &&
                player.hp <= player.maxHp * 0.5 &&
                typeof showRelicTrigger === "function"
            ) {
                showRelicTrigger("bloodBanner", "追加の闘志+1");
            }
        }
    }

    if (
        selectedCharacter === "wizard" &&
        card.element === "lightning" &&
        hasRelic("stormCoil") &&
        !player.stormCoilUsedThisTurn
    ) {
        player.stormCoilUsedThisTurn = true;
        extraDraw += 1;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger(
                "stormCoil",
                "+1ドロー"
            );
        }
    }

    // 魔法使い：同属性連続回数と最後の属性を更新。
    if (
        selectedCharacter === "wizard" &&
        card.element
    ) {
        player.sameElementStreak =
            sameElementBeforePlay
                ? (player.sameElementStreak || 1) + 1
                : 1;

        if (
            player.sameElementStreak >= 3 &&
            (skillBonus.thirdSameElementPower || 0) > 0
        ) {
            if (card.type === "attack" && enemy.hp > 0) {
                dealDamage(
                    enemy,
                    skillBonus.thirdSameElementPower
                );
            }

            if (card.type === "skill") {
                player.block +=
                    skillBonus.thirdSameElementPower;
            }
        }

        if (
            card.magic &&
            card.cost >= 2 &&
            !player.highMagicDrawUsedThisTurn &&
            (skillBonus.firstHighMagicDraw || 0) > 0
        ) {
            extraDraw +=
                skillBonus.firstHighMagicDraw;

            player.highMagicDrawUsedThisTurn = true;
        }

        player.lastElement = card.element;
    }

    // 機工士：カード効果でエナジーを得る最初の1回を増幅。
    if (
        selectedCharacter === "machinist" &&
        (card.energy || 0) > 0 &&
        !player.firstEnergyGainBonusUsedThisTurn &&
        (skillBonus.firstEnergyGainBonus || 0) > 0
    ) {
        player.energy +=
            skillBonus.firstEnergyGainBonus;

        player.firstEnergyGainBonusUsedThisTurn = true;
    }

    // 機工士系の共通追加効果
    if (card.nextTurnEnergyBonus) {
        player.nextTurnEnergyBonus += card.nextTurnEnergyBonus;
    }

    if (card.nextTurnEnergyPenalty) {
        player.nextTurnEnergyPenalty += card.nextTurnEnergyPenalty;
    }

    if (card.clearEnergyPenalty) {

        const hadPenalty =
            (player.nextTurnEnergyPenalty || 0) > 0;

        player.nextTurnEnergyPenalty = 0;

        if (
            hadPenalty &&
            hasRelic("recyclerCore")
        ) {
            extraDraw += 1;

            if (typeof showRelicTrigger === "function") {
                showRelicTrigger("recyclerCore", "+1ドロー");
            }
        }
    }

    if (card.selfDamage) {
        dealSelfDamage(card.selfDamage);
    }

    // 墓守：カードを捨て札へ送る前に、以前の捨て札を回収・消費する。
    if (card.returnDiscard) {
        returnCardsFromDiscard(card.returnDiscard);
    }

    const consumed = card.consumeDiscard
        ? consumeDiscardCards(card.consumeDiscard)
        : 0;

    if (consumed > 0 && card.healPerConsumed) {
        healPlayer(consumed * card.healPerConsumed);
    }

    if (
        selectedCharacter === "warrior" &&
        (player.cardsPlayedThisTurn || 0) === 3 &&
        (skillBonus.fourthCardDraw || 0) > 0
    ) {
        extraDraw +=
            skillBonus.fourthCardDraw;
    }

    if (
        cost === 0 &&
        hasRelic("quickQuill") &&
        !player.zeroCostDrawUsedThisTurn
    ) {
        extraDraw += 1;
        player.zeroCostDrawUsedThisTurn = true;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger("quickQuill", "+1ドロー");
        }
    }

    let drawAmount =
        (card.draw || 0) +
        extraDraw +
        consumed * (card.drawPerConsumed || 0);

    player.hand.splice(index, 1);
    if (!Array.isArray(player.exhaustPile)) player.exhaustPile = [];
    if (card.exhaust) {
        player.exhaustPile.push(cardId);
        if (typeof showFloatingCombatText === "function") showFloatingCombatText("player","🔥 消滅","relic");
    } else {
        player.discardPile.push(cardId);
    }

    if (card.discardRandom) {
        const discarded = discardRandomCardsFromHand(
            card.discardRandom
        );

        if (discarded > 0) {
            player.block +=
                discarded * (card.discardBonusBlock || 0);
            player.energy +=
                discarded * (card.energyPerDiscarded || 0);
        }
    }

    if (drawAmount > 0) {
        drawCards(drawAmount);
    }

    const blockGained =
        Math.max(
            0,
            (player.block || 0) - blockBeforeCard
        );

    if (
        blockGained > 0 &&
        typeof showFloatingCombatText === "function"
    ) {
        showFloatingCombatText(
            "player",
            `+${blockGained} BLOCK`,
            "block"
        );
    }

    if (card.type === "attack") {
        player.attacksPlayedThisTurn =
            (player.attacksPlayedThisTurn || 0) + 1;
    }

    player.cardsPlayedThisTurn =
        (player.cardsPlayedThisTurn || 0) + 1;

    player.lastCardType = card.type;

    checkEnemySpecialPhase();

    updatePlayerUI();
    updateEnemyUI();
    renderHand();

    checkBattleEnd();

    if (!battleEnded && typeof saveRunState === "function") {
        saveRunState();
    }
}


// ======================
// 自傷ダメージ
// ======================

function dealSelfDamage(amount) {

    if (!player || amount <= 0) {
        return;
    }

    let finalDamage = amount;

    if (hasRelic("heatSink")) {
        finalDamage =
            Math.max(0, finalDamage - 2);
    }

    finalDamage =
        Math.max(
            0,
            finalDamage -
            (player?.skillBonus?.selfDamageReduction || 0)
        );

    // v47: 自傷ダメージもブロックで防げるようにする。
    const blocked =
        Math.min(player.block || 0, finalDamage);

    player.block =
        Math.max(
            0,
            (player.block || 0) - blocked
        );

    const hpDamage =
        Math.max(0, finalDamage - blocked);

    if (hpDamage > 0) {
        player.hp =
            Math.max(0, player.hp - hpDamage);
    }

    if (
        blocked > 0 &&
        typeof showFloatingCombatText === "function"
    ) {
        showFloatingCombatText(
            "player",
            `🛡 ${blocked}`,
            "block"
        );
    }

    if (
        hpDamage > 0 &&
        typeof showFloatingCombatText === "function"
    ) {
        showFloatingCombatText(
            "player",
            `-${hpDamage}`,
            "damage"
        );
    }
}


// ======================
// 敵ターン
// ======================

function enemyTurn() {

    if (battleEnded || getLivingBattleEnemies().length === 0) {
        return;
    }

    const originalSelectedIndex = selectedEnemyIndex;

    for (const actingEnemy of battleEnemies) {
        if (!actingEnemy || actingEnemy.hp <= 0 || player.hp <= 0) continue;

        enemy = actingEnemy;
        actingEnemy.block = 0;
        applyStartTurnStatuses(actingEnemy);

        const move = actingEnemy.moves[actingEnemy.moveIndex];

        if (!move) {
            console.error("敵の行動が存在しません");
            continue;
        }

        switch (move.type) {
            case "attack": {
                const hits = move.hits || 1;

                for (let i = 0; i < hits; i++) {
                    if (player.hp <= 0 || actingEnemy.hp <= 0) break;
                    dealDamage(player, modifyAttackDamage(actingEnemy, player, move.value));
                    if ((player.reflectDamageThisTurn || 0) > 0 && actingEnemy.hp > 0) {
                        dealDamage(actingEnemy, player.reflectDamageThisTurn);
                    }
                }

                if (move.applyStatus && player.hp > 0 && actingEnemy.hp > 0) {
                    addStatus(player, move.applyStatus.id, move.applyStatus.amount || 1);
                }
                break;
            }

            case "block":
                actingEnemy.block += modifyBlockGain(actingEnemy, move.value);
                if (move.applyStatus) addStatus(player, move.applyStatus.id, move.applyStatus.amount || 1);
                break;

            default:
                console.warn("未対応の敵行動:", move.type);
                break;
        }

        actingEnemy.moveIndex = (actingEnemy.moveIndex + 1) % actingEnemy.moves.length;
        actingEnemy.nextMove = actingEnemy.moves[actingEnemy.moveIndex];

        applyEndTurnStatuses(actingEnemy);
        decayTimedStatuses(actingEnemy);
        actingEnemy.specialNotice = "";

        if (player.hp <= 0) break;
    }

    player.reflectDamageThisTurn = 0;
    selectedEnemyIndex = originalSelectedIndex;
    syncSelectedEnemy();

    updatePlayerUI();
    updateEnemyUI();
    checkBattleEnd();
}


// ======================
// ターン終了
// ======================

function endTurn() {

    if (battleEnded || !enemy) {
        return;
    }

    if (typeof playSe === "function") {
        playSe("uiClick", 0.72);
    }

    // v33 出血など、プレイヤー側ターン終了状態。
    applyEndTurnStatuses(player);
    decayTimedStatuses(player);
    if (player.hp <= 0) { checkBattleEnd(); if (battleEnded) return; }

    // v31 呪い / デバフは「手札にあるときだけ」ターン終了効果を発生。
    const endingHand = [...player.hand];

    endingHand.forEach(cardId => {
        const handCard = cards[cardId];
        if (handCard?.endTurnSelfDamage) {
            dealSelfDamage(handCard.endTurnSelfDamage);
        }
    });

    endingHand.forEach(cardId => {
        const handCard = cards[cardId];
        if (handCard?.ethereal) {
            player.exhaustPile.push(cardId);
        } else {
            player.discardPile.push(cardId);
        }
    });

    player.hand = [];
    renderHand();

    checkBattleEnd();
    if (battleEnded) {
        return;
    }

    const endedWithZeroEnergy =
        player.energy === 0;

    enemyTurn();

    if (battleEnded) {
        return;
    }

    const retainedBlock =
        Math.floor(
            (player.block || 0) *
            (player?.skillBonus?.retainBlockFraction || 0)
        );

    player.block = retainedBlock;

    const nextTurnBonus =
        player.nextTurnEnergyBonus || 0;

    const rawNextTurnPenalty =
        player.nextTurnEnergyPenalty || 0;

    const relicPenaltyReduction =
        hasRelic("stabilizer")
            ? 1
            : 0;

    const treePenaltyReduction =
        player?.skillBonus?.energyPenaltyReduction || 0;

    const nextTurnPenalty =
        Math.max(
            0,
            rawNextTurnPenalty -
            relicPenaltyReduction -
            treePenaltyReduction
        );

    if (
        rawNextTurnPenalty > 0 &&
        hasRelic("recoilPlate")
    ) {
        player.block += 5;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger(
                "recoilPlate",
                "+5ブロック"
            );
        }
    }

    player.energy = consumeEnergyStatuses(
        player,
        Math.max(0, player.maxEnergy + nextTurnBonus - nextTurnPenalty)
    );

    if (hasRelic("spareCell")) {
        player.energy += 1;
    }

    if (
        rawNextTurnPenalty > 0 &&
        (player?.skillBonus?.penaltyToBlock || 0) > 0
    ) {
        player.block +=
            rawNextTurnPenalty *
            player.skillBonus.penaltyToBlock;
    }

    if (
        endedWithZeroEnergy &&
        (player?.skillBonus?.zeroEnergyNextTurn || 0) > 0
    ) {
        player.energy +=
            player.skillBonus.zeroEnergyNextTurn;
    }

    if (
        endedWithZeroEnergy &&
        hasRelic("lastEmber")
    ) {
        player.energy += 1;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger("lastEmber", "エナジー+1");
        }
    }

    if (
        selectedCharacter === "gravekeeper" &&
        player.discardPile.length >= 10 &&
        (player?.skillBonus?.discardTurnEnergy || 0) > 0
    ) {
        player.energy +=
            player.skillBonus.discardTurnEnergy;
    }

    if (
        selectedCharacter === "gravekeeper" &&
        hasRelic("ossuaryKey") &&
        player.discardPile.length >= 8
    ) {
        player.energy += 1;

        if (typeof showRelicTrigger === "function") {
            showRelicTrigger("ossuaryKey", "エナジー+1");
        }
    }

    player.nextTurnEnergyBonus = 0;
    player.nextTurnEnergyPenalty = 0;
    player.lastElementalChain = "";
    player.arcaneCompassUsedThisTurn = false;
    player.cardsPlayedThisTurn = 0;
    player.zeroCostDrawUsedThisTurn = false;
    player.lastCardType = null;

    player.attacksPlayedThisTurn = 0;
    player.stormCoilUsedThisTurn = false;

    player.attacksPlayedThisTurn = 0;
    player.stormCoilUsedThisTurn = false;

    // v19 ターン状態をリセット
    player.firstChainSkillEnergyUsed = false;
    player.sameElementDrawUsedThisTurn = false;
    player.highMagicDiscountUsedThisTurn = false;
    player.highMagicDrawUsedThisTurn = false;
    player.firstEnergyGainBonusUsedThisTurn = false;
    player.recoveredCardsThisTurn = 0;
    player.forbiddenTomeUsedThisTurn = false;

    let turnDrawAmount = 5;

    if (hasRelic("cursedHourglass")) {
        turnDrawAmount += 1;
    }

    drawCards(turnDrawAmount);

    updatePlayerUI();
    updateEnemyUI();

    if (!battleEnded && typeof saveRunState === "function") {
        saveRunState();
    }
}


// ======================
// 戦闘終了判定
// ======================

function checkBattleEnd() {

    if (battleEnded) {
        return;
    }

    const livingEnemies = getLivingBattleEnemies();

    if (battleEnemies.length > 0 && livingEnemies.length === 0) {

        battleEnded = true;

        if (typeof playSe === "function") {
            playSe("enemyDown", 0.88);
        }

        const earnedSkillPoints =
            currentBattleType === "boss"
                ? 4
                : currentBattleType === "elite"
                    ? 2
                    : 1;

        awardSkillPoint(earnedSkillPoints);

        const victoryHeal = player?.skillBonus?.victoryHeal || 0;
        if (victoryHeal > 0) {
            healPlayer(victoryHeal);
            updatePlayerUI();
        }

        showPopup("Victory!", "次へ");

        const popupButton = document.getElementById("popup-button");
        popupButton.onclick = () => {
            document.getElementById("popup").classList.add("hidden");

            if (currentBattleType === "boss") {
                showBossRewardScreen();
            } else if (currentBattleType === "elite") {
                showEliteRewardScreen();
            } else {
                showRewardScreen("normal");
            }
        };
        return;
    }

    if (player.hp <= 0) {

        if (hasRelic("phoenixPlume") && !player.phoenixPlumeUsed) {
            player.phoenixPlumeUsed = true;
            player.hp = Math.max(1, Math.floor(player.maxHp * 0.5));
            if (typeof showRelicTrigger === "function") showRelicTrigger("phoenixPlume", `HP ${player.hp}で復活`);
            updatePlayerUI();
            return;
        }

        battleEnded = true;
        showPopup("Game Over", "タイトルへ");

        const popupButton = document.getElementById("popup-button");
        popupButton.onclick = () => {
            document.getElementById("popup").classList.add("hidden");
            if (typeof clearRunSave === "function") clearRunSave();
            changeScene("title");
        };
    }
}

// ======================
// v33.1 攻撃プレビュー
// ======================
function getCardPreviewDamage(card, target = enemy) {
    if (!card || card.type !== "attack" || !target) return null;

    let extraDamage = 0;
    const skillBonus = player?.skillBonus || {};
    const discardCount = player?.discardPile?.length || 0;
    const discardScale = Math.min(discardCount, card.discardScalingCap ?? discardCount);

    if (hasRelic("duelistRibbon") && (player.attacksPlayedThisTurn || 0) === 0) extraDamage += 3;
    if (card.element === "fire" && hasRelic("emberLens")) extraDamage += 3;
    if (card.cost >= 2 && hasRelic("heavySpring")) extraDamage += 4;
    if (selectedCharacter === "gravekeeper" && discardCount >= 6 && hasRelic("graveMarker")) extraDamage += 4;
    if (hasRelic("comboCharm") && player.lastCardType === "skill") extraDamage += 4;
    if (hasRelic("bloodAmber") && player.hp <= player.maxHp * 0.5) extraDamage += 3;

    if (selectedCharacter === "warrior") {
        if (player.hp <= player.maxHp * 0.5) extraDamage += skillBonus.lowHpAttackBonus || 0;
        if ((player.cardsPlayedThisTurn || 0) === 2) extraDamage += skillBonus.thirdCardAttackBonus || 0;
        if ((player.cardsPlayedThisTurn || 0) >= 4) extraDamage += skillBonus.lateComboAttackBonus || 0;
    }

    if (selectedCharacter === "wizard" && card.magic && card.cost >= 2) {
        extraDamage += skillBonus.highCostMagicAttackBonus || 0;
    }

    if (selectedCharacter === "machinist" && card.cost >= 2) {
        extraDamage += skillBonus.highCostAttackBonus || 0;
        if (card.cost >= 3) extraDamage += skillBonus.veryHighCostAttackBonus || 0;
    }

    if (card.damagePerDiscard) {
        extraDamage += discardScale * (card.damagePerDiscard + (selectedCharacter === "gravekeeper" ? (skillBonus.discardScalingBonus || 0) : 0));
    }
    if (card.rageScaling) extraDamage += Math.min((player.rage || 0) * card.rageScaling, card.rageScalingCap || Infinity);
    if (card.chainScaling) extraDamage += Math.min((player.chainCount || 0) * card.chainScaling, card.chainScalingCap || Infinity);
    if (card.recoilScaling) {
        const pressure = (player.nextTurnEnergyBonus || 0) + (player.nextTurnEnergyPenalty || 0) + getStatus(player, "overcharge") + getStatus(player, "leakage");
        extraDamage += Math.min(pressure * card.recoilScaling, card.recoilScalingCap || Infinity);
    }
    if (card.discardFinisherScaling) extraDamage += Math.min(discardCount * card.discardFinisherScaling, card.discardFinisherCap || Infinity);

    if (card.rageCost && (player.rage || 0) >= card.rageCost) {
        extraDamage += (card.rageBonusDamage || 0) + (skillBonus.rageSpendAttackBonus || 0);
    }

    const chain = getElementalChainEffect(card);
    if (chain.triggered) extraDamage += chain.damage || 0;

    const bossRelicDamage = hasRelic("crimsonCrown") ? 4 : 0;
    const whetstoneDamage = hasRelic("sharpenedWhetstone") ? 2 : 0;
    const hits = card.hits || 1;

    const firstRaw = (card.damage || 0) + bossRelicDamage + whetstoneDamage + extraDamage;
    const laterRaw = (card.damage || 0) + bossRelicDamage + whetstoneDamage;
    const first = modifyAttackDamage(player, target, firstRaw);
    const later = modifyAttackDamage(player, target, laterRaw);
    const total = first + Math.max(0, hits - 1) * later;

    return { first, later, hits, total };
}
