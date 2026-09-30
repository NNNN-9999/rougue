// ======================
// skills.js v22
// スキルツリー = ラン中の選択肢を増やすアンロック専用システム
// 恒久ステータス強化は行わない。
// ======================

const skillTrees = {

    warrior: {
        name: "戦士",
        icon: "⚔️",
        theme: "3本のルートを進み、各段階で別々の二択を選ぶ。",
        startNode: "warrior_start",

        layout: {
            warrior_start:          { x: 50, y: 7 },

            warrior_berserk_1:      { x: 18, y: 23 },
            warrior_unlock_1:       { x: 10, y: 42 },
            warrior_berserk_alt:    { x: 26, y: 42 },
            warrior_unlock_2:       { x: 10, y: 78 },
            warrior_berserk_cap:    { x: 26, y: 78 },

            warrior_fortress_1:     { x: 50, y: 23 },
            warrior_mastery:        { x: 42, y: 42 },
            warrior_fortress_alt:   { x: 58, y: 42 },
            warrior_unlock_3:       { x: 42, y: 78 },
            warrior_fortress_cap:   { x: 58, y: 78 },

            warrior_combo_1:        { x: 82, y: 23 },
            warrior_combo_2:        { x: 74, y: 42 },
            warrior_combo_alt:      { x: 90, y: 42 },
            warrior_combo_bridge:   { x: 74, y: 78 },
            warrior_legend:         { x: 90, y: 78 }
        },

        junctions: {
            warrior_berserk_j1:  { x: 18, y: 58 },
            warrior_fortress_j1: { x: 50, y: 58 },
            warrior_combo_j1:    { x: 82, y: 58 }
        },

        edges: [
            ["warrior_start", "warrior_berserk_1"],
            ["warrior_start", "warrior_fortress_1"],
            ["warrior_start", "warrior_combo_1"],

            ["warrior_berserk_1", "warrior_unlock_1"],
            ["warrior_berserk_1", "warrior_berserk_alt"],
            ["warrior_unlock_1", "warrior_berserk_j1"],
            ["warrior_berserk_alt", "warrior_berserk_j1"],
            ["warrior_berserk_j1", "warrior_unlock_2"],
            ["warrior_berserk_j1", "warrior_berserk_cap"],

            ["warrior_fortress_1", "warrior_mastery"],
            ["warrior_fortress_1", "warrior_fortress_alt"],
            ["warrior_mastery", "warrior_fortress_j1"],
            ["warrior_fortress_alt", "warrior_fortress_j1"],
            ["warrior_fortress_j1", "warrior_unlock_3"],
            ["warrior_fortress_j1", "warrior_fortress_cap"],

            ["warrior_combo_1", "warrior_combo_2"],
            ["warrior_combo_1", "warrior_combo_alt"],
            ["warrior_combo_2", "warrior_combo_j1"],
            ["warrior_combo_alt", "warrior_combo_j1"],
            ["warrior_combo_j1", "warrior_combo_bridge"],
            ["warrior_combo_j1", "warrior_legend"]
        ]
    },

    wizard: {
        name: "魔法使い",
        icon: "🔮",
        theme: "連鎖・安定・高出力。前の二択に縛られず次の二択を選べる。",
        startNode: "wizard_start",

        layout: {
            wizard_start:          { x: 50, y: 7 },

            wizard_chain_1:        { x: 18, y: 23 },
            wizard_unlock_1:       { x: 10, y: 42 },
            wizard_chain_alt:      { x: 26, y: 42 },
            wizard_unlock_3:       { x: 10, y: 78 },
            wizard_chain_cap:      { x: 26, y: 78 },

            wizard_focus_1:        { x: 50, y: 23 },
            wizard_unlock_2:       { x: 42, y: 42 },
            wizard_focus_alt:      { x: 58, y: 42 },
            wizard_focus_bridge:   { x: 42, y: 78 },
            wizard_focus_cap:      { x: 58, y: 78 },

            wizard_overflow_1:     { x: 82, y: 23 },
            wizard_mastery:        { x: 74, y: 42 },
            wizard_overflow_alt:   { x: 90, y: 42 },
            wizard_overflow_3:     { x: 74, y: 78 },
            wizard_legend:         { x: 90, y: 78 }
        },

        junctions: {
            wizard_chain_j1:    { x: 18, y: 58 },
            wizard_focus_j1:    { x: 50, y: 58 },
            wizard_overflow_j1: { x: 82, y: 58 }
        },

        edges: [
            ["wizard_start", "wizard_chain_1"],
            ["wizard_start", "wizard_focus_1"],
            ["wizard_start", "wizard_overflow_1"],

            ["wizard_chain_1", "wizard_unlock_1"],
            ["wizard_chain_1", "wizard_chain_alt"],
            ["wizard_unlock_1", "wizard_chain_j1"],
            ["wizard_chain_alt", "wizard_chain_j1"],
            ["wizard_chain_j1", "wizard_unlock_3"],
            ["wizard_chain_j1", "wizard_chain_cap"],

            ["wizard_focus_1", "wizard_unlock_2"],
            ["wizard_focus_1", "wizard_focus_alt"],
            ["wizard_unlock_2", "wizard_focus_j1"],
            ["wizard_focus_alt", "wizard_focus_j1"],
            ["wizard_focus_j1", "wizard_focus_bridge"],
            ["wizard_focus_j1", "wizard_focus_cap"],

            ["wizard_overflow_1", "wizard_mastery"],
            ["wizard_overflow_1", "wizard_overflow_alt"],
            ["wizard_mastery", "wizard_overflow_j1"],
            ["wizard_overflow_alt", "wizard_overflow_j1"],
            ["wizard_overflow_j1", "wizard_overflow_3"],
            ["wizard_overflow_j1", "wizard_legend"]
        ]
    },

    machinist: {
        name: "機工士",
        icon: "⚙️",
        theme: "発電・兵装・制御。それぞれの段階で独立した二択を行う。",
        startNode: "machinist_start",

        layout: {
            machinist_start:             { x: 50, y: 7 },

            machinist_generator_1:       { x: 18, y: 23 },
            machinist_mastery:           { x: 10, y: 42 },
            machinist_generator_alt:     { x: 26, y: 42 },
            machinist_generator_bridge:  { x: 10, y: 78 },
            machinist_generator_cap:     { x: 26, y: 78 },

            machinist_artillery_1:       { x: 50, y: 23 },
            machinist_unlock_1:          { x: 42, y: 42 },
            machinist_artillery_alt:     { x: 58, y: 42 },
            machinist_artillery_4:       { x: 42, y: 78 },
            machinist_legend:            { x: 58, y: 78 },

            machinist_stable_1:          { x: 82, y: 23 },
            machinist_unlock_2:          { x: 74, y: 42 },
            machinist_stable_alt:        { x: 90, y: 42 },
            machinist_unlock_3:          { x: 74, y: 78 },
            machinist_stable_cap:        { x: 90, y: 78 }
        },

        junctions: {
            machinist_generator_j1: { x: 18, y: 58 },
            machinist_artillery_j1: { x: 50, y: 58 },
            machinist_stable_j1:    { x: 82, y: 58 }
        },

        edges: [
            ["machinist_start", "machinist_generator_1"],
            ["machinist_start", "machinist_artillery_1"],
            ["machinist_start", "machinist_stable_1"],

            ["machinist_generator_1", "machinist_mastery"],
            ["machinist_generator_1", "machinist_generator_alt"],
            ["machinist_mastery", "machinist_generator_j1"],
            ["machinist_generator_alt", "machinist_generator_j1"],
            ["machinist_generator_j1", "machinist_generator_bridge"],
            ["machinist_generator_j1", "machinist_generator_cap"],

            ["machinist_artillery_1", "machinist_unlock_1"],
            ["machinist_artillery_1", "machinist_artillery_alt"],
            ["machinist_unlock_1", "machinist_artillery_j1"],
            ["machinist_artillery_alt", "machinist_artillery_j1"],
            ["machinist_artillery_j1", "machinist_artillery_4"],
            ["machinist_artillery_j1", "machinist_legend"],

            ["machinist_stable_1", "machinist_unlock_2"],
            ["machinist_stable_1", "machinist_stable_alt"],
            ["machinist_unlock_2", "machinist_stable_j1"],
            ["machinist_stable_alt", "machinist_stable_j1"],
            ["machinist_stable_j1", "machinist_unlock_3"],
            ["machinist_stable_j1", "machinist_stable_cap"]
        ]
    },

    gravekeeper: {
        name: "墓守",
        icon: "🪦",
        theme: "墓地・回収・葬送。各段階で方針を切り替えながら伸ばせる。",
        startNode: "gravekeeper_start",

        layout: {
            gravekeeper_start:            { x: 50, y: 7 },

            gravekeeper_discard_1:        { x: 18, y: 23 },
            gravekeeper_unlock_1:         { x: 10, y: 42 },
            gravekeeper_discard_alt:      { x: 26, y: 42 },
            gravekeeper_unlock_3:         { x: 10, y: 78 },
            gravekeeper_discard_cap:      { x: 26, y: 78 },

            gravekeeper_recovery_1:       { x: 50, y: 23 },
            gravekeeper_unlock_2:         { x: 42, y: 42 },
            gravekeeper_recovery_alt:     { x: 58, y: 42 },
            gravekeeper_recovery_bridge:  { x: 42, y: 78 },
            gravekeeper_recovery_cap:     { x: 58, y: 78 },

            gravekeeper_funeral_1:        { x: 82, y: 23 },
            gravekeeper_mastery:          { x: 74, y: 42 },
            gravekeeper_funeral_alt:      { x: 90, y: 42 },
            gravekeeper_funeral_4:        { x: 74, y: 78 },
            gravekeeper_legend:           { x: 90, y: 78 }
        },

        junctions: {
            gravekeeper_discard_j1:  { x: 18, y: 58 },
            gravekeeper_recovery_j1: { x: 50, y: 58 },
            gravekeeper_funeral_j1:  { x: 82, y: 58 }
        },

        edges: [
            ["gravekeeper_start", "gravekeeper_discard_1"],
            ["gravekeeper_start", "gravekeeper_recovery_1"],
            ["gravekeeper_start", "gravekeeper_funeral_1"],

            ["gravekeeper_discard_1", "gravekeeper_unlock_1"],
            ["gravekeeper_discard_1", "gravekeeper_discard_alt"],
            ["gravekeeper_unlock_1", "gravekeeper_discard_j1"],
            ["gravekeeper_discard_alt", "gravekeeper_discard_j1"],
            ["gravekeeper_discard_j1", "gravekeeper_unlock_3"],
            ["gravekeeper_discard_j1", "gravekeeper_discard_cap"],

            ["gravekeeper_recovery_1", "gravekeeper_unlock_2"],
            ["gravekeeper_recovery_1", "gravekeeper_recovery_alt"],
            ["gravekeeper_unlock_2", "gravekeeper_recovery_j1"],
            ["gravekeeper_recovery_alt", "gravekeeper_recovery_j1"],
            ["gravekeeper_recovery_j1", "gravekeeper_recovery_bridge"],
            ["gravekeeper_recovery_j1", "gravekeeper_recovery_cap"],

            ["gravekeeper_funeral_1", "gravekeeper_mastery"],
            ["gravekeeper_funeral_1", "gravekeeper_funeral_alt"],
            ["gravekeeper_mastery", "gravekeeper_funeral_j1"],
            ["gravekeeper_funeral_alt", "gravekeeper_funeral_j1"],
            ["gravekeeper_funeral_j1", "gravekeeper_funeral_4"],
            ["gravekeeper_funeral_j1", "gravekeeper_legend"]
        ]
    }
};


const skillTree = {

    // ======================================================
    // START
    // 最初から解放済み。恒久強化は一切なし。
    // ======================================================

    warrior_start: {
        id: "warrior_start",
        character: "warrior",
        type: "start",
        icon: "⚔️",
        name: "戦士の系譜",
        description: "戦士の追加カード・レリックを解放できるようになる。",
        cost: 0,
        requires: [],
        unlockCards: [],
        unlockRelics: [],
        effect: {}
    },

    wizard_start: {
        id: "wizard_start",
        character: "wizard",
        type: "start",
        icon: "🔮",
        name: "魔導の系譜",
        description: "魔法使いの追加カード・レリックを解放できるようになる。",
        cost: 0,
        requires: [],
        unlockCards: [],
        unlockRelics: [],
        effect: {}
    },

    machinist_start: {
        id: "machinist_start",
        character: "machinist",
        type: "start",
        icon: "⚙️",
        name: "機工の系譜",
        description: "機工士の追加カード・レリックを解放できるようになる。",
        cost: 0,
        requires: [],
        unlockCards: [],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_start: {
        id: "gravekeeper_start",
        character: "gravekeeper",
        type: "start",
        icon: "🪦",
        name: "墓守の系譜",
        description: "墓守の追加カード・レリックを解放できるようになる。",
        cost: 0,
        requires: [],
        unlockCards: [],
        unlockRelics: [],
        effect: {}
    },


    // ======================================================
    // 戦士
    // ======================================================

    warrior_berserk_1: {
        id: "warrior_berserk_1",
        character: "warrior",
        type: "card",
        icon: "🔥",
        name: "決死の一閃",
        description: "カード『決死の一閃』が報酬・ショップに出現するようになる。",
        cost: 4,
        requires: ["warrior_start"],
        unlockCards: ["warriorLastCharge"],
        unlockRelics: [],
        effect: {}
    },

    warrior_fortress_1: {
        id: "warrior_fortress_1",
        character: "warrior",
        type: "relic",
        icon: "🥁",
        name: "戦太鼓",
        description: "レリック『戦太鼓』がエリート報酬・ショップ・イベントに出現するようになる。",
        cost: 4,
        requires: ["warrior_start"],
        unlockCards: [],
        unlockRelics: ["warDrum"],
        effect: {}
    },

    warrior_combo_1: {
        id: "warrior_combo_1",
        character: "warrior",
        type: "card",
        icon: "🗡️",
        name: "鋼のテンポ",
        description: "カード『鋼のテンポ』が報酬・ショップに出現するようになる。",
        cost: 4,
        requires: ["warrior_start"],
        unlockCards: ["warriorIronTempo"],
        unlockRelics: [],
        effect: {}
    },

    warrior_unlock_1: {
        id: "warrior_unlock_1",
        character: "warrior",
        type: "card",
        icon: "⚔️",
        name: "覇王の連撃",
        description: "EPICカード『覇王の連撃』がカードプールに追加される。",
        cost: 6,
        requires: ["warrior_berserk_1"],
        choiceGroup: "warrior_berserk_choice_1",
        unlockCards: ["warriorOverlordCombo"],
        unlockRelics: [],
        effect: {}
    },

    warrior_mastery: {
        id: "warrior_mastery",
        character: "warrior",
        type: "relic",
        icon: "🔥",
        name: "闘志の留め金",
        description: "レリック『闘志の留め金』がレリックプールに追加される。",
        cost: 6,
        requires: ["warrior_fortress_1"],
        choiceGroup: "warrior_fortress_choice_1",
        unlockCards: [],
        unlockRelics: ["rageClasp"],
        effect: {}
    },

    warrior_combo_2: {
        id: "warrior_combo_2",
        character: "warrior",
        type: "relic",
        icon: "🎗️",
        name: "決闘者の飾紐",
        description: "新レリック『決闘者の飾紐』がレリックプールに追加される。",
        cost: 6,
        requires: ["warrior_combo_1"],
        choiceGroup: "warrior_combo_choice_1",
        unlockCards: [],
        unlockRelics: ["duelistRibbon"],
        effect: {}
    },

    warrior_unlock_2: {
        id: "warrior_unlock_2",
        character: "warrior",
        type: "card",
        icon: "📜",
        name: "血戦の誓い",
        description: "EPICカード『血戦の誓い』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["warrior_unlock_1", "warrior_berserk_alt"],
        choiceGroup: "warrior_berserk_choice_2",
        unlockCards: ["warriorBloodOath"],
        unlockRelics: [],
        effect: {}
    },

    warrior_unlock_3: {
        id: "warrior_unlock_3",
        character: "warrior",
        type: "card",
        icon: "🛡️",
        name: "王者の構え",
        description: "RAREカード『王者の構え』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["warrior_mastery", "warrior_fortress_alt"],
        choiceGroup: "warrior_fortress_choice_2",
        unlockCards: ["warriorKingsStance"],
        unlockRelics: [],
        effect: {}
    },

    warrior_combo_bridge: {
        id: "warrior_combo_bridge",
        character: "warrior",
        type: "relic",
        icon: "🚩",
        name: "血染めの軍旗",
        description: "レリック『血染めの軍旗』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["warrior_combo_2", "warrior_combo_alt"],
        choiceGroup: "warrior_combo_choice_2",
        unlockCards: [],
        unlockRelics: ["bloodBanner"],
        effect: {}
    },

    warrior_berserk_cap: {
        id: "warrior_berserk_cap",
        character: "warrior",
        type: "relic",
        icon: "🏺",
        name: "闘志の壺",
        description: "新レリック『闘志の壺』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["warrior_unlock_1", "warrior_berserk_alt"],
        choiceGroup: "warrior_berserk_choice_2",
        unlockCards: [],
        unlockRelics: ["rageReservoir"],
        effect: {}
    },

    warrior_fortress_cap: {
        id: "warrior_fortress_cap",
        character: "warrior",
        type: "relic",
        icon: "🗡️",
        name: "守りの柄頭",
        description: "新レリック『守りの柄頭』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["warrior_mastery", "warrior_fortress_alt"],
        choiceGroup: "warrior_fortress_choice_2",
        unlockCards: [],
        unlockRelics: ["guardedPommel"],
        effect: {}
    },

    warrior_legend: {
        id: "warrior_legend",
        character: "warrior",
        type: "card",
        icon: "🌟",
        name: "戦神降臨",
        description: "LEGENDARYカード『戦神降臨』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["warrior_combo_2", "warrior_combo_alt"],
        choiceGroup: "warrior_combo_choice_2",
        unlockCards: ["warriorWarGod"],
        unlockRelics: [],
        effect: {}
    },


    // ======================================================
    // 魔法使い
    // ======================================================

    wizard_chain_1: {
        id: "wizard_chain_1",
        character: "wizard",
        type: "card",
        icon: "⚡",
        name: "禁呪・瞬光",
        description: "カード『禁呪・瞬光』が報酬・ショップに出現するようになる。",
        cost: 4,
        requires: ["wizard_start"],
        unlockCards: ["wizardForbiddenFlash"],
        unlockRelics: [],
        effect: {}
    },

    wizard_focus_1: {
        id: "wizard_focus_1",
        character: "wizard",
        type: "relic",
        icon: "🔷",
        name: "三色の欠片",
        description: "レリック『三色の欠片』がレリックプールに追加される。",
        cost: 4,
        requires: ["wizard_start"],
        unlockCards: [],
        unlockRelics: ["prismShard"],
        effect: {}
    },

    wizard_overflow_1: {
        id: "wizard_overflow_1",
        character: "wizard",
        type: "card",
        icon: "🧊",
        name: "元素保管庫",
        description: "カード『元素保管庫』が報酬・ショップに出現するようになる。",
        cost: 4,
        requires: ["wizard_start"],
        unlockCards: ["wizardElementVault"],
        unlockRelics: [],
        effect: {}
    },

    wizard_unlock_1: {
        id: "wizard_unlock_1",
        character: "wizard",
        type: "card",
        icon: "🔥",
        name: "三相崩壊",
        description: "EPICカード『三相崩壊』がカードプールに追加される。",
        cost: 6,
        requires: ["wizard_chain_1"],
        choiceGroup: "wizard_chain_choice_1",
        unlockCards: ["wizardTriadNova"],
        unlockRelics: [],
        effect: {}
    },

    wizard_unlock_2: {
        id: "wizard_unlock_2",
        character: "wizard",
        type: "card",
        icon: "❄️",
        name: "絶対零度",
        description: "EPICカード『絶対零度』がカードプールに追加される。",
        cost: 6,
        requires: ["wizard_focus_1"],
        choiceGroup: "wizard_focus_choice_1",
        unlockCards: ["wizardAbsoluteZero"],
        unlockRelics: [],
        effect: {}
    },

    wizard_mastery: {
        id: "wizard_mastery",
        character: "wizard",
        type: "relic",
        icon: "🧭",
        name: "秘術の羅針盤",
        description: "レリック『秘術の羅針盤』がレリックプールに追加される。",
        cost: 6,
        requires: ["wizard_overflow_1"],
        choiceGroup: "wizard_overflow_choice_1",
        unlockCards: [],
        unlockRelics: ["arcaneCompass"],
        effect: {}
    },

    wizard_unlock_3: {
        id: "wizard_unlock_3",
        character: "wizard",
        type: "card",
        icon: "🌊",
        name: "魔力奔流",
        description: "RAREカード『魔力奔流』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["wizard_unlock_1", "wizard_chain_alt"],
        choiceGroup: "wizard_chain_choice_2",
        unlockCards: ["wizardManaTorrent"],
        unlockRelics: [],
        effect: {}
    },

    wizard_focus_bridge: {
        id: "wizard_focus_bridge",
        character: "wizard",
        type: "relic",
        icon: "♊",
        name: "双生の魔印",
        description: "レリック『双生の魔印』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["wizard_unlock_2", "wizard_focus_alt"],
        choiceGroup: "wizard_focus_choice_2",
        unlockCards: [],
        unlockRelics: ["twinSigil"],
        effect: {}
    },

    wizard_overflow_3: {
        id: "wizard_overflow_3",
        character: "wizard",
        type: "relic",
        icon: "🔥",
        name: "残照のレンズ",
        description: "新レリック『残照のレンズ』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["wizard_mastery", "wizard_overflow_alt"],
        choiceGroup: "wizard_overflow_choice_2",
        unlockCards: [],
        unlockRelics: ["emberLens"],
        effect: {}
    },

    wizard_chain_cap: {
        id: "wizard_chain_cap",
        character: "wizard",
        type: "relic",
        icon: "❄️",
        name: "霜晶の数珠",
        description: "新レリック『霜晶の数珠』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["wizard_unlock_1", "wizard_chain_alt"],
        choiceGroup: "wizard_chain_choice_2",
        unlockCards: [],
        unlockRelics: ["frostBead"],
        effect: {}
    },

    wizard_focus_cap: {
        id: "wizard_focus_cap",
        character: "wizard",
        type: "relic",
        icon: "⚡",
        name: "雷鳴のコイル",
        description: "新レリック『雷鳴のコイル』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["wizard_unlock_2", "wizard_focus_alt"],
        choiceGroup: "wizard_focus_choice_2",
        unlockCards: [],
        unlockRelics: ["stormCoil"],
        effect: {}
    },

    wizard_legend: {
        id: "wizard_legend",
        character: "wizard",
        type: "card",
        icon: "🌌",
        name: "星界収束",
        description: "LEGENDARYカード『星界収束』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["wizard_mastery", "wizard_overflow_alt"],
        choiceGroup: "wizard_overflow_choice_2",
        unlockCards: ["wizardAstralConvergence"],
        unlockRelics: [],
        effect: {}
    },


    // ======================================================
    // 機工士
    // ======================================================

    machinist_generator_1: {
        id: "machinist_generator_1",
        character: "machinist",
        type: "card",
        icon: "🔋",
        name: "緊急炉心解放",
        description: "カード『緊急炉心解放』が報酬・ショップに出現するようになる。",
        cost: 4,
        requires: ["machinist_start"],
        unlockCards: ["machinistCoreRelease"],
        unlockRelics: [],
        effect: {}
    },

    machinist_artillery_1: {
        id: "machinist_artillery_1",
        character: "machinist",
        type: "relic",
        icon: "♨️",
        name: "放熱板",
        description: "レリック『放熱板』がレリックプールに追加される。",
        cost: 4,
        requires: ["machinist_start"],
        unlockCards: [],
        unlockRelics: ["heatSink"],
        effect: {}
    },

    machinist_stable_1: {
        id: "machinist_stable_1",
        character: "machinist",
        type: "card",
        icon: "🧲",
        name: "磁気制動",
        description: "カード『磁気制動』が報酬・ショップに出現するようになる。",
        cost: 4,
        requires: ["machinist_start"],
        unlockCards: ["machinistMagneticBrake"],
        unlockRelics: [],
        effect: {}
    },

    machinist_mastery: {
        id: "machinist_mastery",
        character: "machinist",
        type: "relic",
        icon: "🔋",
        name: "予備電池",
        description: "レリック『予備電池』がレリックプールに追加される。",
        cost: 6,
        requires: ["machinist_generator_1"],
        choiceGroup: "machinist_generator_choice_1",
        unlockCards: [],
        unlockRelics: ["spareCell"],
        effect: {}
    },

    machinist_unlock_1: {
        id: "machinist_unlock_1",
        character: "machinist",
        type: "card",
        icon: "🚄",
        name: "超電磁砲",
        description: "EPICカード『超電磁砲』がカードプールに追加される。",
        cost: 6,
        requires: ["machinist_artillery_1"],
        choiceGroup: "machinist_artillery_choice_1",
        unlockCards: ["machinistRailgun"],
        unlockRelics: [],
        effect: {}
    },

    machinist_unlock_2: {
        id: "machinist_unlock_2",
        character: "machinist",
        type: "card",
        icon: "🕸️",
        name: "緊急電力網",
        description: "EPICカード『緊急電力網』がカードプールに追加される。",
        cost: 6,
        requires: ["machinist_stable_1"],
        choiceGroup: "machinist_stable_choice_1",
        unlockCards: ["machinistEmergencyGrid"],
        unlockRelics: [],
        effect: {}
    },

    machinist_generator_bridge: {
        id: "machinist_generator_bridge",
        character: "machinist",
        type: "relic",
        icon: "⚙️",
        name: "安定化装置",
        description: "レリック『安定化装置』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["machinist_mastery", "machinist_generator_alt"],
        choiceGroup: "machinist_generator_choice_2",
        unlockCards: [],
        unlockRelics: ["stabilizer"],
        effect: {}
    },

    machinist_artillery_4: {
        id: "machinist_artillery_4",
        character: "machinist",
        type: "relic",
        icon: "🌀",
        name: "重圧ばね",
        description: "新レリック『重圧ばね』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["machinist_unlock_1", "machinist_artillery_alt"],
        choiceGroup: "machinist_artillery_choice_2",
        unlockCards: [],
        unlockRelics: ["heavySpring"],
        effect: {}
    },

    machinist_unlock_3: {
        id: "machinist_unlock_3",
        character: "machinist",
        type: "card",
        icon: "🔁",
        name: "過負荷変換",
        description: "RAREカード『過負荷変換』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["machinist_unlock_2", "machinist_stable_alt"],
        choiceGroup: "machinist_stable_choice_2",
        unlockCards: ["machinistOverloadConverter"],
        unlockRelics: [],
        effect: {}
    },

    machinist_generator_cap: {
        id: "machinist_generator_cap",
        character: "machinist",
        type: "relic",
        icon: "♻️",
        name: "再循環コア",
        description: "レリック『再循環コア』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["machinist_mastery", "machinist_generator_alt"],
        choiceGroup: "machinist_generator_choice_2",
        unlockCards: [],
        unlockRelics: ["recyclerCore"],
        effect: {}
    },

    machinist_legend: {
        id: "machinist_legend",
        character: "machinist",
        type: "card",
        icon: "☢️",
        name: "終端兵装",
        description: "LEGENDARYカード『終端兵装』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["machinist_unlock_1", "machinist_artillery_alt"],
        choiceGroup: "machinist_artillery_choice_2",
        unlockCards: ["machinistFinalArmament"],
        unlockRelics: [],
        effect: {}
    },

    machinist_stable_cap: {
        id: "machinist_stable_cap",
        character: "machinist",
        type: "relic",
        icon: "🛡️",
        name: "反動装甲",
        description: "新レリック『反動装甲』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["machinist_unlock_2", "machinist_stable_alt"],
        choiceGroup: "machinist_stable_choice_2",
        unlockCards: [],
        unlockRelics: ["recoilPlate"],
        effect: {}
    },


    // ======================================================
    // 墓守
    // ======================================================

    gravekeeper_discard_1: {
        id: "gravekeeper_discard_1",
        character: "gravekeeper",
        type: "card",
        icon: "🔥",
        name: "死者への手向け",
        description: "カード『死者への手向け』が報酬・ショップに出現するようになる。",
        cost: 4,
        requires: ["gravekeeper_start"],
        unlockCards: ["gravekeeperOffering"],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_recovery_1: {
        id: "gravekeeper_recovery_1",
        character: "gravekeeper",
        type: "relic",
        icon: "📿",
        name: "骨の数珠",
        description: "レリック『骨の数珠』がレリックプールに追加される。",
        cost: 4,
        requires: ["gravekeeper_start"],
        unlockCards: [],
        unlockRelics: ["boneRosary"],
        effect: {}
    },

    gravekeeper_funeral_1: {
        id: "gravekeeper_funeral_1",
        character: "gravekeeper",
        type: "card",
        icon: "🕯️",
        name: "最後の祈り",
        description: "カード『最後の祈り』が報酬・ショップに出現するようになる。",
        cost: 4,
        requires: ["gravekeeper_start"],
        unlockCards: ["gravekeeperLastRites"],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_unlock_1: {
        id: "gravekeeper_unlock_1",
        character: "gravekeeper",
        type: "card",
        icon: "🏛️",
        name: "納骨堂",
        description: "EPICカード『納骨堂』がカードプールに追加される。",
        cost: 6,
        requires: ["gravekeeper_discard_1"],
        choiceGroup: "gravekeeper_discard_choice_1",
        unlockCards: ["gravekeeperOssuary"],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_unlock_2: {
        id: "gravekeeper_unlock_2",
        character: "gravekeeper",
        type: "card",
        icon: "🎵",
        name: "鎮魂歌",
        description: "EPICカード『鎮魂歌』がカードプールに追加される。",
        cost: 6,
        requires: ["gravekeeper_recovery_1"],
        choiceGroup: "gravekeeper_recovery_choice_1",
        unlockCards: ["gravekeeperRequiem"],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_mastery: {
        id: "gravekeeper_mastery",
        character: "gravekeeper",
        type: "relic",
        icon: "⚱️",
        name: "墓土の小瓶",
        description: "レリック『墓土の小瓶』がレリックプールに追加される。",
        cost: 6,
        requires: ["gravekeeper_funeral_1"],
        choiceGroup: "gravekeeper_funeral_choice_1",
        unlockCards: [],
        unlockRelics: ["graveDust"],
        effect: {}
    },

    gravekeeper_unlock_3: {
        id: "gravekeeper_unlock_3",
        character: "gravekeeper",
        type: "card",
        icon: "🚶",
        name: "死者の行進",
        description: "RAREカード『死者の行進』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["gravekeeper_unlock_1", "gravekeeper_discard_alt"],
        choiceGroup: "gravekeeper_discard_choice_2",
        unlockCards: ["gravekeeperMarch"],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_recovery_bridge: {
        id: "gravekeeper_recovery_bridge",
        character: "gravekeeper",
        type: "relic",
        icon: "🔔",
        name: "葬送の鐘",
        description: "レリック『葬送の鐘』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["gravekeeper_unlock_2", "gravekeeper_recovery_alt"],
        choiceGroup: "gravekeeper_recovery_choice_2",
        unlockCards: [],
        unlockRelics: ["funeralBell"],
        effect: {}
    },

    gravekeeper_funeral_4: {
        id: "gravekeeper_funeral_4",
        character: "gravekeeper",
        type: "relic",
        icon: "🪦",
        name: "墓標の欠片",
        description: "新レリック『墓標の欠片』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["gravekeeper_mastery", "gravekeeper_funeral_alt"],
        choiceGroup: "gravekeeper_funeral_choice_2",
        unlockCards: [],
        unlockRelics: ["graveMarker"],
        effect: {}
    },

    gravekeeper_discard_cap: {
        id: "gravekeeper_discard_cap",
        character: "gravekeeper",
        type: "relic",
        icon: "🗝️",
        name: "納骨堂の鍵",
        description: "レリック『納骨堂の鍵』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["gravekeeper_unlock_1", "gravekeeper_discard_alt"],
        choiceGroup: "gravekeeper_discard_choice_2",
        unlockCards: [],
        unlockRelics: ["ossuaryKey"],
        effect: {}
    },

    gravekeeper_recovery_cap: {
        id: "gravekeeper_recovery_cap",
        character: "gravekeeper",
        type: "relic",
        icon: "🪙",
        name: "渡し守の硬貨",
        description: "新レリック『渡し守の硬貨』がレリックプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["gravekeeper_unlock_2", "gravekeeper_recovery_alt"],
        choiceGroup: "gravekeeper_recovery_choice_2",
        unlockCards: [],
        unlockRelics: ["ferrymanCoin"],
        effect: {}
    },

    gravekeeper_legend: {
        id: "gravekeeper_legend",
        character: "gravekeeper",
        type: "card",
        icon: "🚪",
        name: "冥府の門",
        description: "LEGENDARYカード『冥府の門』がカードプールに追加される。",
        cost: 10,
        requires: [],
        requiresAny: ["gravekeeper_mastery", "gravekeeper_funeral_alt"],
        choiceGroup: "gravekeeper_funeral_choice_2",
        unlockCards: ["gravekeeperUnderworldGate"],
        unlockRelics: [],
        effect: {}
    },

    // ======================================================
    // v23 - 第一段階の追加二択ノード
    // ======================================================

    warrior_berserk_alt: {
        id: "warrior_berserk_alt",
        character: "warrior",
        type: "card",
        icon: "📣",
        name: "鬨の声",
        description: "カード『鬨の声』がカードプールに追加される。",
        cost: 6,
        requires: ["warrior_berserk_1"],
        choiceGroup: "warrior_berserk_choice_1",
        unlockCards: ["warriorBattleCry"],
        unlockRelics: [],
        effect: {}
    },

    warrior_fortress_alt: {
        id: "warrior_fortress_alt",
        character: "warrior",
        type: "card",
        icon: "🧱",
        name: "迎撃防御",
        description: "カード『迎撃防御』がカードプールに追加される。",
        cost: 6,
        requires: ["warrior_fortress_1"],
        choiceGroup: "warrior_fortress_choice_1",
        unlockCards: ["warriorCounterGuard"],
        unlockRelics: [],
        effect: {}
    },

    warrior_combo_alt: {
        id: "warrior_combo_alt",
        character: "warrior",
        type: "card",
        icon: "🪶",
        name: "フェイント",
        description: "カード『フェイント』がカードプールに追加される。",
        cost: 6,
        requires: ["warrior_combo_1"],
        choiceGroup: "warrior_combo_choice_1",
        unlockCards: ["warriorFeint"],
        unlockRelics: [],
        effect: {}
    },

    wizard_chain_alt: {
        id: "wizard_chain_alt",
        character: "wizard",
        type: "card",
        icon: "⚡",
        name: "瞬雷",
        description: "カード『瞬雷』がカードプールに追加される。",
        cost: 6,
        requires: ["wizard_chain_1"],
        choiceGroup: "wizard_chain_choice_1",
        unlockCards: ["wizardQuickSpark"],
        unlockRelics: [],
        effect: {}
    },

    wizard_focus_alt: {
        id: "wizard_focus_alt",
        character: "wizard",
        type: "card",
        icon: "🪞",
        name: "氷鏡",
        description: "カード『氷鏡』がカードプールに追加される。",
        cost: 6,
        requires: ["wizard_focus_1"],
        choiceGroup: "wizard_focus_choice_1",
        unlockCards: ["wizardFrostMirror"],
        unlockRelics: [],
        effect: {}
    },

    wizard_overflow_alt: {
        id: "wizard_overflow_alt",
        character: "wizard",
        type: "card",
        icon: "🔥",
        name: "余炎蓄積",
        description: "カード『余炎蓄積』がカードプールに追加される。",
        cost: 6,
        requires: ["wizard_overflow_1"],
        choiceGroup: "wizard_overflow_choice_1",
        unlockCards: ["wizardEmberReserve"],
        unlockRelics: [],
        effect: {}
    },

    machinist_generator_alt: {
        id: "machinist_generator_alt",
        character: "machinist",
        type: "card",
        icon: "🔌",
        name: "予備セル放出",
        description: "カード『予備セル放出』がカードプールに追加される。",
        cost: 6,
        requires: ["machinist_generator_1"],
        choiceGroup: "machinist_generator_choice_1",
        unlockCards: ["machinistReserveCell"],
        unlockRelics: [],
        effect: {}
    },

    machinist_artillery_alt: {
        id: "machinist_artillery_alt",
        character: "machinist",
        type: "card",
        icon: "💥",
        name: "突発砲撃",
        description: "カード『突発砲撃』がカードプールに追加される。",
        cost: 6,
        requires: ["machinist_artillery_1"],
        choiceGroup: "machinist_artillery_choice_1",
        unlockCards: ["machinistBurstCannon"],
        unlockRelics: [],
        effect: {}
    },

    machinist_stable_alt: {
        id: "machinist_stable_alt",
        character: "machinist",
        type: "card",
        icon: "🧯",
        name: "衝撃吸収",
        description: "カード『衝撃吸収』がカードプールに追加される。",
        cost: 6,
        requires: ["machinist_stable_1"],
        choiceGroup: "machinist_stable_choice_1",
        unlockCards: ["machinistShockAbsorber"],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_discard_alt: {
        id: "gravekeeper_discard_alt",
        character: "gravekeeper",
        type: "card",
        icon: "⛏️",
        name: "墓掘り",
        description: "カード『墓掘り』がカードプールに追加される。",
        cost: 6,
        requires: ["gravekeeper_discard_1"],
        choiceGroup: "gravekeeper_discard_choice_1",
        unlockCards: ["gravekeeperGraveDig"],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_recovery_alt: {
        id: "gravekeeper_recovery_alt",
        character: "gravekeeper",
        type: "card",
        icon: "🦴",
        name: "骨の呼び戻し",
        description: "カード『骨の呼び戻し』がカードプールに追加される。",
        cost: 6,
        requires: ["gravekeeper_recovery_1"],
        choiceGroup: "gravekeeper_recovery_choice_1",
        unlockCards: ["gravekeeperBoneRecall"],
        unlockRelics: [],
        effect: {}
    },

    gravekeeper_funeral_alt: {
        id: "gravekeeper_funeral_alt",
        character: "gravekeeper",
        type: "card",
        icon: "🪦",
        name: "墓標の盾",
        description: "カード『墓標の盾』がカードプールに追加される。",
        cost: 6,
        requires: ["gravekeeper_funeral_1"],
        choiceGroup: "gravekeeper_funeral_choice_1",
        unlockCards: ["gravekeeperGraveShield"],
        unlockRelics: [],
        effect: {}
    }

};

// ==========================================================
// v29 - 5ツリー化 / RULE・SYSTEMノード
// ==========================================================

skillTrees.common = {
    name: "全体",
    icon: "🌐",
    theme: "探索・強化・報酬など、ゲーム全体の選択肢を広げる。",
    startNode: "common_start",
    layout: {
        common_start:          { x: 50, y: 7 },
        common_explore_1:      { x: 18, y: 28 },
        common_forge_event:    { x: 10, y: 52 },
        common_event_sense:    { x: 26, y: 52 },
        common_explore_cap:    { x: 18, y: 82 },
        common_upgrade_1:      { x: 50, y: 28 },
        common_rest_choice:    { x: 42, y: 52 },
        common_reward_upgrade: { x: 58, y: 52 },
        common_upgrade_cap:    { x: 50, y: 82 },
        common_trade_1:        { x: 82, y: 28 },
        common_shop_upgrade:   { x: 74, y: 52 },
        common_reward_choice:  { x: 90, y: 52 },
        common_trade_cap:      { x: 82, y: 82 },
        common_potion_combat:  { x: 38, y: 95 },
        common_potion_arcane:  { x: 62, y: 95 }
    },
    junctions: {},
    edges: [
        ["common_start", "common_explore_1"],
        ["common_start", "common_upgrade_1"],
        ["common_start", "common_trade_1"],
        ["common_explore_1", "common_forge_event"],
        ["common_explore_1", "common_event_sense"],
        ["common_forge_event", "common_explore_cap"],
        ["common_event_sense", "common_explore_cap"],
        ["common_upgrade_1", "common_rest_choice"],
        ["common_upgrade_1", "common_reward_upgrade"],
        ["common_rest_choice", "common_upgrade_cap"],
        ["common_reward_upgrade", "common_upgrade_cap"],
        ["common_trade_1", "common_shop_upgrade"],
        ["common_trade_1", "common_reward_choice"],
        ["common_shop_upgrade", "common_trade_cap"],
        ["common_reward_choice", "common_trade_cap"],
        ["common_upgrade_cap", "common_potion_combat"],
        ["common_trade_cap", "common_potion_arcane"]
    ]
};

// キャラツリー最深部に「ルール変化」ノードを追加。
const v29RuleNodesByTree = {
    warrior: [
        ["warrior_rule_rage", 18, ["warrior_unlock_2", "warrior_berserk_cap"]],
        ["warrior_rule_guard", 50, ["warrior_unlock_3", "warrior_fortress_cap"]],
        ["warrior_rule_combo", 82, ["warrior_combo_bridge", "warrior_legend"]]
    ],
    wizard: [
        ["wizard_rule_chain", 18, ["wizard_unlock_3", "wizard_chain_cap"]],
        ["wizard_rule_repeat", 50, ["wizard_focus_bridge", "wizard_focus_cap"]],
        ["wizard_rule_highcost", 82, ["wizard_overflow_3", "wizard_legend"]]
    ],
    machinist: [
        ["machinist_rule_generator", 18, ["machinist_generator_bridge", "machinist_generator_cap"]],
        ["machinist_rule_artillery", 50, ["machinist_artillery_4", "machinist_legend"]],
        ["machinist_rule_stable", 82, ["machinist_unlock_3", "machinist_stable_cap"]]
    ],
    gravekeeper: [
        ["gravekeeper_rule_discard", 18, ["gravekeeper_unlock_3", "gravekeeper_discard_cap"]],
        ["gravekeeper_rule_recovery", 50, ["gravekeeper_recovery_bridge", "gravekeeper_recovery_cap"]],
        ["gravekeeper_rule_funeral", 82, ["gravekeeper_funeral_4", "gravekeeper_legend"]]
    ]
};

Object.entries(v29RuleNodesByTree).forEach(([characterId, entries]) => {
    entries.forEach(([nodeId, x, parents]) => {
        skillTrees[characterId].layout[nodeId] = { x, y: 91 };
        parents.forEach(parentId => skillTrees[characterId].edges.push([parentId, nodeId]));
    });
});

Object.assign(skillTree, {
    common_start: {
        id: "common_start", character: "common", type: "start", icon: "🌐",
        name: "探索者の基盤", description: "全キャラクターで共有するシステム拡張ツリー。", cost: 0,
        requires: [], unlockCards: [], unlockRelics: [], effect: {}
    },
    common_explore_1: {
        id: "common_explore_1", character: "common", type: "system", icon: "🧭",
        name: "探索知識", description: "探索系の追加要素へ進めるようになる。", cost: 3,
        requires: ["common_start"], unlockCards: [], unlockRelics: [], effect: {}
    },
    common_forge_event: {
        id: "common_forge_event", character: "common", type: "system", icon: "⚒️",
        name: "眠れる鍛冶場", description: "イベント『眠れる鍛冶場』を解禁。スラッシュとガードをすべて強化できる。", cost: 5,
        requires: ["common_explore_1"], unlockCards: [], unlockRelics: [], effect: { unlockEvent: "sleepingForge" }
    },
    common_event_sense: {
        id: "common_event_sense", character: "common", type: "system", icon: "🕯️",
        name: "寄り道の勘", description: "イベント『印のついた補給箱』を解禁。35Gを獲得するか、HPを12回復するかを選べる。", cost: 5,
        requires: ["common_explore_1"], unlockCards: [], unlockRelics: [], effect: { eventSense: true }
    },
    common_explore_cap: {
        id: "common_explore_cap", character: "common", type: "system", icon: "🗺️",
        name: "深層探索術", description: "レアイベント「古代の整備台」を解禁する。", cost: 8,
        requiresAny: ["common_forge_event", "common_event_sense"], requires: [], unlockCards: [], unlockRelics: [], effect: { rareEvents: true }
    },
    common_upgrade_1: {
        id: "common_upgrade_1", character: "common", type: "system", icon: "⬆️",
        name: "強化の心得", description: "カード強化に関する拡張へ進めるようになる。", cost: 3,
        requires: ["common_start"], unlockCards: [], unlockRelics: [], effect: {}
    },
    common_rest_choice: {
        id: "common_rest_choice", character: "common", type: "system", icon: "🔥",
        name: "研ぎ直し", description: "休憩所に「軽整備」を追加。HPを6回復し、ランダムな未強化カード1枚を強化できる。", cost: 5,
        requires: ["common_upgrade_1"], unlockCards: [], unlockRelics: [], effect: { restMastery: true }
    },
    common_reward_upgrade: {
        id: "common_reward_upgrade", character: "common", type: "system", icon: "✨",
        name: "磨かれた戦利品", description: "通常のカード報酬が低確率で強化済みカードになる。", cost: 5,
        requires: ["common_upgrade_1"], unlockCards: [], unlockRelics: [], effect: { upgradedRewards: true }
    },
    common_upgrade_cap: {
        id: "common_upgrade_cap", character: "common", type: "system", icon: "🔨",
        name: "熟練の手入れ", description: "強化済みカードが通常報酬に出る確率を15%から30%へ上げ、ショップでも低確率で強化済みカードが混ざるようになる。", cost: 8,
        requiresAny: ["common_rest_choice", "common_reward_upgrade"], requires: [], unlockCards: [], unlockRelics: [], effect: { upgradeMastery: true }
    },
    common_trade_1: {
        id: "common_trade_1", character: "common", type: "system", icon: "🪙",
        name: "取引知識", description: "ショップ・報酬系の追加要素へ進めるようになる。", cost: 3,
        requires: ["common_start"], unlockCards: [], unlockRelics: [], effect: {}
    },
    common_shop_upgrade: {
        id: "common_shop_upgrade", character: "common", type: "system", icon: "🛒",
        name: "品揃え拡張", description: "ショップのカード商品枠が3枚から4枚になる。", cost: 5,
        requires: ["common_trade_1"], unlockCards: [], unlockRelics: [], effect: { shopExpansion: true }
    },
    common_reward_choice: {
        id: "common_reward_choice", character: "common", type: "system", icon: "🎁",
        name: "選別眼", description: "通常戦のカード報酬候補が1枚増える。", cost: 5,
        requires: ["common_trade_1"], unlockCards: [], unlockRelics: [], effect: { rewardSense: true }
    },
    common_trade_cap: {
        id: "common_trade_cap", character: "common", type: "system", icon: "💎",
        name: "特選仕入れ", description: "ショップを訪れるたび、カード商品のうち強化可能な1枚が必ず強化済みになる。", cost: 8,
        requiresAny: ["common_shop_upgrade", "common_reward_choice"], requires: [], unlockCards: [], unlockRelics: [], effect: { premiumStock: true }
    },

    common_potion_combat: {
        id: "common_potion_combat", character: "common", type: "potion", icon: "🧪",
        name: "戦闘薬学", description: "新しい戦闘用ポーション3種を解禁する。ショップや戦闘後のポーション報酬に出現するようになる。", cost: 9,
        requires: ["common_upgrade_cap"], unlockCards: [], unlockRelics: [],
        unlockPotions: ["dexterityPotion", "overchargePotion", "fireBomb"], effect: {}
    },
    common_potion_arcane: {
        id: "common_potion_arcane", character: "common", type: "potion", icon: "⚗️",
        name: "秘薬研究", description: "特殊なポーション3種を解禁する。ショップや戦闘後のポーション報酬に出現するようになる。", cost: 9,
        requires: ["common_trade_cap"], unlockCards: [], unlockRelics: [],
        unlockPotions: ["ritualPotion", "cleansePotion", "chaosTonic"], effect: {}
    },

    warrior_rule_rage: {
        id: "warrior_rule_rage", character: "warrior", type: "rule", icon: "🔥",
        name: "闘志循環", description: "闘志を消費して攻撃した時、その攻撃のダメージ+3。", cost: 12,
        requires: [], requiresAny: ["warrior_unlock_2", "warrior_berserk_cap"], unlockCards: [], unlockRelics: [], effect: { rageSpendAttackBonus: 3 }
    },
    warrior_rule_guard: {
        id: "warrior_rule_guard", character: "warrior", type: "rule", icon: "🛡️",
        name: "攻防一体", description: "攻撃カードを使うたび1ブロックを得る。", cost: 12,
        requires: [], requiresAny: ["warrior_unlock_3", "warrior_fortress_cap"], unlockCards: [], unlockRelics: [], effect: { attackCardBlock: 1 }
    },
    warrior_rule_combo: {
        id: "warrior_rule_combo", character: "warrior", type: "rule", icon: "🃏",
        name: "連撃の呼吸", description: "各ターン4枚目のカード使用時、カードを1枚引く。", cost: 12,
        requires: [], requiresAny: ["warrior_combo_bridge", "warrior_legend"], unlockCards: [], unlockRelics: [], effect: { fourthCardDraw: 1 }
    },

    wizard_rule_chain: {
        id: "wizard_rule_chain", character: "wizard", type: "rule", icon: "🔗",
        name: "連鎖励起", description: "各ターン最初の属性連鎖でエナジーを1得る。", cost: 12,
        requires: [], requiresAny: ["wizard_unlock_3", "wizard_chain_cap"], unlockCards: [], unlockRelics: [], effect: { firstChainEnergy: 1 }
    },
    wizard_rule_repeat: {
        id: "wizard_rule_repeat", character: "wizard", type: "rule", icon: "♻️",
        name: "同調魔術", description: "同じ属性を連続使用した時、各ターン最初の1回だけカードを1枚引く。", cost: 12,
        requires: [], requiresAny: ["wizard_focus_bridge", "wizard_focus_cap"], unlockCards: [], unlockRelics: [], effect: { sameElementFirstDraw: 1 }
    },
    wizard_rule_highcost: {
        id: "wizard_rule_highcost", character: "wizard", type: "rule", icon: "🌠",
        name: "高位詠唱", description: "コスト2以上の魔法攻撃のダメージ+3。", cost: 12,
        requires: [], requiresAny: ["wizard_overflow_3", "wizard_legend"], unlockCards: [], unlockRelics: [], effect: { highCostMagicAttackBonus: 3 }
    },

    machinist_rule_generator: {
        id: "machinist_rule_generator", character: "machinist", type: "rule", icon: "🔋",
        name: "過給回路", description: "各ターン最初にカード効果でエナジーを得る時、さらに+1。", cost: 12,
        requires: [], requiresAny: ["machinist_generator_bridge", "machinist_generator_cap"], unlockCards: [], unlockRelics: [], effect: { firstEnergyGainBonus: 1 }
    },
    machinist_rule_artillery: {
        id: "machinist_rule_artillery", character: "machinist", type: "rule", icon: "💥",
        name: "反動装甲", description: "次ターンエナジー減少を抱えた時、その値1につき2ブロックを得る。", cost: 12,
        requires: [], requiresAny: ["machinist_artillery_4", "machinist_legend"], unlockCards: [], unlockRelics: [], effect: { penaltyToBlock: 2 }
    },
    machinist_rule_stable: {
        id: "machinist_rule_stable", character: "machinist", type: "rule", icon: "⚙️",
        name: "安定化制御", description: "次ターンのエナジー減少を1軽減する。", cost: 12,
        requires: [], requiresAny: ["machinist_unlock_3", "machinist_stable_cap"], unlockCards: [], unlockRelics: [], effect: { energyPenaltyReduction: 1 }
    },

    gravekeeper_rule_discard: {
        id: "gravekeeper_rule_discard", character: "gravekeeper", type: "rule", icon: "🪦",
        name: "墓地の蓄え", description: "ターン終了時に捨て札が10枚以上なら、次ターンのエナジー+1。", cost: 12,
        requires: [], requiresAny: ["gravekeeper_unlock_3", "gravekeeper_discard_cap"], unlockCards: [], unlockRelics: [], effect: { discardTurnEnergy: 1 }
    },
    gravekeeper_rule_recovery: {
        id: "gravekeeper_rule_recovery", character: "gravekeeper", type: "rule", icon: "🦴",
        name: "骨拾い", description: "捨て札からカードを回収するたび2ブロックを得る。", cost: 12,
        requires: [], requiresAny: ["gravekeeper_recovery_bridge", "gravekeeper_recovery_cap"], unlockCards: [], unlockRelics: [], effect: { recoveredCardBlock: 2 }
    },
    gravekeeper_rule_funeral: {
        id: "gravekeeper_rule_funeral", character: "gravekeeper", type: "rule", icon: "🕯️",
        name: "二度目の弔い", description: "各ターン2枚目の回収時、カードを1枚引く。", cost: 12,
        requires: [], requiresAny: ["gravekeeper_funeral_4", "gravekeeper_legend"], unlockCards: [], unlockRelics: [], effect: { secondRecoveryDraw: 1 }
    }
});
