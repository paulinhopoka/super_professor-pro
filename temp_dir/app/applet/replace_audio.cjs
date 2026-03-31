const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

const target = `    // --- Interaction Sounds ---
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
    };`;

const replacement = `    // --- Interaction Sounds ---
    let sharedAudioCtx = null;
    const playInteractionSound = () => {
        if (appData.settings.interactionSoundsEnabled !== false) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
                if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
                
                const osc = sharedAudioCtx.createOscillator();
                const gain = sharedAudioCtx.createGain();
                osc.connect(gain);
                gain.connect(sharedAudioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, sharedAudioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, sharedAudioCtx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.1, sharedAudioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, sharedAudioCtx.currentTime + 0.05);
                osc.start(sharedAudioCtx.currentTime);
                osc.stop(sharedAudioCtx.currentTime + 0.05);
            } catch (e) {
                // Ignore audio errors
            }
        }
    };`;

content = content.replace(target, replacement);
fs.writeFileSync('script.js', content);
console.log('Done');
