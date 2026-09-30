// ======================
// SceneManager.js
// ======================

const Scene = {
    current: "title"
};

const SCENE_IDS = {
    title: "title-screen",
    character: "character-screen",
    "skill-tree": "skill-tree-screen",
    battle: "battle-screen",
    reward: "reward-screen",
    map: "map-screen"
};

function changeScene(scene) {

    const targetId = SCENE_IDS[scene];

    if (!targetId) {
        console.error("存在しないシーンです:", scene);
        return;
    }

    Object.values(SCENE_IDS).forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }

    });

    const target = document.getElementById(targetId);

    if (!target) {
        console.error("シーン要素が見つかりません:", targetId);
        return;
    }

    target.classList.remove("hidden");
    Scene.current = scene;

    if (typeof updateBgmForScene === "function") {
        updateBgmForScene();
    }

    const relicPanel =
        document.getElementById("owned-relics-panel");

    if (relicPanel) {
        const showRelics =
            Boolean(player) &&
            ["map", "battle", "reward"].includes(scene);

        relicPanel.classList.toggle(
            "hidden",
            !showRelics
        );
    }

    if (
        typeof updateOwnedRelicUI === "function"
    ) {
        updateOwnedRelicUI();
    }

    if (
        typeof updatePersistentRunHud === "function"
    ) {
        updatePersistentRunHud();
    }

    if (typeof renderPotionBelt === "function") {
        renderPotionBelt();
    }

}
