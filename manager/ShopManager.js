// ======================
// ShopManager.js
// ショップ管理
// ======================

let shopCards = [];
let shopRelics = [];
let shopPotions = [];
let activeShopNodeId = null;

function shopShuffle(list) {
    const result = [...list];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function showShop() {
    changeScene("map");

    const shopNodeId = currentMapNode?.id || null;

    // 同じショップ内でカード削除画面などを行き来しても
    // 商品が勝手に再抽選されないようにする。
    if (activeShopNodeId !== shopNodeId) {
        activeShopNodeId = shopNodeId;
        createShopItems();
    }

    renderShop();
}

function createShopItems() {
    const cardList = getCardPoolForCharacter(selectedCharacter);

    // v29.1: 序盤ノードは「商品枠+1」だけに抑え、
    // 強化済み商品の確定出現は最深部へ移動。
    const expandedStockUnlocked =
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_shop_upgrade", "common");

    const premiumStockUnlocked =
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_trade_cap", "common");

    const upgradeMasteryUnlocked =
        typeof isSkillUnlockedForCharacter === "function" &&
        isSkillUnlockedForCharacter("common_upgrade_cap", "common");

    const shopCardCount = expandedStockUnlocked ? 4 : 3;

    const selectedCards = shopShuffle(cardList)
        .slice(0, shopCardCount);

    // 強化系ツリー最深部を取っている場合のみ、
    // 各商品に控えめな確率で追加の強化品が混ざる。
    let stockCards = selectedCards.map(card => {
        if (!upgradeMasteryUnlocked || Math.random() >= 0.15) {
            return card;
        }

        const upgradedId = typeof getUpgradedCardId === "function"
            ? getUpgradedCardId(card.id)
            : null;

        return upgradedId && cards[upgradedId]
            ? cards[upgradedId]
            : card;
    });

    // 取引ルート最深部：強化可能な商品から1枚だけ確定強化。
    // 「ショップ全強化」にはしない。
    if (premiumStockUnlocked) {
        const candidates = stockCards
            .map((card, index) => {
                const baseId = card.baseCardId || card.id;
                const upgradedId = typeof getUpgradedCardId === "function"
                    ? getUpgradedCardId(baseId)
                    : null;

                return upgradedId && cards[upgradedId]
                    ? { index, upgradedId }
                    : null;
            })
            .filter(Boolean);

        if (candidates.length > 0) {
            const chosen = candidates[
                Math.floor(Math.random() * candidates.length)
            ];

            stockCards[chosen.index] = cards[chosen.upgradedId];
        }
    }

    shopCards = stockCards.map(stockCard => ({
        cardId: stockCard.id,
        price: getShopCardPrice(stockCard)
    }));

    const ownedRelics = new Set(player?.relics || []);

    const relicList = Object.values(relics)
        .filter(relic =>
            relic.category === "normal" &&
            !ownedRelics.has(relic.id) &&
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

    shopRelics = shopShuffle(relicList)
        .slice(0, 2)
        .map(relic => ({
            relicId: relic.id,
            price: getShopRelicPrice(relic)
        }));

    shopPotions = typeof potions !== "undefined"
        ? shopShuffle(Object.values(potions).filter(p => typeof isPotionUnlocked !== "function" || isPotionUnlocked(p))).slice(0, 2).map(potion => ({ potionId: potion.id, price: 45 }))
        : [];
}

function getShopPriceMultiplier() {
    const ownedRelics =
        Array.isArray(player?.relics)
            ? player.relics
            : [];

    let multiplier = 1;

    // 商人の印章：ショップ価格-15%
    if (ownedRelics.includes("merchantSeal")) {
        multiplier *= 0.85;
    }

    return multiplier;
}

function getShopCardPrice(card) {
    let basePrice;

    switch (card.rarity) {
        case "common":
            basePrice = 50;
            break;
        case "uncommon":
            basePrice = 75;
            break;
        case "rare":
            basePrice = 100;
            break;
        case "epic":
            basePrice = 125;
            break;
        case "legendary":
            basePrice = 150;
            break;
        default:
            basePrice = 75;
            break;
    }

    return Math.ceil(basePrice * getShopPriceMultiplier());
}

function getShopRelicPrice(relic) {
    // キャラクター専用レリックは少し高め。
    const basePrice = relic.character ? 185 : 150;
    return Math.ceil(basePrice * getShopPriceMultiplier());
}

function getRemoveCardPrice() {
    return Math.ceil(75 * getShopPriceMultiplier());
}

function renderShop() {
    const mapArea = document.getElementById("map-area");

    if (!mapArea) {
        console.error("map-areaが見つかりません");
        return;
    }

    const removePrice = getRemoveCardPrice();

    mapArea.innerHTML = `
        <div class="shop shop-compact-layout">

            <div class="shop-topbar">
                <div class="shop-heading">
                    <h2>🛒 ショップ</h2>

                    <p class="shop-gold">
                        💰 所持金：
                        <strong><span id="shop-gold">${player.gold}</span>G</strong>
                    </p>
                </div>

                <div class="shop-actions shop-actions-top">
                    <button id="remove-card-button" class="shop-remove-button">
                        🗑️ カード削除　${removePrice}G
                    </button>

                    <button id="shop-leave-button" class="secondary-button">
                        マップへ戻る
                    </button>
                </div>
            </div>

            <div class="shop-inventory-grid">

                <section class="shop-section shop-card-section">
                    <div class="shop-section-title">
                        <h3>🃏 カード</h3>
                        <span>3枠</span>
                    </div>

                    <div id="shop-cards" class="shop-cards"></div>
                </section>

                <section class="shop-section shop-relic-section">
                    <div class="shop-section-title">
                        <h3>💎 レリック</h3>
                        <span>2枠</span>
                    </div>

                    <div id="shop-relics" class="shop-relics"></div>
                </section>

                <section class="shop-section shop-potion-section">
                    <div class="shop-section-title">
                        <h3>🧪 ポーション</h3>
                        <span>2枠</span>
                    </div>
                    <div id="shop-potions" class="shop-relics"></div>
                </section>

            </div>
        </div>
    `;

    renderShopCards();
    renderShopRelics();
    renderShopPotions();

    document
        .getElementById("remove-card-button")
        .addEventListener("click", showRemoveCard);

    document
        .getElementById("shop-leave-button")
        .addEventListener("click", advanceFromCurrentNode);
}

function renderShopCards() {
    const container = document.getElementById("shop-cards");
    container.innerHTML = "";

    if (shopCards.length === 0) {
        container.innerHTML = `
            <p class="shop-empty-message">カードは売り切れです。</p>
        `;
        return;
    }

    shopCards.forEach(item => {
        const card = cards[item.cardId];
        const cardElement = document.createElement("div");

        const soldOut = item.soldOut === true;

        cardElement.className =
            `shop-card ${card.rarity}${soldOut ? " sold-out" : ""}`;

        const affordable =
            !soldOut &&
            player.gold >= item.price;

        cardElement.innerHTML = `
            ${
                soldOut
                    ? `<div class="shop-sold-out-stamp">SOLD OUT</div>`
                    : ""
            }

            <div class="shop-rarity">${String(card.rarity || "common").toUpperCase()}</div>
            <h3>${card.name}</h3>

            <div class="shop-card-meta">
                <span>${card.type}</span>
                <span>⚡ ${card.cost}</span>
            </div>

            <p class="shop-item-description">${card.description}</p>

            <p class="shop-price ${
                soldOut
                    ? "sold"
                    : affordable
                        ? "affordable"
                        : "unaffordable"
            }">
                💰 ${item.price}G
            </p>

            <button ${soldOut || !affordable ? "disabled" : ""}>
                ${
                    soldOut
                        ? "購入済み"
                        : affordable
                            ? "購入"
                            : "所持金不足"
                }
            </button>
        `;

        if (!soldOut) {
            cardElement
                .querySelector("button")
                .addEventListener("click", event => {
                    event.stopPropagation();
                    buyCard(item);
                });
        }

        container.appendChild(cardElement);
    });
}

function renderShopRelics() {
    const container = document.getElementById("shop-relics");
    container.innerHTML = "";

    if (shopRelics.length === 0) {
        container.innerHTML = `
            <p class="shop-empty-message">
                今回購入できるレリックはありません。
            </p>
        `;
        return;
    }

    shopRelics.forEach(item => {
        const relic = relics[item.relicId];
        const relicElement = document.createElement("div");

        const soldOut = item.soldOut === true;

        relicElement.className =
            `shop-relic${soldOut ? " sold-out" : ""}`;

        const affordable =
            !soldOut &&
            player.gold >= item.price;

        relicElement.innerHTML = `
            ${
                soldOut
                    ? `<div class="shop-sold-out-stamp">SOLD OUT</div>`
                    : ""
            }

            <div class="shop-relic-icon">${relic.icon || "💎"}</div>
            <h3>${relic.name}</h3>

            <p class="shop-item-description">${relic.description}</p>

            ${
                relic.character
                    ? `<p class="shop-character-relic">${characters[relic.character]?.name || "専用"}専用</p>`
                    : ""
            }

            <p class="shop-price ${
                soldOut
                    ? "sold"
                    : affordable
                        ? "affordable"
                        : "unaffordable"
            }">
                💰 ${item.price}G
            </p>

            <button ${soldOut || !affordable ? "disabled" : ""}>
                ${
                    soldOut
                        ? "購入済み"
                        : affordable
                            ? "購入"
                            : "所持金不足"
                }
            </button>
        `;

        if (!soldOut) {
            relicElement
                .querySelector("button")
                .addEventListener("click", event => {
                    event.stopPropagation();
                    buyRelic(item);
                });
        }

        container.appendChild(relicElement);
    });
}


function renderShopPotions() {
    const container = document.getElementById("shop-potions");
    if (!container) return;
    container.innerHTML = "";
    shopPotions.forEach(item => {
        const potion = potions[item.potionId];
        const soldOut = item.soldOut === true;
        const affordable = !soldOut && player.gold >= item.price && ensurePotionSlots().some(v => !v);
        const el = document.createElement("div");
        el.className = `shop-relic${soldOut ? " sold-out" : ""}`;
        el.innerHTML = `<div class="shop-relic-icon">${potion.icon}</div><h3>${potion.name}</h3><p class="shop-item-description">${potion.description}</p><p class="shop-price">💰 ${item.price}G</p><button ${affordable ? "" : "disabled"}>${soldOut ? "購入済み" : affordable ? "購入" : "購入不可"}</button>`;
        if (affordable) el.querySelector("button").addEventListener("click", () => {
            if (player.gold < item.price || !addPotion(item.potionId)) return;
            player.gold -= item.price; item.soldOut = true; updateShopGold(); renderShopPotions();
        });
        container.appendChild(el);
    });
}
function buyCard(item) {
    const card = cards[item.cardId];

    if (!card) {
        console.error("カードが存在しません:", item.cardId);
        return;
    }

    if (player.gold < item.price) {
        alert("ゴールドが足りません");
        return;
    }

    player.gold -= item.price;
    player.starterDeck.push(card.id);

    // 購入済み表示を残すため、商品枠は消さない。

    item.soldOut = true;

    updateShopGold();
    renderShopCards();
    renderShopRelics();
}

function buyRelic(item) {
    const relic = relics[item.relicId];

    if (!relic) {
        console.error("レリックが存在しません:", item.relicId);
        return;
    }

    if (player.gold < item.price) {
        alert("ゴールドが足りません");
        return;
    }

    if (player.relics.includes(relic.id)) {
        alert("すでに所持しているレリックです");
        return;
    }

    player.gold -= item.price;

    if (typeof addRelicDirectly === "function") {
        addRelicDirectly(relic.id);
    } else {
        player.relics.push(relic.id);

        if (typeof showRelicAcquired === "function") {
            showRelicAcquired(relic.id);
        }
    }

    item.soldOut = true;

    updateShopGold();
    renderShopCards();
    renderShopRelics();
    renderShopPotions();

    if (typeof updateOwnedRelicUI === "function") {
        updateOwnedRelicUI();
    }
}

function updateShopGold() {
    const goldElement = document.getElementById("shop-gold");

    if (goldElement) {
        goldElement.textContent = player.gold;
    }
}

function showRemoveCard() {
    const mapArea = document.getElementById("map-area");
    const removePrice = getRemoveCardPrice();

    mapArea.innerHTML = `
        <div class="shop">
            <h2>🗑️ カード削除</h2>

            <p>${removePrice}Gを使ってカードを1枚削除できます。</p>

            <p>
                💰 所持金：
                <span id="shop-gold">${player.gold}</span>
            </p>

            <div id="remove-card-list" class="remove-card-list"></div>

            <button id="cancel-remove-button" class="secondary-button">
                キャンセル
            </button>
        </div>
    `;

    renderRemoveCards();

    document
        .getElementById("cancel-remove-button")
        .addEventListener("click", renderShop);
}

function renderRemoveCards() {
    const container = document.getElementById("remove-card-list");
    container.innerHTML = "";

    player.starterDeck.forEach((cardId, index) => {
        const card = cards[cardId];
        const button = document.createElement("button");

        button.className = "remove-card-button";
        button.textContent = `${card.name} を削除`;

        button.addEventListener("click", () => {
            removeCard(index);
        });

        container.appendChild(button);
    });
}

function removeCard(index) {
    const removePrice = getRemoveCardPrice();

    if (player.gold < removePrice) {
        alert("ゴールドが足りません");
        return;
    }

    const cardId = player.starterDeck[index];
    const card = cards[cardId];

    if (!card) {
        return;
    }

    player.gold -= removePrice;
    player.starterDeck.splice(index, 1);

    alert(`${card.name} を削除しました`);

    showShop();
}
