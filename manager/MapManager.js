// ======================
// MapManager.js
// 地下フロア型・分岐マップ管理
// ======================

console.log("★★★ MapManager.js 読み込み成功");


// ======================
// 基本設定
// ======================

// B1 / B2 / B3 ...
let currentDepth = 1;

// 現在選択可能なLayer
let floor = 1;

let mapData = [];
let currentMapNode = null;

const visitedMapNodeIds = new Set();

const MAP_LAYERS = 10;
const MIN_NODES_PER_LAYER = 2;
const MAX_NODES_PER_LAYER = 5;
const TREASURE_LAYER = 5;


// ======================
// ノード種類
// ======================

const MAP_TYPES = {
    BATTLE: "battle",
    ELITE: "elite",
    REST: "rest",
    EVENT: "event",
    SHOP: "shop",
    TREASURE: "treasure",
    BOSS: "boss"
};

const MAP_NODE_INFO = {

    battle: {
        icon: "⚔️",
        name: "戦闘"
    },

    elite: {
        icon: "⭐",
        name: "エリート"
    },

    rest: {
        icon: "🔥",
        name: "休憩所"
    },

    event: {
        icon: "❓",
        name: "イベント"
    },

    shop: {
        icon: "💰",
        name: "ショップ"
    },

    treasure: {
        icon: "🎁",
        name: "宝箱"
    },

    boss: {
        icon: "👑",
        name: "ボス"
    }

};


// ======================
// マップ開始
// ======================

function startMap() {

    currentDepth = 1;
    floor = 1;
    currentMapNode = null;

    visitedMapNodeIds.clear();

    mapData = createMap();

    showMap();

    if (typeof saveRunState === "function") {
        saveRunState();
    }
}


// ======================
// マップ生成
// ======================

function createMap() {

    const map = [];

    // Layer 1 ～ 10
    for (
        let layer = 1;
        layer <= MAP_LAYERS;
        layer++
    ) {

        const nodeCount = randomInt(
            MIN_NODES_PER_LAYER,
            MAX_NODES_PER_LAYER
        );

        const nodes = [];

        for (
            let index = 0;
            index < nodeCount;
            index++
        ) {

            nodes.push({
                id: `B${currentDepth}-L${layer}-N${index}`,
                floor: layer,
                index,
                type: getRandomNodeType(layer),
                connections: []
            });
        }

        // 宝箱Layerは全ノード宝箱
        if (layer === TREASURE_LAYER) {

            nodes.forEach(node => {
                node.type = MAP_TYPES.TREASURE;
            });
        }

        map.push(nodes);
    }

    // 最後にボスLayer
    map.push([
        {
            id: `B${currentDepth}-BOSS`,
            floor: MAP_LAYERS + 1,
            index: 0,
            type: MAP_TYPES.BOSS,
            connections: []
        }
    ]);

    connectMap(map);

    console.log(
        `★★★ B${currentDepth} マップ生成:`,
        map.map(layerNodes =>
            layerNodes.map(node => ({
                floor: node.floor,
                type: node.type,
                connections: [...node.connections]
            }))
        )
    );

    return map;
}


// ======================
// ノード種類
// ======================

function getRandomNodeType(layer) {

    // ボス直前のLayerは全ノード休憩所
    if (layer === MAP_LAYERS) {
        return MAP_TYPES.REST;
    }

    const random = Math.random();

    // 序盤：戦闘 / イベント中心
    if (layer <= 2) {

        return random < 0.50
            ? MAP_TYPES.BATTLE
            : MAP_TYPES.EVENT;
    }

    // 中盤
    if (layer <= 6) {

        if (random < 0.30) {
            return MAP_TYPES.BATTLE;
        }

        if (random < 0.43) {
            return MAP_TYPES.ELITE;
        }

        if (random < 0.60) {
            return MAP_TYPES.REST;
        }

        if (random < 0.78) {
            return MAP_TYPES.EVENT;
        }

        if (random < 0.92) {
            return MAP_TYPES.SHOP;
        }

        return MAP_TYPES.BATTLE;
    }

    // 終盤
    if (random < 0.42) {
        return MAP_TYPES.BATTLE;
    }

    if (random < 0.62) {
        return MAP_TYPES.ELITE;
    }

    if (random < 0.75) {
        return MAP_TYPES.REST;
    }

    if (random < 0.86) {
        return MAP_TYPES.EVENT;
    }

    if (random < 0.94) {
        return MAP_TYPES.SHOP;
    }

    return MAP_TYPES.BATTLE;
}


// ======================
// 接続生成
// 近い位置を優先し、線の交差を減らす
// ======================

function connectMap(map) {

    for (
        let layerIndex = 0;
        layerIndex < map.length - 1;
        layerIndex++
    ) {

        const currentNodes = map[layerIndex];
        const nextNodes = map[layerIndex + 1];

        currentNodes.forEach(node => {
            node.connections = [];
        });

        // ボスLayerなら全ノードをボスへ
        if (nextNodes.length === 1) {

            currentNodes.forEach(node => {
                addConnection(node, nextNodes[0]);
            });

            continue;
        }

        // 各現在ノードに「位置が近い」主接続を1本作る
        const primaryTargets = currentNodes.map(
            (node, index) => {

                const targetIndex = mapPositionIndex(
                    index,
                    currentNodes.length,
                    nextNodes.length
                );

                addConnection(
                    node,
                    nextNodes[targetIndex]
                );

                return targetIndex;
            }
        );

        // 次Layerの孤立ノードを防ぐ
        nextNodes.forEach((targetNode, targetIndex) => {

            const hasIncoming = currentNodes.some(
                node =>
                    node.connections.includes(
                        targetNode.id
                    )
            );

            if (hasIncoming) {
                return;
            }

            const sourceIndex = mapPositionIndex(
                targetIndex,
                nextNodes.length,
                currentNodes.length
            );

            addConnection(
                currentNodes[sourceIndex],
                targetNode
            );
        });

        // 約35%で近隣への分岐を追加。
        // 主接続の順序を崩さない範囲だけに限定する。
        currentNodes.forEach((node, index) => {

            if (
                Math.random() >= 0.35 ||
                node.connections.length >= 2
            ) {
                return;
            }

            const primaryIndex =
                primaryTargets[index];

            const candidates = [];

            // 右側候補
            if (primaryIndex + 1 < nextNodes.length) {

                const nextPrimary =
                    index + 1 < primaryTargets.length
                        ? primaryTargets[index + 1]
                        : nextNodes.length - 1;

                if (nextPrimary >= primaryIndex + 1) {
                    candidates.push(primaryIndex + 1);
                }
            }

            // 左側候補
            if (primaryIndex - 1 >= 0) {

                const previousPrimary =
                    index > 0
                        ? primaryTargets[index - 1]
                        : 0;

                if (previousPrimary <= primaryIndex - 1) {
                    candidates.push(primaryIndex - 1);
                }
            }

            if (candidates.length === 0) {
                return;
            }

            const branchIndex = randomFrom(candidates);

            addConnection(
                node,
                nextNodes[branchIndex]
            );
        });
    }
}


function mapPositionIndex(
    index,
    sourceLength,
    targetLength
) {

    if (targetLength <= 1) {
        return 0;
    }

    if (sourceLength <= 1) {
        return Math.floor(
            (targetLength - 1) / 2
        );
    }

    return Math.round(
        index *
        (targetLength - 1) /
        (sourceLength - 1)
    );
}


function addConnection(fromNode, toNode) {

    if (
        !fromNode.connections.includes(
            toNode.id
        )
    ) {

        fromNode.connections.push(
            toNode.id
        );
    }
}


// ======================
// ノード検索・状態
// ======================

function getMapNodeById(id) {

    for (const layerNodes of mapData) {

        const node = layerNodes.find(
            mapNode => mapNode.id === id
        );

        if (node) {
            return node;
        }
    }

    return null;
}


function getAvailableMapNodes() {

    // ゲーム開始時はLayer1全部
    if (currentMapNode === null) {
        return mapData[0] || [];
    }

    const nextLayerIndex =
        currentMapNode.floor;

    const nextLayer =
        mapData[nextLayerIndex];

    if (!nextLayer) {
        return [];
    }

    return nextLayer.filter(node =>
        currentMapNode.connections.includes(
            node.id
        )
    );
}


function isVisitedNode(node) {

    return visitedMapNodeIds.has(
        node.id
    );
}


function isCurrentNode(node) {

    return Boolean(
        currentMapNode &&
        currentMapNode.id === node.id
    );
}


function isAvailableNode(node) {

    return getAvailableMapNodes().some(
        availableNode =>
            availableNode.id === node.id
    );
}


// ======================
// マップ表示
// ======================

function showMap() {

    changeScene("map");

    const mapArea =
        document.getElementById(
            "map-area"
        );

    if (!mapArea) {

        console.error(
            "map-areaが見つかりません"
        );

        return;
    }

    mapArea.innerHTML = "";

    const title =
        document.createElement("h2");

    title.className = "map-title";
    title.textContent = `B${currentDepth}`;

    mapArea.appendChild(title);

    const progress =
        document.createElement("p");

    progress.className = "map-progress";

    progress.textContent =
        floor > MAP_LAYERS
            ? "BOSS"
            : `Layer ${floor} / ${MAP_LAYERS}`;

    mapArea.appendChild(progress);

    const wrapper =
        document.createElement("div");

    wrapper.className = "map-wrapper";

    const container =
        document.createElement("div");

    container.className = "map-container";

    wrapper.appendChild(container);
    mapArea.appendChild(wrapper);

    const svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

    svg.classList.add(
        "map-connections"
    );

    container.appendChild(svg);

    for (
        let layerIndex = 0;
        layerIndex < mapData.length;
        layerIndex++
    ) {

        const layerNodes =
            mapData[layerIndex];

        const layerElement =
            document.createElement("div");

        layerElement.className =
            "map-floor";

        layerElement.dataset.floor =
            layerIndex + 1;

        for (const node of layerNodes) {

            const nodeWrapper =
                document.createElement("div");

            nodeWrapper.className =
                "map-node-wrapper";

            const button =
                document.createElement("button");

            button.className =
                "map-node";

            button.dataset.nodeId =
                node.id;

            const info =
                MAP_NODE_INFO[node.type];

            if (isVisitedNode(node)) {
                button.classList.add("visited");
            }

            if (isCurrentNode(node)) {
                button.classList.add("current");
            }

            if (isAvailableNode(node)) {
                button.classList.add("available");
            }

            button.innerHTML = `
                <span class="map-node-icon">
                    ${info.icon}
                </span>

                <span class="map-node-name">
                    ${info.name}
                </span>
            `;

            if (isAvailableNode(node)) {

                button.addEventListener(
                    "click",
                    () => {
                        selectMapNode(node);
                    }
                );

            } else {

                button.disabled = true;
            }

            nodeWrapper.appendChild(button);
            layerElement.appendChild(
                nodeWrapper
            );
        }

        container.appendChild(
            layerElement
        );
    }

    requestAnimationFrame(() => {
        drawMapConnections();
    });
}


// ======================
// 接続線描画
// ======================

function drawMapConnections() {

    const container =
        document.querySelector(
            ".map-container"
        );

    const svg =
        document.querySelector(
            ".map-connections"
        );

    if (!container || !svg) {
        return;
    }

    svg.innerHTML = "";

    const containerRect =
        container.getBoundingClientRect();

    svg.setAttribute(
        "viewBox",
        `0 0 ${container.clientWidth} ${container.scrollHeight}`
    );

    for (const layerNodes of mapData) {

        for (const node of layerNodes) {

            const sourceElement =
                container.querySelector(
                    `.map-node[data-node-id="${node.id}"]`
                );

            if (!sourceElement) {
                continue;
            }

            const sourceRect =
                sourceElement.getBoundingClientRect();

            const sourceX =
                sourceRect.left +
                sourceRect.width / 2 -
                containerRect.left;

            // ノードの下端から線を出す
            const sourceY =
                sourceRect.bottom -
                containerRect.top;

            for (
                const connectionId
                of node.connections
            ) {

                const targetElement =
                    container.querySelector(
                        `.map-node[data-node-id="${connectionId}"]`
                    );

                if (!targetElement) {
                    continue;
                }

                const targetRect =
                    targetElement.getBoundingClientRect();

                const targetX =
                    targetRect.left +
                    targetRect.width / 2 -
                    containerRect.left;

                // 次ノードの上端につなぐ
                const targetY =
                    targetRect.top -
                    containerRect.top;

                const line =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "line"
                    );

                line.setAttribute("x1", sourceX);
                line.setAttribute("y1", sourceY);
                line.setAttribute("x2", targetX);
                line.setAttribute("y2", targetY);

                const targetNode =
                    getMapNodeById(
                        connectionId
                    );

                if (
                    targetNode &&
                    visitedMapNodeIds.has(node.id) &&
                    visitedMapNodeIds.has(targetNode.id)
                ) {

                    line.classList.add(
                        "visited"
                    );

                } else if (
                    currentMapNode &&
                    currentMapNode.id === node.id &&
                    targetNode &&
                    isAvailableNode(targetNode)
                ) {

                    line.classList.add(
                        "active"
                    );

                } else {

                    line.classList.add(
                        "future"
                    );
                }

                svg.appendChild(line);
            }
        }
    }
}


// ======================
// ノード選択
// ======================

function selectMapNode(node) {

    if (!isAvailableNode(node)) {
        return;
    }

    // ノードに入る前の安全なマップ状態をチェックポイント保存。
    if (typeof saveRunState === "function") {
        saveRunState();
    }

    currentMapNode = node;
    floor = node.floor;

    visitedMapNodeIds.add(
        node.id
    );

    switch (node.type) {

        case MAP_TYPES.BATTLE:
            startNextBattle();
            break;

        case MAP_TYPES.ELITE:
            startEliteBattle();
            break;

        case MAP_TYPES.REST:
            showRest();
            break;

        case MAP_TYPES.EVENT:
            showEvent();
            break;

        case MAP_TYPES.SHOP:
            showShop();
            break;

        case MAP_TYPES.TREASURE:
            showTreasureReward();
            break;

        case MAP_TYPES.BOSS:
            startBossBattle();
            break;

        default:
            console.error(
                "不明なマップタイプ:",
                node.type
            );
            break;
    }
}


// ======================
// ノード終了後の進行
// ======================

function advanceFromCurrentNode() {

    if (!currentMapNode) {

        console.error(
            "currentMapNode が存在しません"
        );

        return;
    }

    // ボス撃破後は次の地下階層へ
    if (
        currentMapNode.type ===
        MAP_TYPES.BOSS
    ) {

        currentDepth++;
        floor = 1;
        currentMapNode = null;

        visitedMapNodeIds.clear();

        mapData = createMap();

        showMap();

        if (typeof saveRunState === "function") {
            saveRunState();
        }
        return;
    }

    floor = currentMapNode.floor + 1;
    showMap();

    if (typeof saveRunState === "function") {
        saveRunState();
    }
}


// ======================
// 戦闘
// ======================

function startNextBattle() {

    console.log(
        "★★★ 通常戦闘開始"
    );

    changeScene("battle");
    startBattle("normal");
}


function startEliteBattle() {

    console.log(
        "★★★ エリート戦開始"
    );

    changeScene("battle");
    startBattle("elite");
}


function startBossBattle() {

    console.log(
        `★★★ B${currentDepth} BOSS戦開始`
    );

    changeScene("battle");
    startBattle("boss");
}


// ======================
// イベント
// ======================

function getEventAvailableRelics() {
    const owned = new Set(player?.relics || []);

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

function getEventCardPool(minRarity = "common") {
    const rarityRank = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 3,
        legendary: 4
    };

    const minRank = rarityRank[minRarity] ?? 0;

    return getCardPoolForCharacter(selectedCharacter)
        .filter(card =>
            (rarityRank[card.rarity] ?? 0) >= minRank
        );
}

function eventRandomFrom(list) {
    if (!Array.isArray(list) || list.length === 0) {
        return null;
    }

    return list[
        Math.floor(Math.random() * list.length)
    ];
}

function getEventRarityLabel(rarity) {
    const labels = {
        common: "COMMON",
        uncommon: "UNCOMMON",
        rare: "RARE",
        epic: "EPIC",
        legendary: "LEGENDARY"
    };

    return labels[rarity] || "COMMON";
}



// ======================
// v18 イベント結果チップ
// ======================

function captureEventResultState() {

    return {
        hp: player.hp,
        maxHp: player.maxHp,
        gold: player.gold || 0,
        maxEnergy: player.maxEnergy || 0,
        deck: [...(player.starterDeck || [])],
        relics: [...(player.relics || [])]
    };
}


function getAddedIds(beforeList, afterList) {

    const counts = {};

    beforeList.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
    });

    const added = [];

    afterList.forEach(id => {
        if (counts[id] > 0) {
            counts[id] -= 1;
        } else {
            added.push(id);
        }
    });

    return added;
}


function buildEventResultChips(before, after) {

    if (!before || !after) {
        return [];
    }

    const chips = [];

    const hpDiff = after.hp - before.hp;
    const maxHpDiff = after.maxHp - before.maxHp;
    const goldDiff = after.gold - before.gold;
    const energyDiff = after.maxEnergy - before.maxEnergy;

    if (hpDiff !== 0) {
        chips.push({
            tone: hpDiff > 0 ? "good" : "bad",
            text: `${hpDiff > 0 ? "+" : ""}${hpDiff} HP`
        });
    }

    if (maxHpDiff !== 0) {
        chips.push({
            tone: maxHpDiff > 0 ? "good" : "bad",
            text: `${maxHpDiff > 0 ? "+" : ""}${maxHpDiff} 最大HP`
        });
    }

    if (goldDiff !== 0) {
        chips.push({
            tone: goldDiff > 0 ? "gold" : "bad",
            text: `${goldDiff > 0 ? "+" : ""}${goldDiff}G`
        });
    }

    if (energyDiff !== 0) {
        chips.push({
            tone: energyDiff > 0 ? "good" : "bad",
            text: `${energyDiff > 0 ? "+" : ""}${energyDiff} 最大エナジー`
        });
    }

    const addedCards =
        getAddedIds(
            before.deck || [],
            after.deck || []
        );

    addedCards.forEach(cardId => {
        const card = cards[cardId];

        if (!card) {
            return;
        }

        chips.push({
            tone: card.rarity || "common",
            text:
                `${getEventRarityLabel(card.rarity)} CARD：${card.name}`
        });
    });

    const addedRelics =
        getAddedIds(
            before.relics || [],
            after.relics || []
        );

    addedRelics.forEach(relicId => {
        const relic = relics[relicId];

        if (!relic) {
            return;
        }

        chips.push({
            tone: "relic",
            text:
                `${relic.icon || "💎"} RELIC：${relic.name}`
        });
    });

    if (chips.length === 0) {
        chips.push({
            tone: "neutral",
            text: "変化なし"
        });
    }

    return chips;
}


function renderEventResultChips(chips) {

    if (!Array.isArray(chips)) {
        return "";
    }

    return `
        <div class="event-result-chips">
            ${chips
                .map(chip => `
                    <span class="event-result-chip ${chip.tone || "neutral"}">
                        ${chip.text}
                    </span>
                `)
                .join("")}
        </div>
    `;
}


function getEventDefinitions() {
    const availableRelics = getEventAvailableRelics();

    const events = [
        {
            id: "mysteriousFountain",
            title: "💧 謎の泉",
            description:
                "暗い通路の先に、淡く光る泉がある。水面からかすかな熱を感じる。",
            choices: [
                {
                    label: "水を飲む",
                    effectText: "HPを20回復する",
                    tone: "good",
                    effect() {
                        const healed = healPlayer(20);
                        return `泉の水を飲んだ。<br><br>HPが${healed}回復した。`;
                    }
                },
                {
                    label: "立ち去る",
                    effectText: "何も起こらない",
                    effect() {
                        return "泉には触れず、その場を立ち去った。";
                    }
                }
            ]
        },
        {
            id: "bloodAltar",
            title: "🩸 血塗れの祭壇",
            description:
                "古い祭壇には金貨が積まれている。だが、代価を求めているようだ。",
            choices: [
                {
                    label: "祭壇に触れる",
                    effectText: "最大HP -6 / 100G獲得",
                    tone: "danger",
                    canChoose: () => player.maxHp > 12,
                    effect() {
                        player.maxHp -= 6;
                        player.hp = Math.min(player.hp, player.maxHp);
                        const gained = typeof gainGold === "function" ? gainGold(100) : 100;
                        if (typeof gainGold !== "function") { player.gold += gained; }
                        updatePlayerUI();
                        return gained > 0
                            ? "身体から力が抜ける。<br><br>最大HPが6減少し、100Gを獲得した。"
                            : "身体から力が抜ける。<br><br>最大HPが6減少したが、封金の導体が金貨の獲得を拒んだ。";
                    }
                },
                {
                    label: "何も取らない",
                    effectText: "安全に立ち去る",
                    effect() {
                        return "金貨には手を出さなかった。";
                    }
                }
            ]
        },
        {
            id: "forgottenIdol",
            title: "🗿 忘れられた偶像",
            description:
                "崩れかけた偶像の内部で、何かが鈍く輝いている。",
            choices: [
                {
                    label: "手を差し入れる",
                    effectText: "HP -14 / レリックを1つ獲得",
                    tone: "danger",
                    canChoose: () => player.hp > 14 && availableRelics.length > 0,
                    effect() {
                        const relic = eventRandomFrom(availableRelics);
                        player.hp -= 14;

                        if (relic) {
                            if (typeof addRelicDirectly === "function") {
                                addRelicDirectly(relic.id);
                            } else {
                                player.relics.push(relic.id);
                                updateOwnedRelicUI();
                            }
                        }

                        updatePlayerUI();

                        return relic
                            ? `鋭い破片で傷ついた。<br><br>HPを14失い、💎 ${relic.name} を獲得した。`
                            : "内部は空だった。";
                    }
                },
                {
                    label: "触らない",
                    effectText: "危険を避ける",
                    effect() {
                        return "嫌な予感がして、偶像から離れた。";
                    }
                }
            ]
        },
        {
            id: "undergroundTrader",
            title: "🧥 地下の行商人",
            description:
                "顔を隠した行商人が、布に包んだカードを差し出してくる。",
            choices: [
                {
                    label: "カードを買う",
                    effectText: "55G / アンコモン以上のカードを1枚獲得",
                    tone: "good",
                    canChoose: () => player.gold >= 55,
                    effect() {
                        const pool = getEventCardPool("uncommon");
                        const card = eventRandomFrom(pool);

                        if (!card) {
                            return "今のあなたに扱えるカードはなかった。";
                        }

                        player.gold -= 55;
                        player.starterDeck.push(card.id);

                        return `55Gを支払い、🃏 ${card.name} 【${getEventRarityLabel(card.rarity)}】を獲得した。`;
                    }
                },
                {
                    label: "断る",
                    effectText: "ゴールドを温存する",
                    effect() {
                        return "行商人は無言で闇の中へ消えていった。";
                    }
                }
            ]
        },
        {
            id: "tornSatchel",
            title: "🎒 裂けた鞄",
            description:
                "瓦礫の下から重そうな鞄が覗いている。引き抜くには無理をする必要がありそうだ。",
            choices: [
                {
                    label: "鞄を引き抜く",
                    effectText: "HP -8 / 55G獲得",
                    tone: "danger",
                    canChoose: () => player.hp > 8,
                    effect() {
                        player.hp -= 8;
                        const gained = typeof gainGold === "function" ? gainGold(55) : 55;
                        if (typeof gainGold !== "function") { player.gold += gained; }
                        updatePlayerUI();
                        return gained > 0
                            ? "瓦礫で傷ついたが、中にはまだ使える金貨が残っていた。<br><br>HPを8失い、55Gを獲得した。"
                            : "瓦礫で傷ついた。金貨は見つかったが、封金の導体のせいで獲得できなかった。";
                    }
                },
                {
                    label: "諦める",
                    effectText: "何も失わない",
                    effect() {
                        return "崩落を警戒し、鞄を置いて進んだ。";
                    }
                }
            ]
        },
        {
            id: "silentArchive",
            title: "📚 静かな書庫",
            description:
                "地下には不釣り合いなほど保存状態の良い書庫。読むほどに身体が冷えていく。",
            choices: [
                {
                    label: "禁書を読む",
                    effectText: "最大HP -4 / レア以上のカードを1枚獲得",
                    tone: "danger",
                    canChoose: () => player.maxHp > 10,
                    effect() {
                        let pool = getEventCardPool("rare");

                        if (pool.length === 0) {
                            pool = getEventCardPool("uncommon");
                        }

                        const card = eventRandomFrom(pool);

                        if (!card) {
                            return "読める内容は残っていなかった。";
                        }

                        player.maxHp -= 4;
                        player.hp = Math.min(player.hp, player.maxHp);
                        player.starterDeck.push(card.id);
                        updatePlayerUI();

                        return `禁書の知識が頭に流れ込む。<br><br>最大HPが4減少し、🃏 ${card.name} 【${getEventRarityLabel(card.rarity)}】を獲得した。`;
                    }
                },
                {
                    label: "休んでから去る",
                    effectText: "HPを10回復する",
                    tone: "good",
                    effect() {
                        const healed = healPlayer(10);
                        return `書庫の静けさの中で少し休んだ。<br><br>HPが${healed}回復した。`;
                    }
                }
            ]
        },
        {
            id: "whisperingShrine",
            title: "🕯️ 囁く祠",
            description:
                "灯りの消えた祠から、小さな声が聞こえる。祈りに何が返るかは分からない。",
            choices: [
                {
                    label: "祈る",
                    effectText: "50%でHP30回復 / 50%でHP12失う",
                    effect() {
                        if (Math.random() < 0.5) {
                            const healed = healPlayer(30);
                            return `温かな光が身体を包んだ。<br><br>HPが${healed}回復した。`;
                        }

                        const damage = Math.min(12, Math.max(0, player.hp - 1));
                        player.hp -= damage;
                        updatePlayerUI();
                        return `祠の声が突然途切れ、身体に痛みが走った。<br><br>HPを${damage}失った。`;
                    }
                },
                {
                    label: "祈らない",
                    effectText: "何も起こらない",
                    effect() {
                        return "声を無視して先へ進んだ。";
                    }
                }
            ]
        }
    ];

    // v29: 共通ツリー「寄り道の勘」で追加される小イベント。
    if (
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_event_sense", "common")
    ) {
        events.push({
            id: "markedSupplyCrate",
            title: "📦 印のついた補給箱",
            description:
                "通路の脇に、探索者同士だけが使う印のついた古い補給箱が残されている。",
            choices: [
                {
                    label: "金貨を回収する",
                    effectText: "35G獲得",
                    tone: "good",
                    effect() {
                        const gained = typeof gainGold === "function" ? gainGold(35) : 35;
                        if (typeof gainGold !== "function") { player.gold += gained; }
                        return gained > 0
                            ? "底板の下から小袋を見つけた。<br><br>35Gを獲得した。"
                            : "底板の下から小袋を見つけたが、封金の導体が金貨の獲得を拒んだ。";
                    }
                },
                {
                    label: "応急用品を使う",
                    effectText: "HPを12回復",
                    tone: "good",
                    effect() {
                        const healed = healPlayer(12);
                        return `残っていた応急用品を使った。<br><br>HPが${healed}回復した。`;
                    }
                }
            ]
        });
    }

    // v29: 共通ツリー最深部で追加されるレアイベント。
    if (
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_explore_cap", "common")
    ) {
        const hasUpgradeable = (player?.starterDeck || []).some(cardId =>
            !isUpgradedCardId(cardId) && Boolean(getUpgradedCardId(cardId))
        );

        if (hasUpgradeable) {
            events.push({
                id: "ancientMaintenanceBench",
                title: "🛠️ 古代の整備台",
                description:
                    "まだ動く古い整備装置が、装備品ではなくカードの魔力に反応している。",
                choices: [
                    {
                        label: "装置を起動する",
                        effectText: "ランダムな未強化カードを2枚まで強化",
                        tone: "good",
                        effect() {
                            const candidates = player.starterDeck
                                .map((cardId, index) => ({ cardId, index }))
                                .filter(entry =>
                                    !isUpgradedCardId(entry.cardId) &&
                                    Boolean(getUpgradedCardId(entry.cardId))
                                );

                            for (let i = candidates.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
                            }

                            const chosen = candidates.slice(0, 2);
                            const names = [];

                            chosen.forEach(entry => {
                                const upgradedId = getUpgradedCardId(entry.cardId);
                                if (!upgradedId || !cards[upgradedId]) return;
                                player.starterDeck[entry.index] = upgradedId;
                                names.push(cards[upgradedId].name);
                            });

                            return names.length
                                ? `整備装置が静かに停止した。<br><br>${names.join(" / ")} を強化した。`
                                : "装置は反応しなかった。";
                        }
                    },
                    {
                        label: "触らない",
                        effectText: "そのまま進む",
                        effect() {
                            return "古い装置には触れず、その場を離れた。";
                        }
                    }
                ]
            });
        }
    }

    // v29: 共通ツリーで解禁されるカード強化イベント。
    if (
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_forge_event", "common")
    ) {
        events.push({
            id: "sleepingForge",
            title: "⚒️ 眠れる鍛冶場",
            description:
                "火の落ちた古い鍛冶場。刃と盾を置くと、残り火が静かに灯り始める。",
            choices: [
                {
                    label: "基礎装備を鍛え直す",
                    effectText: "デッキ内のスラッシュ / ガードをすべて強化",
                    tone: "good",
                    canChoose: () => {
                        return Array.isArray(player?.starterDeck) &&
                            player.starterDeck.some(cardId => cardId === "strike" || cardId === "defend");
                    },
                    effect() {
                        let upgraded = 0;
                        player.starterDeck = player.starterDeck.map(cardId => {
                            if (cardId !== "strike" && cardId !== "defend") {
                                return cardId;
                            }

                            const upgradedId = typeof getUpgradedCardId === "function"
                                ? getUpgradedCardId(cardId)
                                : null;

                            if (upgradedId && cards[upgradedId]) {
                                upgraded += 1;
                                return upgradedId;
                            }

                            return cardId;
                        });

                        return upgraded > 0
                            ? `古い炉が一瞬だけ息を吹き返した。<br><br>基礎カードを${upgraded}枚強化した。`
                            : "鍛え直せる基礎カードは残っていなかった。";
                    }
                },
                {
                    label: "炉を休ませる",
                    effectText: "何もせず先へ進む",
                    effect() {
                        return "残り火には触れず、鍛冶場を後にした。";
                    }
                }
            ]
        });
    }

    // レリックが残っていない場合、偶像イベントは出さない。
    return events.filter(event =>
        event.id !== "forgottenIdol" ||
        availableRelics.length > 0
    );
}

function getEventPlayerStatusHTML() {
    if (!player) {
        return "";
    }

    const characterName =
        (typeof selectedCharacter !== "undefined" &&
         typeof characters !== "undefined" &&
         characters[selectedCharacter])
            ? characters[selectedCharacter].name
            : "Player";

    const relicCount = Array.isArray(player.relics)
        ? player.relics.length
        : 0;

    return `
        <div class="event-player-status">
            <div class="event-status-name">${characterName}</div>

            <div class="event-status-item event-status-hp">
                <span class="event-status-label">❤️ HP</span>
                <strong>${player.hp} / ${player.maxHp}</strong>
            </div>

            <div class="event-status-item">
                <span class="event-status-label">⚡ 最大エナジー</span>
                <strong>${player.maxEnergy}</strong>
            </div>

            <div class="event-status-item">
                <span class="event-status-label">💰 Gold</span>
                <strong>${player.gold ?? 0}</strong>
            </div>

            <div class="event-status-item">
                <span class="event-status-label">🏺 レリック</span>
                <strong>${relicCount}</strong>
            </div>
        </div>
    `;
}

function getEventDescriptionText(event) {
    if (event?.description && String(event.description).trim()) {
        return event.description;
    }

    return "周囲を調べると、何か選択できそうだ。選択肢の効果を確認して行動を決めよう。";
}

function getEventChoiceExplanation(choice) {
    if (choice?.effectText && String(choice.effectText).trim()) {
        return choice.effectText;
    }

    // v29.2: 説明未設定の選択肢も空欄にせず、結果が不明であることを明示する。
    return "効果の詳細は選択後に判明する";
}


function showEvent() {
    changeScene("map");

    const event = eventRandomFrom(
        getEventDefinitions()
    );

    if (!event) {
        showEventResult("何も起こらなかった。");
        return;
    }

    const mapArea = document.getElementById("map-area");

    mapArea.innerHTML = `
        <div class="event-panel">
            ${getEventPlayerStatusHTML()}
            <h2>B${currentDepth}</h2>
            <h3>${event.title}</h3>
            <p class="event-description">${getEventDescriptionText(event)}</p>
            <div id="event-choice-list" class="event-buttons"></div>
        </div>
    `;

    const choiceList = document.getElementById("event-choice-list");

    event.choices.forEach(choice => {
        const button = document.createElement("button");
        const enabled = choice.canChoose ? choice.canChoose() : true;
        const toneClass = choice.tone ? ` event-${choice.tone}` : "";

        button.innerHTML = `
            ${choice.label}
            <span class="event-effect${toneClass}">
                ${getEventChoiceExplanation(choice)}
            </span>
        `;

        if (!enabled) {
            button.disabled = true;
            button.title = "条件を満たしていません";
        }

        button.addEventListener("click", () => {
            if (!enabled) {
                return;
            }

            const before =
                captureEventResultState();

            const message =
                choice.effect();

            const after =
                captureEventResultState();

            const chips =
                buildEventResultChips(
                    before,
                    after
                );

            showEventResult(
                message,
                chips
            );
        });

        choiceList.appendChild(button);
    });
}

function showEventResult(message, chips = []) {
    const mapArea = document.getElementById("map-area");

    mapArea.innerHTML = `
        <div class="event-panel event-result-panel">
            ${getEventPlayerStatusHTML()}
            <h2>B${currentDepth}</h2>
            <h3>✨ イベント結果</h3>

            ${renderEventResultChips(chips)}

            <p class="event-description event-result-description">
                ${message}
            </p>

            <button id="event-return-button">次へ進む</button>
        </div>
    `;

    updatePlayerUI();

    if (typeof updateOwnedRelicUI === "function") {
        updateOwnedRelicUI();
    }

    document
        .getElementById("event-return-button")
        .addEventListener("click", advanceFromCurrentNode);
}


// ======================
// 休憩所
// ======================

function showRest() {

    changeScene("map");

    const mapArea =
        document.getElementById(
            "map-area"
        );

    const restDisabled =
        Array.isArray(player?.relics) &&
        player.relics.includes("abyssCore");

    const healingPercent =
        Math.round(30 * getHealingMultiplier());

    const upgradeableCount =
        (player?.starterDeck || [])
            .filter(cardId =>
                !isUpgradedCardId(cardId) &&
                Boolean(getUpgradedCardId(cardId))
            )
            .length;

    const reforgeUnlocked =
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_rest_choice", "common");

    mapArea.innerHTML = `
        <div class="rest-site-panel">
            <div class="rest-site-heading">
                <span class="rest-site-icon">🔥</span>
                <div>
                    <h2>B${currentDepth}</h2>
                    <h3>休憩所</h3>
                </div>
            </div>

            <p class="rest-site-lead">
                休むか、デッキのカードを1枚強化できます。
            </p>

            <div class="rest-choice-grid">
                <button
                    id="rest-button"
                    class="rest-choice-button heal-choice${restDisabled ? " disabled" : ""}"
                    ${restDisabled ? "disabled" : ""}
                >
                    <span class="rest-choice-icon">❤️</span>
                    <strong>休む</strong>
                    <small>${
                        restDisabled
                            ? "深淵の核により回復できない"
                            : `最大HPの${healingPercent}%相当を回復`
                    }</small>
                </button>

                <button
                    id="rest-upgrade-button"
                    class="rest-choice-button upgrade-choice${upgradeableCount === 0 ? " disabled" : ""}"
                    ${upgradeableCount === 0 ? "disabled" : ""}
                >
                    <span class="rest-choice-icon">⬆️</span>
                    <strong>カードを強化</strong>
                    <small>${
                        upgradeableCount > 0
                            ? `強化可能 ${upgradeableCount}枚`
                            : "すべて強化済み"
                    }</small>
                </button>

                ${reforgeUnlocked ? `
                    <button
                        id="rest-reforge-button"
                        class="rest-choice-button upgrade-choice${upgradeableCount === 0 ? " disabled" : ""}"
                        ${upgradeableCount === 0 ? "disabled" : ""}
                    >
                        <span class="rest-choice-icon">🔧</span>
                        <strong>軽整備</strong>
                        <small>HPを6回復し、ランダムな未強化カード1枚を強化</small>
                    </button>
                ` : ""}
            </div>
        </div>
    `;

    const restButton =
        document.getElementById("rest-button");

    if (restButton && !restDisabled) {
        restButton.addEventListener("click", rest);
    }

    const upgradeButton =
        document.getElementById("rest-upgrade-button");

    if (upgradeButton && upgradeableCount > 0) {
        upgradeButton.addEventListener(
            "click",
            showRestCardUpgrade
        );
    }

    const reforgeButton =
        document.getElementById("rest-reforge-button");

    if (reforgeButton && upgradeableCount > 0) {
        reforgeButton.addEventListener("click", () => {
            const candidates = player.starterDeck
                .map((cardId, index) => ({ cardId, index }))
                .filter(entry =>
                    !isUpgradedCardId(entry.cardId) &&
                    Boolean(getUpgradedCardId(entry.cardId))
                );

            if (candidates.length === 0) return;

            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            const upgradedId = getUpgradedCardId(chosen.cardId);
            player.starterDeck[chosen.index] = upgradedId;
            const healed = healPlayer(6);

            mapArea.innerHTML = `
                <div class="upgrade-complete-panel">
                    <div class="upgrade-complete-icon">🔧</div>
                    <div class="upgrade-complete-kicker">LIGHT MAINTENANCE</div>
                    <h3>${cards[upgradedId].name}</h3>
                    <p>カードを1枚強化し、HPを${healed}回復した。</p>
                    <button id="rest-reforge-complete-button" type="button">次へ進む</button>
                </div>
            `;

            document
                .getElementById("rest-reforge-complete-button")
                .addEventListener("click", advanceFromCurrentNode);
        });
    }
}


function showRestCardUpgrade() {

    const mapArea =
        document.getElementById("map-area");

    const deck =
        Array.isArray(player?.starterDeck)
            ? player.starterDeck
            : [];

    const rarityOrder = {
        legendary: 0,
        epic: 1,
        rare: 2,
        uncommon: 3,
        common: 4
    };

    const rarityLabel = {
        legendary: "LEGENDARY",
        epic: "EPIC",
        rare: "RARE",
        uncommon: "UNCOMMON",
        common: "COMMON"
    };

    const upgradeEntries = deck
        .map((cardId, index) => {
            const currentCard = cards[cardId];
            const upgradedId = getUpgradedCardId(cardId);
            const upgradedCard = upgradedId
                ? cards[upgradedId]
                : null;

            if (
                !currentCard ||
                currentCard.upgraded ||
                !upgradedCard
            ) {
                return null;
            }

            return {
                index,
                currentCard,
                upgradedCard,
                rarity: currentCard.rarity || "common"
            };
        })
        .filter(Boolean)
        .sort((a, b) => {
            const rarityDiff =
                (rarityOrder[a.rarity] ?? 99) -
                (rarityOrder[b.rarity] ?? 99);

            if (rarityDiff !== 0) {
                return rarityDiff;
            }

            return a.currentCard.name.localeCompare(
                b.currentCard.name,
                "ja"
            );
        });

    const cardTiles = upgradeEntries
        .map(({ index, currentCard, upgradedCard, rarity }) => `
            <button
                class="upgrade-card-tile ${rarity}"
                type="button"
                data-upgrade-preview-index="${index}"
                aria-label="${currentCard.name}を確認"
            >
                <div class="upgrade-card-tile-top">
                    <span class="upgrade-card-rarity">${rarityLabel[rarity] || rarity.toUpperCase()}</span>
                    <span class="upgrade-card-cost">${currentCard.cost}</span>
                </div>

                <strong class="upgrade-card-tile-name">${currentCard.name}</strong>

                <div class="upgrade-card-tile-arrow">⬆</div>

                <small>${upgradedCard.upgradeSummary || "効果を強化"}</small>
            </button>
        `)
        .join("");

    const firstEntry = upgradeEntries[0] || null;

    mapArea.innerHTML = `
        <div class="upgrade-select-panel compact-upgrade-panel">
            <div class="upgrade-select-header">
                <div>
                    <h2>⬆️ カード強化</h2>
                    <p>強化できるカードだけを、レアリティ順に表示しています。</p>
                </div>

                <button id="upgrade-back-button" class="secondary-button" type="button">
                    戻る
                </button>
            </div>

            ${
                firstEntry
                    ? `
                        <div class="upgrade-picker-layout">
                            <div class="upgrade-card-grid compact">
                                ${cardTiles}
                            </div>

                            <aside id="upgrade-card-preview" class="upgrade-card-preview"></aside>
                        </div>
                    `
                    : `
                        <div class="upgrade-empty-state">
                            <strong>強化できるカードはありません</strong>
                            <span>デッキ内のカードはすべて強化済みです。</span>
                        </div>
                    `
            }
        </div>
    `;

    const preview =
        document.getElementById("upgrade-card-preview");

    let selectedUpgradeIndex =
        firstEntry ? firstEntry.index : null;

    const renderPreview = index => {
        if (!preview) return;

        const entry = upgradeEntries.find(
            item => item.index === index
        );

        if (!entry) return;

        selectedUpgradeIndex = index;

        mapArea
            .querySelectorAll("[data-upgrade-preview-index]")
            .forEach(button => {
                button.classList.toggle(
                    "selected",
                    Number(button.dataset.upgradePreviewIndex) === index
                );
            });

        const { currentCard, upgradedCard, rarity } = entry;

        preview.innerHTML = `
            <div class="upgrade-preview-rarity ${rarity}">
                ${rarityLabel[rarity] || rarity.toUpperCase()}
            </div>

            <div class="upgrade-preview-title-row">
                <h3>${currentCard.name}</h3>
                <span>COST ${currentCard.cost}</span>
            </div>

            <div class="upgrade-preview-section">
                <small>現在</small>
                <p>${currentCard.description}</p>
            </div>

            <div class="upgrade-preview-section after">
                <small>強化後</small>
                <strong>${upgradedCard.upgradeSummary || "効果を強化"}</strong>
                <p>${upgradedCard.description}</p>
            </div>

            <button id="confirm-upgrade-button" class="confirm-upgrade-button" type="button">
                このカードを強化
            </button>
        `;

        document
            .getElementById("confirm-upgrade-button")
            ?.addEventListener("click", () => {
                if (selectedUpgradeIndex === null) return;
                upgradeDeckCardAtRest(selectedUpgradeIndex);
            });
    };

    mapArea
        .querySelectorAll("[data-upgrade-preview-index]")
        .forEach(button => {
            const index =
                Number(button.dataset.upgradePreviewIndex);

            // v32: 強化対象はクリックしたカードで固定する。
            // カーソル移動やキーボードフォーカスだけでは選択を変更しない。
            button.addEventListener(
                "click",
                () => renderPreview(index)
            );
        });

    if (firstEntry) {
        renderPreview(firstEntry.index);
    }

    document
        .getElementById("upgrade-back-button")
        ?.addEventListener("click", showRest);
}


function upgradeDeckCardAtRest(index) {

    if (
        !Array.isArray(player?.starterDeck) ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= player.starterDeck.length
    ) {
        return;
    }

    const currentId = player.starterDeck[index];

    if (isUpgradedCardId(currentId)) {
        return;
    }

    const upgradedId =
        getUpgradedCardId(currentId);

    if (!upgradedId || !cards[upgradedId]) {
        return;
    }

    const before = cards[currentId];
    const after = cards[upgradedId];

    player.starterDeck[index] = upgradedId;

    if (typeof saveRunState === "function") {
        saveRunState();
    }

    const mapArea =
        document.getElementById("map-area");

    mapArea.innerHTML = `
        <div class="upgrade-complete-panel">
            <div class="upgrade-complete-icon">✨</div>
            <div class="upgrade-complete-kicker">CARD UPGRADED</div>
            <h2>${before.name} → ${after.name}</h2>
            <p>${after.upgradeSummary}</p>
            <button id="upgrade-complete-button" type="button">
                次へ進む
            </button>
        </div>
    `;

    document
        .getElementById("upgrade-complete-button")
        .addEventListener("click", advanceFromCurrentNode);
}


function rest() {

    const healAmount =
        Math.floor(
            player.maxHp * 0.30
        );

    const healed =
        healPlayer(healAmount);

    updatePlayerUI();

    alert(
        `HPが${healed}回復しました`
    );

    advanceFromCurrentNode();
}


// ======================
// 汎用
// ======================

function randomInt(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


function randomFrom(array) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];
}
