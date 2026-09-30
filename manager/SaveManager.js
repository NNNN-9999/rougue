// ======================
// SaveManager.js v11
// ラン状態のチェックポイント保存
// ======================

const RUN_SAVE_KEY = "cardRoguelike_run_v11";
const RUN_SAVE_VERSION = 1;


function getCurrentMapNodeIdForSave() {
    return currentMapNode?.id || null;
}


function isSafeMapSavePoint() {
    if (Scene.current !== "map") {
        return false;
    }

    // ノードを選択した直後（イベント・ショップ処理中など）は保存しない。
    // 直前の安全なチェックポイントへ戻れるようにする。
    if (
        currentMapNode &&
        floor <= currentMapNode.floor
    ) {
        return false;
    }

    return true;
}


function canSaveRunNow() {
    if (!player || !selectedCharacter || player.hp <= 0) {
        return false;
    }

    if (Scene.current === "battle") {
        return Boolean(enemy) && !battleEnded;
    }

    return isSafeMapSavePoint();
}


function createRunSnapshot() {
    if (!canSaveRunNow()) {
        return null;
    }

    return {
        version: RUN_SAVE_VERSION,
        savedAt: Date.now(),
        selectedCharacter,
        player,
        scene: Scene.current,
        map: {
            currentDepth,
            floor,
            mapData,
            currentMapNodeId: getCurrentMapNodeIdForSave(),
            visitedMapNodeIds: [...visitedMapNodeIds]
        },
        battle: Scene.current === "battle"
            ? {
                enemy,
                battleEnded
            }
            : null
    };
}


function saveRunState() {
    const snapshot = createRunSnapshot();

    if (!snapshot) {
        return false;
    }

    try {
        localStorage.setItem(
            RUN_SAVE_KEY,
            JSON.stringify(snapshot)
        );
        updateContinueButton();
        return true;
    } catch (error) {
        console.error("ランデータの保存に失敗しました", error);
        return false;
    }
}


function getSavedRun() {
    try {
        const raw = localStorage.getItem(RUN_SAVE_KEY);
        if (!raw) return null;

        const data = JSON.parse(raw);

        if (
            !data ||
            data.version !== RUN_SAVE_VERSION ||
            !data.player ||
            !data.selectedCharacter ||
            !data.map
        ) {
            return null;
        }

        return data;
    } catch (error) {
        console.error("ランデータの読み込みに失敗しました", error);
        return null;
    }
}


function hasRunSave() {
    return Boolean(getSavedRun());
}


function clearRunSave() {
    try {
        localStorage.removeItem(RUN_SAVE_KEY);
    } catch (error) {
        console.error("ランデータの削除に失敗しました", error);
    }

    updateContinueButton();
}


function findSavedMapNode(nodeId) {
    if (!nodeId) return null;

    for (const layer of mapData) {
        const found = layer.find(node => node.id === nodeId);
        if (found) return found;
    }

    return null;
}


function restoreRunState() {
    const data = getSavedRun();

    if (!data) {
        updateContinueButton();
        return false;
    }

    try {
        selectedCharacter = data.selectedCharacter;
        player = data.player;

        currentDepth = data.map.currentDepth || 1;
        floor = data.map.floor || 1;
        mapData = Array.isArray(data.map.mapData)
            ? data.map.mapData
            : [];

        visitedMapNodeIds.clear();
        (data.map.visitedMapNodeIds || []).forEach(nodeId => {
            visitedMapNodeIds.add(nodeId);
        });

        currentMapNode = findSavedMapNode(
            data.map.currentMapNodeId
        );

        updateOwnedRelicUI();

        if (
            data.scene === "battle" &&
            data.battle?.enemy
        ) {
            enemy = data.battle.enemy;
            battleEnded = Boolean(data.battle.battleEnded);

            changeScene("battle");
            updatePlayerUI();
            updateEnemyUI();
            renderHand();
        } else {
            showMap();
        }

        return true;

    } catch (error) {
        console.error("ランデータの復元に失敗しました", error);
        return false;
    }
}


function updateContinueButton() {
    const button = document.getElementById("continue-button");
    if (!button) return;

    const save = getSavedRun();
    button.classList.toggle("hidden", !save);

    if (save) {
        const depth = save.map?.currentDepth || 1;
        button.textContent = `▶ 続きから（B${depth}）`;
    }
}


const continueButton = document.getElementById("continue-button");
if (continueButton) {
    continueButton.addEventListener("click", restoreRunState);
}


// タブを閉じる・リロードする直前にも、安全な状態なら保存。
window.addEventListener("beforeunload", () => {
    saveRunState();
});


document.addEventListener("DOMContentLoaded", () => {
    updateContinueButton();
});
