// ======================
// enemies.js
// 敵データ
// ======================

const enemies = {

    // ======================
    // 通常敵
    // ======================

    slime: {
        id: "slime",
        name: "クリスタルスライム",
        icon: "🟢",
        image: "assets/enemies/b1_crystal_slime.png",
        type: "normal",
        maxHp: 35,
        passive: {
            type: "oozeArmor",
            label: "粘液膜",
            description: "攻撃を受けるたび25%で3ブロックを得る。",
            chance: 0.25,
            block: 3
        },
        moves: [
            { type: "attack", value: 8 },
            { type: "block", value: 6 }
        ],
        moveIndex: 0
    },

    goblin: {
        id: "goblin",
        name: "ゴブリン奇襲兵",
        icon: "👺",
        image: "assets/enemies/b1_goblin_raider.png",
        type: "normal",
        maxHp: 45,
        passive: {
            type: "coward",
            label: "逃げ腰",
            description: "HP50%以下で一度だけ8ブロックを得るが、攻撃力が2下がる。",
            threshold: 0.5,
            block: 8,
            attackPenalty: 2
        },
        moves: [
            { type: "attack", value: 10 },
            { type: "attack", value: 5, applyStatus: { id: "weak", amount: 1 } }
        ],
        moveIndex: 0
    },

    orc: {
        id: "orc",
        name: "オーク戦士",
        icon: "👹",
        image: "assets/enemies/b1_orc_warrior.png",
        type: "elite",
        maxHp: 88,
        passive: {
            type: "fury",
            label: "怒号",
            description: "HP50%以下になると攻撃力が4上がる。",
            threshold: 0.5,
            attackBonus: 4
        },
        moves: [
            { type: "attack", value: 14 },
            { type: "block", value: 10 }
        ],
        moveIndex: 0
    },

    // ======================
    // エリート
    // ======================

    goblinKing: {
        id: "goblinKing",
        name: "ゴブリン戦王",
        icon: "👑",
        image: "assets/enemies/b1_goblin_warlord.png",
        type: "elite",
        maxHp: 90,
        passive: {
            type: "fury",
            label: "王の激昂",
            description: "HP50%以下になると攻撃力が5上がり、8ブロックを得る。",
            threshold: 0.5,
            attackBonus: 5,
            block: 8
        },
        moves: [
            { type: "attack", value: 15 },
            { type: "block", value: 12 },
            { type: "attack", value: 20 }
        ],
        moveIndex: 0
    },

    slimeLord: {
        id: "slimeLord",
        name: "ルーンゴーレム",
        icon: "🗿",
        image: "assets/enemies/b1_rune_golem.png",
        type: "elite",
        maxHp: 105,
        passive: {
            type: "fortify",
            label: "ルーン装甲",
            description: "HP50%以下になると一度だけ16ブロックを得る。",
            threshold: 0.5,
            block: 16
        },
        moves: [
            { type: "block", value: 14 },
            { type: "attack", value: 17 },
            { type: "attack", value: 11 }
        ],
        moveIndex: 0
    },

    berserker: {
        id: "berserker",
        name: "骸骨戦士",
        icon: "⚔️",
        image: "assets/enemies/b1_skeleton_soldier.png",
        type: "normal",
        maxHp: 52,
        passive: {
            type: "guardBreak",
            label: "崩れた防具",
            description: "HP50%以下になると一度だけ6ブロックを得る。",
            threshold: 0.5,
            block: 6
        },
        moves: [
            { type: "attack", value: 9 },
            { type: "block", value: 8 },
            { type: "attack", value: 12, applyStatus: { id: "vulnerable", amount: 1 } }
        ],
        moveIndex: 0
    },

    // ======================
    // ボス
    // special はHP条件で1度だけ発動する専用ギミック。
    // threshold: 0.5 = HP50%以下。
    // ======================

    abyssGuardian: {
        id: "abyssGuardian",
        name: "クリスタルスライムキング",
        icon: "👑",
        image: "assets/enemies/b1_crystal_slime_king.png",
        type: "boss",
        bossDepth: 1,
        maxHp: 150,
        moves: [
            { type: "attack", value: 16 },
            { type: "block", value: 14 },
            { type: "attack", value: 22 }
        ],
        special: {
            type: "enrage",
            threshold: 0.5,
            label: "結晶肥大",
            block: 18,
            attackBonus: 6,
            message: "クリスタルスライムキングの結晶が肥大した！攻撃力が上がり、18ブロックを得た。"
        },
        moveIndex: 0
    },

    ironColossus: {
        id: "ironColossus",
        name: "鉄壁の巨像",
        icon: "⚙️",
        image: "assets/enemies/b2_iron_colossus_v33.png",
        type: "boss",
        bossDepth: 2,
        maxHp: 190,
        initialStatuses: { fortress: 8 },
        moves: [
            { type: "block", value: 18 },
            { type: "attack", value: 18 },
            { type: "attack", value: 28 },
            { type: "block", value: 10 }
        ],
        special: {
            type: "fortify",
            threshold: 0.5,
            label: "要塞形態",
            block: 36,
            moves: [
                { type: "block", value: 24 },
                { type: "attack", value: 30 },
                { type: "attack", value: 18 }
            ],
            message: "巨像が要塞形態へ移行した！36ブロックを得て行動パターンが変化した。"
        },
        moveIndex: 0
    },

    crystalWitch: {
        id: "crystalWitch",
        name: "晶洞の魔女",
        icon: "🔮",
        image: "assets/enemies/b3_crystal_witch_v33.png",
        type: "boss",
        bossDepth: 3,
        maxHp: 175,
        moves: [
            { type: "attack", value: 12, applyStatus: { id: "slowness", amount: 1 } },
            { type: "block", value: 22 },
            { type: "attack", value: 20 },
            { type: "attack", value: 30 }
        ],
        special: {
            type: "curse",
            threshold: 0.5,
            label: "結晶呪詛",
            energyPenalty: 1,
            block: 12,
            moves: [
                { type: "attack", value: 18 },
                { type: "block", value: 18 },
                { type: "attack", value: 34 }
            ],
            message: "晶洞の魔女が結晶呪詛を放った！次のターンのエナジー-1。"
        },
        moveIndex: 0
    },

    voidDevourer: {
        id: "voidDevourer",
        name: "虚喰らい",
        icon: "🕳️",
        image: "assets/enemies/void_devourer.png",
        type: "boss",
        bossDepth: 4,
        maxHp: 235,
        moves: [
            { type: "attack", value: 20, applyStatus: { id: "bleed", amount: 2 } },
            { type: "attack", value: 14 },
            { type: "block", value: 26 },
            { type: "attack", value: 34 }
        ],
        special: {
            type: "devour",
            threshold: 0.5,
            label: "虚無捕食",
            heal: 28,
            stealEnergy: 1,
            moves: [
                { type: "attack", value: 24 },
                { type: "attack", value: 38 },
                { type: "block", value: 20 }
            ],
            message: "虚喰らいが周囲の力を捕食した！HPを回復し、プレイヤーのエナジーを1奪った。"
        },
        moveIndex: 0
    },

    broodSlime: {
        id: "broodSlime",
        name: "増殖の母体スライム",
        icon: "🧫",
        image: "assets/enemies/slime_king.png",
        type: "boss",
        bossDepth: 5,
        maxHp: 260,
        moves: [
            { type: "attack", value: 20 },
            { type: "block", value: 18 },
            { type: "attack", value: 26 }
        ],
        special: {
            type: "split",
            threshold: 0.5,
            label: "分裂 ×2",
            nameAfter: "分裂スライム群",
            block: 22,
            heal: 20,
            moves: [
                { type: "attack", value: 14, hits: 2 },
                { type: "block", value: 16 },
                { type: "attack", value: 10, hits: 3 }
            ],
            message: "母体スライムが分裂した！複数体による連続攻撃へ変化した。"
        },
        moveIndex: 0
    }
};
