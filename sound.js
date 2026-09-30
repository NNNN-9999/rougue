// ======================
// v30 Sound System
// ======================

const soundConfig = {
    enabled: localStorage.getItem("cardRoguelike_soundEnabled") !== "false",
    seVolume: Number(localStorage.getItem("cardRoguelike_seVolume") ?? 0.62),
    bgmVolume: 0.88
};

const soundFiles = {
    cardPlay: "assets/audio/se/card_play.wav",
    slash: "assets/audio/se/slash.wav",
    guardReady: "assets/audio/se/guard_ready.wav",
    attackHit: "assets/audio/se/attack_hit.wav",
    block: "assets/audio/se/block.wav",
    endTurn: "assets/audio/se/end_turn.wav",
    enemyDown: "assets/audio/se/enemy_down.wav",
    uiClick: "assets/audio/se/ui_click.wav",
    heal: "assets/audio/se/heal.wav",
    draw: "assets/audio/se/draw.wav"
};

const soundLibrary = {};
let audioUnlocked = false;
let bgmAudio = null;

function initSoundSystem() {
    bgmAudio = new Audio("assets/audio/bgm/dungeon_theme.wav");
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
    bgmAudio.volume = soundConfig.bgmVolume;
    Object.entries(soundFiles).forEach(([key, src]) => {
        const audio = new Audio(src);
        audio.preload = "auto";
        soundLibrary[key] = audio;
    });

    updateSoundToggleUI();

    const unlock = () => {
        audioUnlocked = true;
        updateBgmForScene();
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("keydown", unlock);
    };

    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    document.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button || button.id === "sound-toggle" || button.id === "end-turn") {
            return;
        }
        playSe("uiClick", 0.45);
    });
}

function playSe(name, volumeScale = 1) {
    if (!soundConfig.enabled || !audioUnlocked) {
        return;
    }

    const base = soundLibrary[name];
    if (!base) {
        return;
    }

    const sound = base.cloneNode();
    sound.volume = Math.max(
        0,
        Math.min(1, soundConfig.seVolume * volumeScale)
    );

    sound.play().catch(() => {});
}

function toggleSound() {
    soundConfig.enabled = !soundConfig.enabled;
    localStorage.setItem(
        "cardRoguelike_soundEnabled",
        String(soundConfig.enabled)
    );
    updateSoundToggleUI();
    updateBgmForScene();

}


function updateBgmForScene() {
    if (!bgmAudio) return;
    const shouldPlay = soundConfig.enabled && audioUnlocked && ["map", "battle", "reward"].includes(Scene.current);
    if (shouldPlay) {
        bgmAudio.volume = Math.max(0, Math.min(1, soundConfig.bgmVolume));
        bgmAudio.play().catch(() => {});
    } else {
        bgmAudio.pause();
    }
}

function updateSoundToggleUI() {
    const button = document.getElementById("sound-toggle");
    if (!button) {
        return;
    }

    button.textContent = soundConfig.enabled ? "🔊" : "🔇";
    button.title = soundConfig.enabled ? "効果音：ON" : "効果音：OFF";
    button.setAttribute("aria-label", button.title);
    button.setAttribute("aria-pressed", String(soundConfig.enabled));
}

document.addEventListener("DOMContentLoaded", () => {
    initSoundSystem();

    const toggle = document.getElementById("sound-toggle");
    if (toggle) {
        toggle.addEventListener("click", toggleSound);
    }
});
