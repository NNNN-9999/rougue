const relics = {

    // ======================
    // キャラクター固有レリック
    // ======================

    hero: {
        id: "hero",
        name: "勇者の紋章",
        icon: "⚔️",
        category: "starter",
        character: "warrior",
        description: "戦闘開始時、カードを1枚引き、闘志を1得る。"
    },

    magicBook: {
        id: "magicBook",
        name: "魔導書",
        icon: "📘",
        category: "starter",
        character: "wizard",
        description: "各戦闘で最初に使用する魔法カードのコストが1減る。"
    },

    crackedCapacitor: {
        id: "crackedCapacitor",
        name: "壊れかけの蓄電器",
        icon: "🔋",
        category: "starter",
        character: "machinist",
        description: "各戦闘で最初に使用する元コスト2以上のカードのコストが1減る。"
    },

    sootLantern: {
        id: "sootLantern",
        name: "煤けた灯籠",
        icon: "🏮",
        category: "starter",
        character: "gravekeeper",
        description: "各戦闘で初めて捨て札からカードを手札に戻したとき、エナジーを1得る。"
    },


    // ======================
    // 通常レリック
    // ======================

    hunterFeather: {
        id: "hunterFeather",
        name: "狩人の羽根",
        icon: "🪶",
        category: "normal",
        description: "戦闘開始時、エナジーを1得る。"
    },

    stoneCharm: {
        id: "stoneCharm",
        name: "石の護符",
        icon: "🪨",
        category: "normal",
        description: "戦闘開始時、5ブロックを得る。"
    },

    scoutLens: {
        id: "scoutLens",
        name: "探索者のレンズ",
        icon: "🔎",
        category: "normal",
        description: "戦闘開始時、カードを1枚追加で引く。"
    },

    healingSeed: {
        id: "healingSeed",
        name: "再生の種",
        icon: "🌱",
        category: "normal",
        description: "戦闘開始時、HPを3回復する。"
    },


    warDrum: {
        id: "warDrum",
        name: "戦太鼓",
        icon: "🥁",
        category: "normal",
        character: "warrior",
        unlockSkill: "warrior_fortress_1",
        description: "戦闘開始時、闘志を1追加で得る。"
    },

    prismShard: {
        id: "prismShard",
        name: "三色の欠片",
        icon: "🔷",
        category: "normal",
        character: "wizard",
        unlockSkill: "wizard_focus_1",
        description: "各戦闘で最初に属性連鎖が発生したとき、エナジーを1得る。"
    },

    heatSink: {
        id: "heatSink",
        name: "放熱板",
        icon: "♨️",
        category: "normal",
        character: "machinist",
        unlockSkill: "machinist_artillery_1",
        description: "カード効果で受ける自傷ダメージを2軽減する。"
    },

    spareCell: {
        id: "spareCell",
        name: "予備電池",
        icon: "🔋",
        category: "normal",
        character: "machinist",
        unlockSkill: "machinist_mastery",
        description: "2ターン目以降、ターン開始時にエナジーを1得る。"
    },

    boneRosary: {
        id: "boneRosary",
        name: "骨の数珠",
        icon: "📿",
        category: "normal",
        character: "gravekeeper",
        unlockSkill: "gravekeeper_recovery_1",
        description: "捨て札からカードを手札に戻すたび、3ブロックを得る。"
    },

    graveDust: {
        id: "graveDust",
        name: "墓土の小瓶",
        icon: "⚱️",
        category: "normal",
        character: "gravekeeper",
        unlockSkill: "gravekeeper_mastery",
        description: "戦闘開始時、捨て札に「斬る」を2枚置く。墓守の捨て札参照カードを早く強化できる。"
    },




    // ======================
    // v13 追加通常レリック
    // ======================

    sharpenedWhetstone: {
        id: "sharpenedWhetstone",
        name: "研ぎ澄まされた砥石",
        icon: "🗡️",
        category: "normal",
        description: "攻撃カードのダメージが2増える。"
    },

    ironBuckle: {
        id: "ironBuckle",
        name: "鉄の留め具",
        icon: "🛡️",
        category: "normal",
        description: "スキルカードから得るブロックが2増える。"
    },

    luckyCharm: {
        id: "luckyCharm",
        name: "幸運の護符",
        icon: "🍀",
        category: "normal",
        description: "戦闘で得るゴールドが15%増える。"
    },

    merchantSeal: {
        id: "merchantSeal",
        name: "商人の印章",
        icon: "🪙",
        category: "normal",
        description: "ショップ価格が15%安くなる。"
    },

    rageClasp: {
        id: "rageClasp",
        name: "闘志の留め金",
        icon: "🔥",
        category: "normal",
        character: "warrior",
        unlockSkill: "warrior_mastery",
        description: "闘志を消費するたび、4ブロックを得る。"
    },

    arcaneCompass: {
        id: "arcaneCompass",
        name: "秘術の羅針盤",
        icon: "🧭",
        category: "normal",
        character: "wizard",
        unlockSkill: "wizard_mastery",
        description: "各ターン最初の属性連鎖でカードを1枚引く。"
    },

    stabilizer: {
        id: "stabilizer",
        name: "安定化装置",
        icon: "⚙️",
        category: "normal",
        character: "machinist",
        unlockSkill: "machinist_generator_bridge",
        description: "次ターンのエナジー減少を1軽減する。"
    },

    funeralBell: {
        id: "funeralBell",
        name: "葬送の鐘",
        icon: "🔔",
        category: "normal",
        character: "gravekeeper",
        unlockSkill: "gravekeeper_recovery_bridge",
        description: "戦闘開始時、山札から2枚を捨て札へ送る。"
    },


    // ======================
    // v16 追加通常レリック
    // プレイ中の判断やコンボを変えるタイプを中心に追加。
    // ======================

    quickQuill: {
        id: "quickQuill",
        name: "速記の羽根",
        icon: "🪶",
        category: "normal",
        description: "各ターン最初に0コストのカードを使ったとき、カードを1枚引く。"
    },

    lastEmber: {
        id: "lastEmber",
        name: "残火の瓶",
        icon: "🏺",
        category: "normal",
        description: "エナジー0でターンを終了すると、次のターンのエナジー+1。"
    },

    echoRing: {
        id: "echoRing",
        name: "三拍子の指輪",
        icon: "💍",
        category: "normal",
        description: "各ターン3枚目に使うカードのコストが1減る。"
    },

    bloodAmber: {
        id: "bloodAmber",
        name: "血珀",
        icon: "🩸",
        category: "normal",
        description: "HPが50%以下のとき、攻撃カードのダメージ+3。"
    },

    guardianCoin: {
        id: "guardianCoin",
        name: "守護の古銭",
        icon: "🪙",
        category: "normal",
        description: "各戦闘で最初に攻撃カードを使ったとき、5ブロックを得る。"
    },

    thornMail: {
        id: "thornMail",
        name: "棘鉄の欠片",
        icon: "🌵",
        category: "normal",
        description: "敵の攻撃でHPダメージを受けるたび、敵に2ダメージを返す。"
    },

    comboCharm: {
        id: "comboCharm",
        name: "連撃の護符",
        icon: "🔗",
        category: "normal",
        description: "スキルカードの直後に使う攻撃カードのダメージ+4。"
    },

    eliteCompass: {
        id: "eliteCompass",
        name: "危険探知の羅針盤",
        icon: "🧭",
        category: "normal",
        description: "エリートからレリックが落ちる確率が10%上がる。"
    },

    glassBead: {
        id: "glassBead",
        name: "ひび割れた玻璃玉",
        icon: "🔮",
        category: "normal",
        description: "各戦闘で初めてHPが50%以下になったとき、カードを2枚引く。"
    },

    bloodBanner: {
        id: "bloodBanner",
        name: "血染めの軍旗",
        icon: "🚩",
        category: "normal",
        character: "warrior",
        unlockSkill: "warrior_combo_bridge",
        description: "HP50%以下のとき、攻撃カードから得る闘志がさらに1増える。"
    },

    twinSigil: {
        id: "twinSigil",
        name: "双生の魔印",
        icon: "♊",
        category: "normal",
        character: "wizard",
        unlockSkill: "wizard_focus_bridge",
        description: "直前と同じ属性のカードを使うと4ブロックを得る。"
    },

    recyclerCore: {
        id: "recyclerCore",
        name: "再循環コア",
        icon: "♻️",
        category: "normal",
        character: "machinist",
        unlockSkill: "machinist_generator_cap",
        description: "エナジー減少をカード効果で解除したとき、カードを1枚引く。"
    },

    ossuaryKey: {
        id: "ossuaryKey",
        name: "納骨堂の鍵",
        icon: "🗝️",
        category: "normal",
        character: "gravekeeper",
        unlockSkill: "gravekeeper_discard_cap",
        description: "ターン開始時に捨て札が8枚以上なら、エナジーを1得る。"
    },



    // ======================
    // v22 スキルツリー追加レリック
    // ======================

    duelistRibbon: {
        id: "duelistRibbon",
        name: "決闘者の飾紐",
        icon: "🎗️",
        category: "normal",
        character: "warrior",
        unlockSkill: "warrior_combo_2",
        description: "各ターン最初の攻撃カードのダメージが3増える。"
    },

    rageReservoir: {
        id: "rageReservoir",
        name: "闘志の壺",
        icon: "🏺",
        category: "normal",
        character: "warrior",
        unlockSkill: "warrior_berserk_cap",
        description: "戦闘開始時、闘志を1得る。"
    },

    guardedPommel: {
        id: "guardedPommel",
        name: "守りの柄頭",
        icon: "🗡️",
        category: "normal",
        character: "warrior",
        unlockSkill: "warrior_fortress_cap",
        description: "各ターン最初の攻撃カードを使うと4ブロックを得る。"
    },

    emberLens: {
        id: "emberLens",
        name: "残照のレンズ",
        icon: "🔥",
        category: "normal",
        character: "wizard",
        unlockSkill: "wizard_overflow_3",
        description: "火属性の攻撃カードのダメージが3増える。"
    },

    frostBead: {
        id: "frostBead",
        name: "霜晶の数珠",
        icon: "❄️",
        category: "normal",
        character: "wizard",
        unlockSkill: "wizard_chain_cap",
        description: "氷属性のスキルカードから得るブロックが4増える。"
    },

    stormCoil: {
        id: "stormCoil",
        name: "雷鳴のコイル",
        icon: "⚡",
        category: "normal",
        character: "wizard",
        unlockSkill: "wizard_focus_cap",
        description: "各ターン最初の雷属性カードを使うとカードを1枚引く。"
    },

    heavySpring: {
        id: "heavySpring",
        name: "重圧ばね",
        icon: "🌀",
        category: "normal",
        character: "machinist",
        unlockSkill: "machinist_artillery_4",
        description: "元コスト2以上の攻撃カードのダメージが4増える。"
    },

    recoilPlate: {
        id: "recoilPlate",
        name: "反動装甲",
        icon: "🛡️",
        category: "normal",
        character: "machinist",
        unlockSkill: "machinist_stable_cap",
        description: "次ターンのエナジー減少が発生したとき、5ブロックを得る。"
    },

    graveMarker: {
        id: "graveMarker",
        name: "墓標の欠片",
        icon: "🪦",
        category: "normal",
        character: "gravekeeper",
        unlockSkill: "gravekeeper_funeral_4",
        description: "捨て札が6枚以上なら、攻撃カードのダメージが4増える。"
    },

    ferrymanCoin: {
        id: "ferrymanCoin",
        name: "渡し守の硬貨",
        icon: "🪙",
        category: "normal",
        character: "gravekeeper",
        unlockSkill: "gravekeeper_recovery_cap",
        description: "各ターン最初に捨て札からカードを回収したとき、カードを1枚引く。"
    },

    // ======================
    // v31 レリック再編
    // ボスレリックは「最大エナジー+1」を中心に、
    // 戦闘やデッキ構築へ影響する明確な代償を持つ。
    // ======================

    // 旧ボスレリックから通常レリックへ移動。
    echoCrystal: {
        id: "echoCrystal",
        name: "反響する結晶",
        icon: "💠",
        category: "normal",
        description: "戦闘開始時、カードを1枚追加で引く。"
    },

    guardianShell: {
        id: "guardianShell",
        name: "守護者の殻",
        icon: "🐚",
        category: "normal",
        description: "戦闘開始時、8ブロックを得る。"
    },

    cursedHourglass: {
        id: "cursedHourglass",
        name: "呪われた砂時計",
        icon: "⌛",
        category: "normal",
        description: "毎ターン、カードを1枚追加で引く。"
    },

    gildedMask: {
        id: "gildedMask",
        name: "黄金の仮面",
        icon: "🎭",
        category: "normal",
        description: "戦闘で得るゴールドが25%増える。"
    },

    forbiddenTome: {
        id: "forbiddenTome",
        name: "禁忌の書",
        icon: "📕",
        category: "normal",
        description: "各ターン最初に使うスキルカードのコストを1減らす。"
    },

    // ======================
    // v33 強力な通常レリック
    // ======================

    eliteDoubleDrop: {
        id: "eliteDoubleDrop",
        name: "双頭の戦利品章",
        icon: "🎖️",
        category: "normal",
        description: "エリート撃破時、20%の確率で通常レリックを追加でもう1個獲得する。"
    },

    phoenixPlume: {
        id: "phoenixPlume",
        name: "不死鳥の羽根",
        icon: "🪶",
        category: "normal",
        description: "1ランに1回、HPが0になったとき最大HPの50%で復活する。"
    },

    warSigil: {
        id: "warSigil",
        name: "戦神の刻印",
        icon: "💪",
        category: "normal",
        description: "戦闘開始時、筋力2を得る。"
    },

    fortressHeart: {
        id: "fortressHeart",
        name: "城塞の心臓",
        icon: "🏰",
        category: "normal",
        description: "戦闘開始時、鉄壁4を得る。"
    },

    wardCharm: {
        id: "wardCharm",
        name: "白銀の護符",
        icon: "🛡️",
        category: "normal",
        description: "戦闘開始時、耐性1を得る。"
    },

    livingMoss: {
        id: "livingMoss",
        name: "脈動する苔",
        icon: "🌿",
        category: "normal",
        description: "戦闘開始時、再生3を得る。"
    },

    // ======================
    // ボスレリック
    // ======================

    abyssCore: {
        id: "abyssCore",
        name: "深淵の核",
        icon: "🕳️",
        category: "boss",
        benefit: "最大エナジーが1増える。",
        drawback: "休憩所で回復できなくなる。",
        description: "最大エナジー+1。ただし休憩所で回復できない。"
    },

    deepHeart: {
        id: "deepHeart",
        name: "深層の心臓",
        icon: "❤️",
        category: "boss",
        benefit: "最大エナジーが1増える。",
        drawback: "最大HPが18減る。",
        description: "最大エナジー+1。ただし最大HP-18。"
    },

    endlessSpark: {
        id: "endlessSpark",
        name: "尽きない火花",
        icon: "✨",
        category: "boss",
        benefit: "最大エナジーが1増える。",
        drawback: "各戦闘の最初の手札に『過熱』が1枚加わる。",
        description: "最大エナジー+1。各戦闘の最初の手札にデバフカード『過熱』を1枚追加する。",
        grantedCardId: "overheatStatus",
        grantedCardContext: "各戦闘の最初の手札に1枚加わる"
    },

    cursedCore: {
        id: "cursedCore",
        name: "呪蝕の炉心",
        icon: "🩸",
        category: "boss",
        benefit: "最大エナジーが1増える。",
        drawback: "獲得時、呪いカード『灼けた欠片』を1枚デッキに加える。",
        description: "最大エナジー+1。獲得時に呪いカードを1枚だけ追加する。呪いカード自体の所持枚数に上限はない。",
        grantedCardId: "burningShardCurse",
        grantedCardContext: "獲得時にデッキへ1枚追加"
    },

    sealedPurseCore: {
        id: "sealedPurseCore",
        name: "封金の導体",
        icon: "🔒",
        category: "boss",
        benefit: "最大エナジーが1増える。",
        drawback: "以降、新しくゴールドを獲得できない。所持中のゴールドは使える。",
        description: "最大エナジー+1。以降ゴールド獲得不可。現在の所持金は失わない。"
    },

    crimsonCrown: {
        id: "crimsonCrown",
        name: "紅蓮の王冠",
        icon: "👑",
        category: "boss",
        benefit: "攻撃カードのダメージが4増える。",
        drawback: "攻撃カードを使うたびにHPを2失う。",
        description: "攻撃カードのダメージ+4。ただし攻撃カード使用時にHPを2失う。"
    }

};
