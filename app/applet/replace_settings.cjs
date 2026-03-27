const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

// 1. Add interactionSoundsEnabled to default settings
content = content.replace(
    /appData\.settings\.notificationSoundEnabled = appData\.settings\.notificationSoundEnabled !== undefined \? appData\.settings\.notificationSoundEnabled : true;/g,
    `appData.settings.notificationSoundEnabled = appData.settings.notificationSoundEnabled !== undefined ? appData.settings.notificationSoundEnabled : true;
                appData.settings.interactionSoundsEnabled = appData.settings.interactionSoundsEnabled !== undefined ? appData.settings.interactionSoundsEnabled : true;`
);

// 2. Add event listener for the toggle and share button
const newLogic = `
    // --- New Settings Logic ---
    const soundEffectsToggle = document.getElementById('sound-effects-toggle');
    if (soundEffectsToggle) {
        soundEffectsToggle.checked = appData.settings.interactionSoundsEnabled !== false;
        soundEffectsToggle.addEventListener('change', (e) => {
            appData.settings.interactionSoundsEnabled = e.target.checked;
            saveData();
        });
    }

    const shareWhatsappBtn = document.getElementById('share-whatsapp-btn');
    if (shareWhatsappBtn) {
        shareWhatsappBtn.addEventListener('click', () => {
            const text = "Conheça o Super Professor Pro! Um app incrível para ajudar professores a gerenciar turmas, notas, frequências e gerar planos de aula com IA. Acesse: " + window.location.href;
            const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
            window.open(url, '_blank');
        });
    }
    
    // --- Interaction Sounds ---
    const playInteractionSound = () => {
        if (appData.settings.interactionSoundsEnabled !== false) {
            try {
                // A very short, soft click sound using Web Audio API
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.05);
            } catch (e) {
                // Ignore audio errors
            }
        }
    };

    // Attach interaction sound to all buttons and nav items
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .nav-item, .tab-button, .action-btn');
        if (target) {
            playInteractionSound();
        }
    });
`;

// Insert the new logic before the end of DOMContentLoaded
content = content.replace(
    /    if \(appData\.settings\.globalNotificationsEnabled\) \{ startNotificationChecker\(\); \}/,
    `    if (appData.settings.globalNotificationsEnabled) { startNotificationChecker(); }\n${newLogic}`
);

fs.writeFileSync('script.js', content);
console.log('Done');
