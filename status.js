// ======================
// v33 Status System
// ======================

const STATUS_DEFS = {
    strength:    { icon: "💪", name: "筋力", kind: "buff", timed: false, description: "攻撃ダメージをX増加。" },
    weak:        { icon: "⬇️", name: "弱体", kind: "debuff", timed: true, description: "与える攻撃ダメージが50%減少。ターンごとに1減少。" },
    vulnerable:  { icon: "🎯", name: "脆弱", kind: "debuff", timed: true, description: "受ける攻撃ダメージが50%増加。ターンごとに1減少。" },
    regeneration:{ icon: "🌿", name: "再生", kind: "buff", timed: true, description: "ターン開始時にX HP回復し、その後1減少。" },
    ritual:      { icon: "🕯️", name: "儀式", kind: "buff", timed: false, description: "ターン開始時に筋力を1得る。" },
    fortress:    { icon: "🏰", name: "鉄壁", kind: "buff", timed: false, description: "ターン開始時にXブロック。HPに攻撃が通るたび1減少。" },
    dexterity:   { icon: "🪽", name: "敏捷", kind: "buff", timed: true, description: "ブロック獲得量が50%増加。ターンごとに1減少。" },
    slowness:    { icon: "🪨", name: "鈍化", kind: "debuff", timed: true, description: "ブロック獲得量が50%減少。ターンごとに1減少。" },
    bleed:       { icon: "🩸", name: "出血", kind: "debuff", timed: true, description: "ターン終了時にXダメージを受け、その後1減少。" },
    confusion:   { icon: "🌀", name: "混乱", kind: "debuff", timed: true, description: "手札のカードコストが0〜4でランダムになる。ターンごとに1減少。" },
    resistance:  { icon: "🛡️", name: "耐性", kind: "buff", timed: false, description: "次に受けるデバフをX回無効化。" },
    overcharge:  { icon: "⚡", name: "過充電", kind: "buff", timed: false, description: "次ターン開始時にエナジー+X。その後解除。" },
    leakage:     { icon: "🔻", name: "漏電", kind: "debuff", timed: false, description: "次ターン開始時にエナジー-X。その後解除。" }
};

function ensureStatuses(target) {
    if (!target) return {};
    if (!target.statuses || typeof target.statuses !== "object") target.statuses = {};
    return target.statuses;
}

function getStatus(target, id) {
    return Math.max(0, Number(ensureStatuses(target)[id] || 0));
}

function setStatus(target, id, amount) {
    const statuses = ensureStatuses(target);
    if (amount > 0) statuses[id] = Math.floor(amount);
    else delete statuses[id];
}

function addStatus(target, id, amount = 1, options = {}) {
    if (!target || !STATUS_DEFS[id] || amount <= 0) return false;
    const def = STATUS_DEFS[id];

    if (def.kind === "debuff" && !options.ignoreResistance) {
        const resistance = getStatus(target, "resistance");
        if (resistance > 0) {
            setStatus(target, "resistance", resistance - 1);
            if (typeof showFloatingCombatText === "function") {
                showFloatingCombatText(target === enemy ? "enemy" : "player", "耐性", "block");
            }
            return false;
        }
    }

    // 敏捷と鈍化は相殺。
    const opposite = id === "dexterity" ? "slowness" : id === "slowness" ? "dexterity" : null;
    if (opposite) {
        const existingOpposite = getStatus(target, opposite);
        if (existingOpposite > 0) {
            const cancel = Math.min(existingOpposite, amount);
            setStatus(target, opposite, existingOpposite - cancel);
            amount -= cancel;
            if (amount <= 0) return true;
        }
    }

    setStatus(target, id, getStatus(target, id) + amount);
    return true;
}

function removeStatus(target, id) {
    setStatus(target, id, 0);
}

function cleanseDebuffs(target) {
    Object.entries(STATUS_DEFS).forEach(([id, def]) => {
        if (def.kind === "debuff") removeStatus(target, id);
    });
}

function modifyAttackDamage(source, target, rawDamage) {
    let damage = Math.max(0, rawDamage || 0);
    damage += getStatus(source, "strength");
    if (getStatus(source, "weak") > 0) damage *= 0.5;
    if (getStatus(target, "vulnerable") > 0) damage *= 1.5;
    return Math.max(0, Math.floor(damage));
}

function modifyBlockGain(target, rawBlock) {
    let block = Math.max(0, rawBlock || 0);
    if (getStatus(target, "dexterity") > 0) block *= 1.5;
    if (getStatus(target, "slowness") > 0) block *= 0.5;
    return Math.max(0, Math.floor(block));
}

function applyStartTurnStatuses(target) {
    if (!target) return;
    const regen = getStatus(target, "regeneration");
    if (regen > 0) {
        if (target === player && typeof healPlayer === "function") healPlayer(regen);
        else target.hp = Math.min(target.maxHp, target.hp + regen);
    }
    if (getStatus(target, "ritual") > 0) addStatus(target, "strength", 1, { ignoreResistance: true });
    const fortress = getStatus(target, "fortress");
    if (fortress > 0) target.block = (target.block || 0) + modifyBlockGain(target, fortress);
}

function applyEndTurnStatuses(target) {
    if (!target) return;
    const bleed = getStatus(target, "bleed");
    if (bleed > 0) {
        const before = target.hp;
        target.hp = Math.max(0, target.hp - bleed);
        if (typeof showFloatingCombatText === "function") {
            showFloatingCombatText(target === enemy ? "enemy" : "player", `🩸 -${before - target.hp}`, "damage");
        }
    }
}

function decayTimedStatuses(target) {
    if (!target) return;
    Object.entries(STATUS_DEFS).forEach(([id, def]) => {
        if (!def.timed) return;
        const value = getStatus(target, id);
        if (value > 0) setStatus(target, id, value - 1);
    });
    if (target === player) player.confusionCosts = {};
}

function consumeEnergyStatuses(target, baseEnergy) {
    if (!target) return baseEnergy;
    const bonus = getStatus(target, "overcharge");
    const penalty = getStatus(target, "leakage");
    removeStatus(target, "overcharge");
    removeStatus(target, "leakage");
    return Math.max(0, baseEnergy + bonus - penalty);
}

function getStatusEntries(target) {
    return Object.entries(ensureStatuses(target))
        .filter(([id, value]) => STATUS_DEFS[id] && value > 0)
        .map(([id, value]) => ({ id, value, ...STATUS_DEFS[id] }));
}

// v33.1: X を実値に置き換えた、即時表示用の説明文。
function formatStatusDescription(id, value) {
    const def = STATUS_DEFS[id];
    if (!def) return "";

    const amount = Math.max(0, Number(value || 0));
    switch (id) {
        case "strength": return `攻撃ダメージを${amount}増加。`;
        case "weak": return `与える攻撃ダメージが50%減少。残り${amount}ターン。`;
        case "vulnerable": return `受ける攻撃ダメージが50%増加。残り${amount}ターン。`;
        case "regeneration": return `ターン開始時に${amount}HP回復し、その後1減少。`;
        case "ritual": return "ターン開始時に筋力を1得る。";
        case "fortress": return `ターン開始時に${amount}ブロック。HPに攻撃が通るたび1減少。`;
        case "dexterity": return `ブロック獲得量が50%増加。残り${amount}ターン。`;
        case "slowness": return `ブロック獲得量が50%減少。残り${amount}ターン。`;
        case "bleed": return `ターン終了時に${amount}ダメージを受け、その後1減少。`;
        case "confusion": return `手札のカードコストが0〜4でランダム。残り${amount}ターン。`;
        case "resistance": return `次に受けるデバフを${amount}回無効化。`;
        case "overcharge": return `次ターン開始時にエナジー+${amount}。その後解除。`;
        case "leakage": return `次ターン開始時にエナジー-${amount}。その後解除。`;
        default: return String(def.description || "").replaceAll("X", String(amount));
    }
}

function getStatusDisplayText(status) {
    if (!status) return "";
    return `${status.icon} ${status.name}${status.value ? ` ${status.value}` : ""}：${formatStatusDescription(status.id, status.value)}`;
}
