const potions = {
    healingPotion: { id:"healingPotion", name:"回復薬", icon:"❤️", description:"HPを15回復する。", mapUsable:true, effect:{ heal:15 } },
    strengthPotion: { id:"strengthPotion", name:"筋力の薬", icon:"💪", description:"筋力3を得る。", battleOnly:true, effect:{ status:"strength", amount:3 } },
    regenerationPotion: { id:"regenerationPotion", name:"再生薬", icon:"🌿", description:"再生4を得る。", battleOnly:true, effect:{ status:"regeneration", amount:4 } },
    ritualPotion: { id:"ritualPotion", unlockSkill:"common_potion_arcane", name:"儀式の霊薬", icon:"🕯️", description:"儀式を得る。毎ターン開始時に筋力+1。", battleOnly:true, effect:{ status:"ritual", amount:1 } },
    resistancePotion: { id:"resistancePotion", name:"耐性薬", icon:"🛡️", description:"耐性2を得る。", battleOnly:true, effect:{ status:"resistance", amount:2 } },
    dexterityPotion: { id:"dexterityPotion", unlockSkill:"common_potion_combat", name:"敏捷の薬", icon:"🪽", description:"敏捷3を得る。", battleOnly:true, effect:{ status:"dexterity", amount:3 } },
    overchargePotion: { id:"overchargePotion", unlockSkill:"common_potion_combat", name:"過充電液", icon:"⚡", description:"過充電2を得る。次ターンのエナジー+2。", battleOnly:true, effect:{ status:"overcharge", amount:2 } },
    cleansePotion: { id:"cleansePotion", unlockSkill:"common_potion_arcane", name:"浄化薬", icon:"✨", description:"自分のデバフをすべて解除する。", battleOnly:true, effect:{ cleanse:true } },
    fireBomb: { id:"fireBomb", unlockSkill:"common_potion_combat", name:"火炎瓶", icon:"🔥", description:"敵に15ダメージを与える。", battleOnly:true, effect:{ damage:15 } },
    chaosTonic: { id:"chaosTonic", unlockSkill:"common_potion_arcane", name:"混沌薬", icon:"🌀", description:"筋力4を得る代わりに混乱2を得る。", battleOnly:true, effect:{ status:"strength", amount:4, selfStatus:"confusion", selfAmount:2 } }
};

function isPotionUnlocked(potion) {
    if (!potion) return false;
    if (!potion.unlockSkill) return true;
    return typeof isSkillUnlockedForCharacter !== "function" ||
        isSkillUnlockedForCharacter(potion.unlockSkill, "common");
}

function getUnlockedPotionIds() {
    return Object.values(potions).filter(isPotionUnlocked).map(p => p.id);
}

function ensurePotionSlots() {
    if (!player) return [];
    if (!Array.isArray(player.potions)) player.potions = [];
    while (player.potions.length < 3) player.potions.push(null);
    if (player.potions.length > 3) player.potions.length = 3;
    return player.potions;
}

function addPotion(potionId) {
    if (!potions[potionId] || !player) return false;
    const slots = ensurePotionSlots();
    const index = slots.findIndex(v => !v);
    if (index < 0) return false;
    slots[index] = potionId;
    if (typeof renderPotionBelt === "function") renderPotionBelt();
    if (typeof saveRunState === "function") saveRunState();
    return true;
}

function usePotionSlot(index) {
    if (!player) return;
    const slots = ensurePotionSlots();
    const id = slots[index];
    const potion = potions[id];
    if (!potion) return;
    const inBattle = typeof Scene !== "undefined" && Scene.current === "battle" && enemy && !battleEnded;
    if (potion.battleOnly && !inBattle) return;
    if (!inBattle && !potion.mapUsable) return;

    const effect = potion.effect || {};
    if (effect.heal && typeof healPlayer === "function") healPlayer(effect.heal);
    if (effect.status && inBattle && typeof addStatus === "function") addStatus(player, effect.status, effect.amount || 1, { ignoreResistance:true });
    if (effect.selfStatus && inBattle && typeof addStatus === "function") addStatus(player, effect.selfStatus, effect.selfAmount || 1, { ignoreResistance:true });
    if (effect.cleanse && inBattle && typeof cleanseDebuffs === "function") cleanseDebuffs(player);
    if (effect.damage && inBattle && enemy) {
        if (typeof dealDamage === "function") dealDamage(enemy, effect.damage);
        if (typeof checkBattleEnd === "function") checkBattleEnd();
    }

    slots[index] = null;
    if (typeof updatePlayerUI === "function") updatePlayerUI();
    if (typeof updateEnemyUI === "function") updateEnemyUI();
    if (typeof renderPotionBelt === "function") renderPotionBelt();
    if (typeof saveRunState === "function") saveRunState();
}

function renderPotionBelt() {
    const belt = document.getElementById("potion-belt");
    if (!belt) return;
    if (!player) { belt.classList.add("hidden"); return; }
    belt.classList.remove("hidden");
    const slots = ensurePotionSlots();
    const inBattle = typeof Scene !== "undefined" && Scene.current === "battle" && enemy && !battleEnded;
    belt.innerHTML = slots.map((id, index) => {
        const potion = id ? potions[id] : null;
        if (!potion) return `<button class="potion-slot empty" type="button" disabled title="空きポーション枠">＋</button>`;
        const usable = inBattle || potion.mapUsable;
        return `<button class="potion-slot${usable ? "" : " disabled"}" type="button" data-potion-slot="${index}" title="${potion.name}：${potion.description}"><span>${potion.icon}</span></button>`;
    }).join("");
    belt.querySelectorAll("[data-potion-slot]").forEach(btn => btn.addEventListener("click", () => usePotionSlot(Number(btn.dataset.potionSlot))));
}
