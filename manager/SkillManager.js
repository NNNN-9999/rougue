// ======================
// SkillManager.js v23
// 段階式・独立二択スキルツリー
// ======================

const SKILL_SAVE_KEY = "cardRoguelike_skillTree";
const SKILL_CHARACTERS = ["warrior", "wizard", "machinist", "gravekeeper", "common"];

let skillTreeCharacter = "warrior";
let skillState = loadSkillState();


function createEmptyUnlockedState() {
    const state = {};

    SKILL_CHARACTERS.forEach(characterId => {
        state[characterId] = [
            skillTrees[characterId].startNode
        ];
    });

    return state;
}


function createEmptyPointState() {
    return {
        warrior: 0,
        wizard: 0,
        machinist: 0,
        gravekeeper: 0,
        common: 0
    };
}


function getChoiceGroupMembers(groupId) {
    if (!groupId) {
        return [];
    }

    return Object.values(skillTree)
        .filter(node => node.choiceGroup === groupId);
}


function normalizeChoiceConflicts(characterId, nodeIds) {
    const valid = [...new Set(nodeIds)];
    const groups = new Map();

    valid.forEach(nodeId => {
        const node = skillTree[nodeId];

        if (
            !node ||
            node.character !== characterId ||
            !node.choiceGroup
        ) {
            return;
        }

        if (!groups.has(node.choiceGroup)) {
            groups.set(node.choiceGroup, []);
        }

        groups.get(node.choiceGroup).push(nodeId);
    });

    const remove = new Set();

    groups.forEach(ids => {
        if (ids.length <= 1) {
            return;
        }

        // v22.1以前の一本道セーブでは、v23で二択になる
        // 両ノードが取得済みのことがある。
        // よりコストの高い（旧ツリーで深い）側を残す。
        const keep = [...ids].sort((a, b) => {
            const costDiff =
                (skillTree[b]?.cost || 0) -
                (skillTree[a]?.cost || 0);

            if (costDiff !== 0) {
                return costDiff;
            }

            return ids.indexOf(b) - ids.indexOf(a);
        })[0];

        ids.forEach(id => {
            if (id !== keep) {
                remove.add(id);
            }
        });
    });

    return valid.filter(id => !remove.has(id));
}


function loadSkillState() {
    try {
        const raw = localStorage.getItem(SKILL_SAVE_KEY);

        if (!raw) {
            return {
                pointsByCharacter: createEmptyPointState(),
                unlockedByCharacter: createEmptyUnlockedState()
            };
        }

        const parsed = JSON.parse(raw);
        const pointsByCharacter = createEmptyPointState();
        const unlockedByCharacter = createEmptyUnlockedState();

        SKILL_CHARACTERS.forEach(characterId => {
            if (
                parsed.pointsByCharacter &&
                Number.isFinite(
                    Number(parsed.pointsByCharacter[characterId])
                )
            ) {
                pointsByCharacter[characterId] =
                    Math.max(
                        0,
                        Number(parsed.pointsByCharacter[characterId])
                    );
            } else if (
                Number.isFinite(
                    Number(parsed.totalPoints)
                )
            ) {
                pointsByCharacter[characterId] =
                    Math.max(
                        0,
                        Number(parsed.totalPoints)
                    );
            }

            const oldUnlocked =
                Array.isArray(
                    parsed.unlockedByCharacter?.[characterId]
                )
                    ? parsed.unlockedByCharacter[characterId]
                    : [];

            const validUnlocked =
                oldUnlocked.filter(nodeId =>
                    Boolean(skillTree[nodeId]) &&
                    skillTree[nodeId].character === characterId
                );

            const startId =
                skillTrees[characterId].startNode;

            unlockedByCharacter[characterId] =
                normalizeChoiceConflicts(
                    characterId,
                    [
                        startId,
                        ...validUnlocked.filter(
                            nodeId => nodeId !== startId
                        )
                    ]
                );
        });

        return {
            pointsByCharacter,
            unlockedByCharacter
        };

    } catch (error) {
        console.error(
            "スキルツリーのロードに失敗しました",
            error
        );

        return {
            pointsByCharacter: createEmptyPointState(),
            unlockedByCharacter: createEmptyUnlockedState()
        };
    }
}


function saveSkillState() {
    localStorage.setItem(
        SKILL_SAVE_KEY,
        JSON.stringify(skillState)
    );
}


// ======================
// SP
// ======================

function awardSkillPoint(
    amount = 1,
    characterId = selectedCharacter || skillTreeCharacter
) {
    if (!SKILL_CHARACTERS.includes(characterId) || characterId === "common") {
        return;
    }

    const earned = Math.max(0, amount);

    skillState.pointsByCharacter[characterId] =
        (skillState.pointsByCharacter[characterId] || 0) + earned;

    // v29: 共通SPはどのキャラで遊んでも貯まる。
    // 通常戦1 / エリート1 / ボス2程度のテンポ。
    const commonEarned = earned > 0
        ? Math.max(1, Math.ceil(earned / 2))
        : 0;

    skillState.pointsByCharacter.common =
        (skillState.pointsByCharacter.common || 0) + commonEarned;

    saveSkillState();
}


function getEarnedSkillPoints(
    characterId = skillTreeCharacter
) {
    return Math.max(
        0,
        skillState.pointsByCharacter[characterId] || 0
    );
}


function getUnlockedForCharacter(characterId) {
    return (
        skillState.unlockedByCharacter[characterId] ||
        []
    );
}


function isSkillUnlockedForCharacter(
    nodeId,
    characterId
) {
    return getUnlockedForCharacter(characterId)
        .includes(nodeId);
}


function getUsedSkillPoints(
    characterId = skillTreeCharacter
) {
    return getUnlockedForCharacter(characterId)
        .reduce((total, nodeId) => {
            return total + (skillTree[nodeId]?.cost || 0);
        }, 0);
}


function getAvailableSkillPoints(
    characterId = skillTreeCharacter
) {
    return Math.max(
        0,
        getEarnedSkillPoints(characterId) -
        getUsedSkillPoints(characterId)
    );
}


// v23も恒久ステータス強化はなし。
function getSkillBonusTotals() {
    const bonuses = {
        maxHp: 0, startGold: 0, battleGoldBonus: 0, extraRewardChoice: 0,
        startEnergy: 0, startBlock: 0, extraDraw: 0, victoryHeal: 0, maxRage: 0,
        chainDamageBonus: 0, chainBlockBonus: 0, recoveredCardBlock: 0,
        firstRecoveryEnergy: 0, secondRecoveryDraw: 0, startDiscard: 0,
        fifthCardDiscount: 0, firstHighMagicDiscount: 0, lowHpAttackBonus: 0,
        thirdCardAttackBonus: 0, lateComboAttackBonus: 0, attackCardBlock: 0,
        sameElementBlock: 0, sameElementAttackBonus: 0, sameElementFirstDraw: 0,
        highCostMagicAttackBonus: 0, highCostAttackBonus: 0, veryHighCostAttackBonus: 0,
        firstHeavyAttackBonus: 0, heavyAttackBlock: 0, discardScalingBonus: 0,
        discardThresholdAttackBonus: 0, deepDiscardAttackBonus: 0,
        discardThresholdSkillBlock: 0, rageSpendAttackBonus: 0, firstChainEnergy: 0,
        skillBlockBonus: 0, energySkillBlock: 0, thirdSameElementPower: 0,
        firstHighMagicDraw: 0, firstEnergyGainBonus: 0, fourthCardDraw: 0,
        selfDamageReduction: 0, retainBlockFraction: 0, energyPenaltyReduction: 0,
        penaltyToBlock: 0, zeroEnergyNextTurn: 0, discardTurnEnergy: 0
    };

    const characterId = selectedCharacter;
    if (!characterId || !SKILL_CHARACTERS.includes(characterId)) {
        return bonuses;
    }

    getUnlockedForCharacter(characterId).forEach(nodeId => {
        const effect = skillTree[nodeId]?.effect || {};
        Object.keys(bonuses).forEach(key => {
            if (typeof effect[key] === "number") {
                bonuses[key] += effect[key];
            }
        });
    });

    return bonuses;
}


// ======================
// Relic unlock compatibility
// ======================

function isRelicUnlockedForCharacter(
    relic,
    characterId
) {
    if (!relic) {
        return false;
    }

    if (!relic.unlockSkill) {
        return true;
    }

    const owner =
        relic.character || characterId;

    return isSkillUnlockedForCharacter(
        relic.unlockSkill,
        owner
    );
}


// ======================
// Node state
// ======================

function isNodeUnlocked(
    nodeId,
    characterId = skillTreeCharacter
) {
    return isSkillUnlockedForCharacter(
        nodeId,
        characterId
    );
}


function isChoiceLocked(
    nodeId,
    characterId = skillTreeCharacter
) {
    const node = skillTree[nodeId];

    if (!node?.choiceGroup) {
        return false;
    }

    return getChoiceGroupMembers(node.choiceGroup)
        .some(other =>
            other.id !== nodeId &&
            isNodeUnlocked(other.id, characterId)
        );
}


function areRequirementsMet(
    nodeId,
    characterId = skillTreeCharacter
) {
    const node = skillTree[nodeId];

    if (
        !node ||
        node.character !== characterId
    ) {
        return false;
    }

    const allRequirementsMet =
        (node.requires || [])
            .every(requiredId =>
                isNodeUnlocked(
                    requiredId,
                    characterId
                )
            );

    const anyRequirements =
        node.requiresAny || [];

    const anyRequirementMet =
        anyRequirements.length === 0 ||
        anyRequirements.some(requiredId =>
            isNodeUnlocked(
                requiredId,
                characterId
            )
        );

    return (
        allRequirementsMet &&
        anyRequirementMet
    );
}


function isNodeAvailable(
    nodeId,
    characterId = skillTreeCharacter
) {
    const node = skillTree[nodeId];

    if (
        !node ||
        node.character !== characterId ||
        isNodeUnlocked(nodeId, characterId) ||
        isChoiceLocked(nodeId, characterId)
    ) {
        return false;
    }

    return (
        areRequirementsMet(
            nodeId,
            characterId
        ) &&
        getAvailableSkillPoints(characterId) >= node.cost
    );
}


function unlockNode(nodeId) {
    if (
        !isNodeAvailable(
            nodeId,
            skillTreeCharacter
        )
    ) {
        return;
    }

    skillState
        .unlockedByCharacter[skillTreeCharacter]
        .push(nodeId);

    saveSkillState();
    closeSkillNodeModal();
    renderSkillTree();
}


function resetSkillTree() {
    const startId =
        skillTrees[skillTreeCharacter].startNode;

    const unlocked =
        getUnlockedForCharacter(
            skillTreeCharacter
        );

    if (
        unlocked.length <= 1 &&
        unlocked.includes(startId)
    ) {
        return;
    }

    const name =
        skillTrees[skillTreeCharacter]?.name ||
        "このキャラクター";

    if (
        !confirm(
            `${name}の追加アンロックをリセットしますか？\nSTARTは残り、使用SPはこのキャラへ返還されます。`
        )
    ) {
        return;
    }

    skillState.unlockedByCharacter[
        skillTreeCharacter
    ] = [startId];

    saveSkillState();
    closeSkillNodeModal();
    hideSkillHoverPreview();
    renderSkillTree();
}


// ======================
// Preview
// ======================

function getNodeTypeLabel(node) {
    if (node?.type === "start") {
        return "START";
    }

    if (node?.type === "relic") {
        return "RELIC UNLOCK";
    }

    if (node?.type === "rule") {
        return "RULE CHANGE";
    }

    if (node?.type === "system") {
        return "SYSTEM / EVENT UNLOCK";
    }

    if (node?.type === "potion") {
        return "POTION UNLOCK";
    }

    return "CARD UNLOCK";
}


function getSkillUnlockPreview(node) {
    if (!node) {
        return "";
    }

    const parts = [];

    // v29.2: 何を解禁するノードなのか、カード/レリックの詳細とは別に必ず表示する。
    // システム・イベント系ノードで「効果はあるのに説明が見えない」状態を防ぐ。
    if (node.description) {
        parts.push(`
            <div class="skill-preview-entry skill-node-description">
                <strong>📖 解禁内容</strong>
                <span>${node.description}</span>
            </div>
        `);
    }

    (node.unlockCards || [])
        .map(cardId => cards[cardId])
        .filter(Boolean)
        .forEach(card => {
            parts.push(`
                <div class="skill-preview-entry card-preview">
                    <div class="skill-preview-category">🃏 カード追加</div>
                    <strong>🃏 ${card.name}</strong>
                    <span>${card.description || ""}</span>
                </div>
            `);
        });

    (node.unlockRelics || [])
        .map(relicId => relics[relicId])
        .filter(Boolean)
        .forEach(relic => {
            parts.push(`
                <div class="skill-preview-entry relic-preview">
                    <div class="skill-preview-category">💎 レリック追加</div>
                    <strong>${relic.icon || "💎"} ${relic.name}</strong>
                    <span>${relic.description || ""}</span>
                </div>
            `);
        });

    (node.unlockPotions || [])
        .map(potionId => typeof potions !== "undefined" ? potions[potionId] : null)
        .filter(Boolean)
        .forEach(potion => {
            parts.push(`
                <div class="skill-preview-entry potion-preview">
                    <div class="skill-preview-category">🧪 ポーション追加</div>
                    <strong>${potion.icon || "🧪"} ${potion.name}</strong>
                    <span>${potion.description || ""}</span>
                </div>
            `);
        });

    const eventNames = {
        sleepingForge: ["⚒️", "眠れる鍛冶場", "スラッシュとガードをまとめて強化できるイベント。"],
        markedSupply: ["📦", "印のついた補給箱", "35G獲得かHP12回復を選べるイベント。"],
        ancientBench: ["🗿", "古代の整備台", "深層で出現するレアイベント。"]
    };
    if (node.effect?.unlockEvent && eventNames[node.effect.unlockEvent]) {
        const [icon, name, desc] = eventNames[node.effect.unlockEvent];
        parts.push(`<div class="skill-preview-entry event-preview"><div class="skill-preview-category">❓ イベント追加</div><strong>${icon} ${name}</strong><span>${desc}</span></div>`);
    }
    if (node.effect?.eventSense) {
        parts.push(`<div class="skill-preview-entry event-preview"><div class="skill-preview-category">❓ イベント追加</div><strong>📦 印のついた補給箱</strong><span>35Gを獲得するか、HPを12回復するかを選べます。</span></div>`);
    }
    if (node.effect?.rareEvents) {
        parts.push(`<div class="skill-preview-entry event-preview"><div class="skill-preview-category">❓ イベント追加</div><strong>🗿 古代の整備台</strong><span>深層で出現するレアイベントがイベントプールに追加されます。</span></div>`);
    }

    if (parts.length === 0) {
        return `
            <div class="skill-preview-entry">
                <strong>${node.icon || "◆"} ${node.name}</strong>
                <span>このノードの詳細は今後追加予定です。</span>
            </div>
        `;
    }

    return parts.join("");
}


function ensureSkillHoverPreview() {
    let preview =
        document.getElementById(
            "skill-hover-preview"
        );

    if (preview) {
        return preview;
    }

    preview = document.createElement("div");
    preview.id = "skill-hover-preview";
    preview.className =
        "skill-hover-preview hidden";

    document.body.appendChild(preview);

    return preview;
}


function showSkillHoverPreview(
    nodeId,
    anchor
) {
    const node = skillTree[nodeId];

    if (!node || !anchor) {
        return;
    }

    const preview =
        ensureSkillHoverPreview();

    const choiceNote =
        node.choiceGroup
            ? (
                isChoiceLocked(nodeId)
                    ? `<div class="skill-preview-choice locked">🔒 同じ二択のもう片方を取得済み</div>`
                    : `<div class="skill-preview-choice">◇ この段階ではどちらか1つだけ選択</div>`
            )
            : "";

    preview.innerHTML = `
        <div class="skill-hover-preview-type">
            ${getNodeTypeLabel(node)}
        </div>

        <div class="skill-hover-preview-name">
            ${node.icon || "◆"} ${node.name}
        </div>

        ${choiceNote}
        ${getSkillUnlockPreview(node)}
    `;

    preview.classList.remove("hidden");

    const rect =
        anchor.getBoundingClientRect();

    const previewWidth = 310;
    const viewportWidth =
        window.innerWidth;

    let left =
        rect.right + 12;

    if (
        left + previewWidth >
        viewportWidth - 12
    ) {
        left =
            Math.max(
                12,
                rect.left -
                previewWidth -
                12
            );
    }

    const top =
        Math.max(
            12,
            Math.min(
                rect.top - 8,
                window.innerHeight - 230
            )
        );

    preview.style.left =
        `${left}px`;

    preview.style.top =
        `${top}px`;
}


function hideSkillHoverPreview() {
    document
        .getElementById(
            "skill-hover-preview"
        )
        ?.classList.add("hidden");
}


// ======================
// Modal
// ======================

function ensureSkillNodeModal() {
    let modal =
        document.getElementById(
            "skill-node-modal"
        );

    if (modal) {
        return modal;
    }

    modal = document.createElement("div");
    modal.id = "skill-node-modal";
    modal.className =
        "skill-node-modal hidden";

    modal.innerHTML = `
        <div class="skill-node-modal-backdrop"></div>

        <div class="skill-node-modal-card">
            <button
                id="skill-node-modal-close"
                class="skill-node-modal-close"
                type="button"
                aria-label="閉じる"
            >
                ×
            </button>

            <div id="skill-node-modal-content"></div>
        </div>
    `;

    document.body.appendChild(modal);

    modal
        .querySelector(
            ".skill-node-modal-backdrop"
        )
        .addEventListener(
            "click",
            closeSkillNodeModal
        );

    modal
        .querySelector(
            "#skill-node-modal-close"
        )
        .addEventListener(
            "click",
            closeSkillNodeModal
        );

    return modal;
}


function closeSkillNodeModal() {
    document
        .getElementById(
            "skill-node-modal"
        )
        ?.classList.add("hidden");
}


function showSkillNodeModal(nodeId) {
    hideSkillHoverPreview();

    const node = skillTree[nodeId];

    if (!node) {
        return;
    }

    const modal =
        ensureSkillNodeModal();

    const content =
        modal.querySelector(
            "#skill-node-modal-content"
        );

    const unlocked =
        isNodeUnlocked(nodeId);

    const available =
        isNodeAvailable(nodeId);

    const choiceLocked =
        isChoiceLocked(nodeId);

    const isStart =
        node.type === "start";

    const choiceNote =
        node.choiceGroup
            ? (
                choiceLocked
                    ? `<div class="skill-modal-choice locked">🔒 この二択では別のスキルを選択済み</div>`
                    : `<div class="skill-modal-choice">◇ この段階ではどちらか1つだけ選択</div>`
            )
            : "";

    let buttonText = "";

    if (unlocked) {
        buttonText = "解放済み";
    } else if (choiceLocked) {
        buttonText = "別の選択を取得済み";
    } else if (available) {
        buttonText = `${node.cost} SPで解放`;
    } else if (areRequirementsMet(nodeId)) {
        buttonText = `SPが${node.cost}必要`;
    } else {
        buttonText = "まだ解放できない";
    }

    content.innerHTML = `
        <div class="skill-modal-kicker">
            ${getNodeTypeLabel(node)}
        </div>

        <div class="skill-modal-icon">
            ${node.icon || "◆"}
        </div>

        <h3>${node.name}</h3>

        ${choiceNote}

        <div class="skill-modal-effect-preview">
            ${getSkillUnlockPreview(node)}
        </div>

        ${
            isStart
                ? ""
                : `
                    <button
                        id="skill-modal-unlock"
                        class="skill-modal-unlock"
                        ${available ? "" : "disabled"}
                    >
                        ${buttonText}
                    </button>
                `
        }
    `;

    const button =
        content.querySelector(
            "#skill-modal-unlock"
        );

    if (
        button &&
        available
    ) {
        button.addEventListener(
            "click",
            () => unlockNode(nodeId)
        );
    }

    modal.classList.remove("hidden");
}


// ======================
// Graph
// ======================

function getGraphPoint(tree, pointId) {
    return (
        tree.layout?.[pointId] ||
        tree.junctions?.[pointId] ||
        null
    );
}


function getJunctionConnectedSkillIds(
    tree,
    junctionId,
    direction
) {
    if (direction === "incoming") {
        return (tree.edges || [])
            .filter(([, to]) => to === junctionId)
            .map(([from]) => from)
            .filter(id => Boolean(skillTree[id]));
    }

    return (tree.edges || [])
        .filter(([from]) => from === junctionId)
        .map(([, to]) => to)
        .filter(id => Boolean(skillTree[id]));
}


function getEdgeState(
    tree,
    fromId,
    toId,
    characterId
) {
    const fromIsJunction =
        Boolean(tree.junctions?.[fromId]);

    const toIsJunction =
        Boolean(tree.junctions?.[toId]);

    if (toIsJunction) {
        const fromUnlocked =
            isNodeUnlocked(
                fromId,
                characterId
            );

        return fromUnlocked
            ? "unlocked"
            : "locked";
    }

    if (fromIsJunction) {
        if (
            isNodeUnlocked(
                toId,
                characterId
            )
        ) {
            return "unlocked";
        }

        if (
            isChoiceLocked(
                toId,
                characterId
            )
        ) {
            return "choice-locked";
        }

        if (
            isNodeAvailable(
                toId,
                characterId
            )
        ) {
            return "ready";
        }

        if (
            areRequirementsMet(
                toId,
                characterId
            )
        ) {
            return "reachable";
        }

        return "locked";
    }

    const fromUnlocked =
        isNodeUnlocked(
            fromId,
            characterId
        );

    const toUnlocked =
        isNodeUnlocked(
            toId,
            characterId
        );

    if (
        fromUnlocked &&
        toUnlocked
    ) {
        return "unlocked";
    }

    if (
        isChoiceLocked(
            toId,
            characterId
        )
    ) {
        return "choice-locked";
    }

    if (
        fromUnlocked &&
        isNodeAvailable(
            toId,
            characterId
        )
    ) {
        return "ready";
    }

    if (fromUnlocked) {
        return "reachable";
    }

    return "locked";
}


function renderSkillGraphEdges(
    svg,
    tree,
    characterId
) {
    const ns =
        "http://www.w3.org/2000/svg";

    const defs =
        document.createElementNS(
            ns,
            "defs"
        );

    defs.innerHTML = `
        <marker
            id="skill-arrow-locked"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
        >
            <path
                d="M0 0 L10 5 L0 10 z"
                class="skill-arrow locked"
            ></path>
        </marker>

        <marker
            id="skill-arrow-ready"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
        >
            <path
                d="M0 0 L10 5 L0 10 z"
                class="skill-arrow ready"
            ></path>
        </marker>

        <marker
            id="skill-arrow-unlocked"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
        >
            <path
                d="M0 0 L10 5 L0 10 z"
                class="skill-arrow unlocked"
            ></path>
        </marker>
    `;

    svg.appendChild(defs);

    (tree.edges || [])
        .forEach(([fromId, toId]) => {
            const from =
                getGraphPoint(
                    tree,
                    fromId
                );

            const to =
                getGraphPoint(
                    tree,
                    toId
                );

            if (!from || !to) {
                return;
            }

            const line =
                document.createElementNS(
                    ns,
                    "line"
                );

            line.setAttribute(
                "x1",
                `${from.x}%`
            );

            line.setAttribute(
                "y1",
                `${from.y}%`
            );

            line.setAttribute(
                "x2",
                `${to.x}%`
            );

            line.setAttribute(
                "y2",
                `${to.y}%`
            );

            line.classList.add(
                "skill-graph-edge"
            );

            const state =
                getEdgeState(
                    tree,
                    fromId,
                    toId,
                    characterId
                );

            line.classList.add(state);

            if (state === "unlocked") {
                line.setAttribute(
                    "marker-end",
                    "url(#skill-arrow-unlocked)"
                );
            } else if (
                state === "ready" ||
                state === "reachable"
            ) {
                line.setAttribute(
                    "marker-end",
                    "url(#skill-arrow-ready)"
                );
            } else {
                line.setAttribute(
                    "marker-end",
                    "url(#skill-arrow-locked)"
                );
            }

            svg.appendChild(line);
        });
}


function renderSkillJunctions(
    graph,
    tree
) {
    Object.entries(
        tree.junctions || {}
    ).forEach(([, pos]) => {
        const junction =
            document.createElement(
                "div"
            );

        junction.className =
            "skill-graph-junction";

        junction.style.left =
            `${pos.x}%`;

        junction.style.top =
            `${pos.y}%`;

        graph.appendChild(junction);
    });
}


// ======================
// UI
// ======================

function showSkillTreeScreen() {
    skillTreeCharacter =
        selectedCharacter ||
        skillTreeCharacter ||
        "warrior";

    closeSkillNodeModal();
    hideSkillHoverPreview();

    changeScene("skill-tree");
    renderSkillTree();
}


function renderCharacterTabs(container) {
    const tabs =
        document.createElement("div");

    tabs.className =
        "skill-character-tabs skill-character-tabs-compact";

    SKILL_CHARACTERS.forEach(
        characterId => {
            const tree =
                skillTrees[characterId];

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "skill-character-tab" +
                (
                    characterId === skillTreeCharacter
                        ? " active"
                        : ""
                );

            button.innerHTML = `
                <span>${tree.icon}</span>
                <small>${tree.name}</small>
            `;

            button.addEventListener(
                "click",
                () => {
                    skillTreeCharacter =
                        characterId;

                    closeSkillNodeModal();
                    hideSkillHoverPreview();
                    renderSkillTree();
                }
            );

            tabs.appendChild(button);
        }
    );

    container.appendChild(tabs);
}


function renderSkillTree() {
    const pointsDisplay =
        document.getElementById(
            "skill-points-display"
        );

    const container =
        document.getElementById(
            "skill-tree-area"
        );

    if (
        !pointsDisplay ||
        !container
    ) {
        return;
    }

    const tree =
        skillTrees[skillTreeCharacter];

    const unlockedCount =
        getUnlockedForCharacter(
            skillTreeCharacter
        ).length;

    const totalNodes =
        Object.keys(
            tree.layout || {}
        ).length;

    pointsDisplay.innerHTML = `
        <span>
            ${tree.icon} ${tree.name}
        </span>

        <span>
            ${unlockedCount}/${totalNodes}
        </span>
    `;

    container.innerHTML = "";

    renderCharacterTabs(container);

    const shell =
        document.createElement(
            "section"
        );

    shell.className =
        "skill-graph-shell";

    const head =
        document.createElement("div");

    head.className =
        "skill-graph-header";

    head.innerHTML = `
        <div>
            <strong>${tree.name}</strong>
            <span>${tree.theme}</span>
        </div>

        <button
            id="skill-graph-reset"
            class="skill-graph-reset"
            type="button"
        >
            リセット
        </button>
    `;

    shell.appendChild(head);

    const graph =
        document.createElement("div");

    graph.className =
        "skill-graph";

    const svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

    svg.classList.add(
        "skill-graph-lines"
    );

    svg.setAttribute(
        "viewBox",
        "0 0 100 100"
    );

    svg.setAttribute(
        "preserveAspectRatio",
        "none"
    );

    renderSkillGraphEdges(
        svg,
        tree,
        skillTreeCharacter
    );

    graph.appendChild(svg);

    renderSkillJunctions(
        graph,
        tree
    );

    Object.entries(
        tree.layout || {}
    ).forEach(([nodeId, pos]) => {
        const node =
            skillTree[nodeId];

        if (!node) {
            return;
        }

        const unlocked =
            isNodeUnlocked(nodeId);

        const choiceLocked =
            isChoiceLocked(nodeId);

        const available =
            isNodeAvailable(nodeId);

        const requirementsMet =
            areRequirementsMet(nodeId);

        const button =
            document.createElement(
                "button"
            );

        button.type = "button";

        let stateClass = "locked";

        if (unlocked) {
            stateClass = "unlocked";
        } else if (choiceLocked) {
            stateClass = "choice-locked";
        } else if (available) {
            stateClass = "available";
        } else if (requirementsMet) {
            stateClass = "need-points";
        }

        button.className =
            `skill-graph-node ${node.type || "card"} ${stateClass}`;

        if (node.choiceGroup) {
            button.classList.add(
                "choice-node"
            );
        }

        if (
            nodeId === tree.startNode
        ) {
            button.classList.add(
                "start-node"
            );
        }

        button.style.left =
            `${pos.x}%`;

        button.style.top =
            `${pos.y}%`;

        button.innerHTML = `
            ${
                node.choiceGroup
                    ? `<span class="skill-choice-mark">◇</span>`
                    : ""
            }

            <span class="skill-graph-node-icon">
                ${node.icon || "◆"}
            </span>

            <span class="skill-graph-node-cost">
                ${
                    node.type === "start" ||
                    unlocked
                        ? "✓"
                        : choiceLocked
                            ? "🔒"
                            : node.cost
                }
            </span>
        `;

        button.title =
            node.name;

        button.addEventListener(
            "click",
            () =>
                showSkillNodeModal(
                    nodeId
                )
        );

        button.addEventListener(
            "mouseenter",
            () =>
                showSkillHoverPreview(
                    nodeId,
                    button
                )
        );

        button.addEventListener(
            "mouseleave",
            hideSkillHoverPreview
        );

        button.addEventListener(
            "focus",
            () =>
                showSkillHoverPreview(
                    nodeId,
                    button
                )
        );

        button.addEventListener(
            "blur",
            hideSkillHoverPreview
        );

        graph.appendChild(button);
    });

    shell.appendChild(graph);
    container.appendChild(shell);

    const footer =
        document.createElement("div");

    footer.className =
        "skill-tree-footer-bar";

    footer.innerHTML = `
        <span>
            ${tree.name} 使用可能SP
        </span>

        <strong>
            ${getAvailableSkillPoints(
                skillTreeCharacter
            )}
        </strong>
    `;

    container.appendChild(footer);

    head
        .querySelector(
            "#skill-graph-reset"
        )
        .addEventListener(
            "click",
            resetSkillTree
        );
}


const skillTreeButton =
    document.getElementById(
        "skill-tree-button"
    );

if (skillTreeButton) {
    skillTreeButton.addEventListener(
        "click",
        showSkillTreeScreen
    );
}


const skillResetButton =
    document.getElementById(
        "skill-reset-button"
    );

if (skillResetButton) {
    skillResetButton.classList.add(
        "hidden"
    );
}


const skillBackButton =
    document.getElementById(
        "skill-back-button"
    );

if (skillBackButton) {
    skillBackButton.addEventListener(
        "click",
        () => {
            closeSkillNodeModal();
            hideSkillHoverPreview();
            changeScene("title");
        }
    );
}


document.addEventListener(
    "keydown",
    event => {
        if (event.key === "Escape") {
            closeSkillNodeModal();
            hideSkillHoverPreview();
        }
    }
);
