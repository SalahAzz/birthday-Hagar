document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(TextPlugin);

    const DOM = {
        cursor: {
            main: document.getElementById('custom-cursor'),
            glow: document.querySelector('.cursor-glow')
        },
        scenes: {
            intro: document.getElementById('scene-intro'),
            cake: document.getElementById('scene-cake'),
            message: document.getElementById('scene-message'),
            final: document.getElementById('scene-final')
        },
        buttons: {
            open: document.getElementById('btn-open-surprise'),
            toFinal: document.getElementById('btn-to-final'),
            restart: document.getElementById('btn-restart'),
            audioToggle: document.getElementById('audio-toggle')
        },
        intro: {
            title: document.getElementById('intro-title'),
            subtitle: document.getElementById('intro-subtitle')
        },
        cake: {
            candles: document.querySelectorAll('.candle')
        },
        flash: document.getElementById('screen-flash'),
        interactiveElements: document.querySelectorAll('button, .candle')
    };

    let appState = {
        currentScene: 'intro',
        audioEnabled: false,
        activeCandles: 5,
        micActive: false,
        isTransitioning: false
    };

    const bgMusic = new Audio('assets/music/romantic-bg.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4;

    const SynthAudio = {
        ctx: null,
        init() {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        },
        playClick() {
            if (!appState.audioEnabled) return;
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        },
        playMagic() {
            if (!appState.audioEnabled) return;
            this.init();
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);
                gain.gain.setValueAtTime(0.12, this.ctx.currentTime + index * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.08 + 0.5);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + index * 0.08);
                osc.stop(this.ctx.currentTime + index * 0.08 + 0.5);
            });
        },
        playBlow() {
            if (!appState.audioEnabled) return;
            this.init();
            const bufferSize = this.ctx.sampleRate * 0.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(300, this.ctx.currentTime);
            filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.5);
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        },
        playTypingBeep() {
            if (!appState.audioEnabled) return;
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.03);
        }
    };

    const toggleAudio = () => {
        appState.audioEnabled = !appState.audioEnabled;
        const icon = DOM.buttons.audioToggle.querySelector('i');
        
        if (appState.audioEnabled) {
            SynthAudio.init();
            bgMusic.play().catch(e => console.log("Audio play blocked"));
            icon.className = 'fas fa-volume-up';
        } else {
            bgMusic.pause();
            icon.className = 'fas fa-volume-mute';
        }
    };

    DOM.buttons.audioToggle.addEventListener('click', () => {
        SynthAudio.playClick();
        toggleAudio();
    });

    const initAudio = () => {
        if (!appState.audioEnabled) toggleAudio();
        document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);

    // Custom Magical Cursor with Particle Trail
    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;

        const renderCursor = () => {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            DOM.cursor.main.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
            DOM.cursor.glow.style.transform = `translate(${cursorX - mouseX}px, ${cursorY - mouseY}px)`;
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        DOM.interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => DOM.cursor.main.classList.add('active'));
            el.addEventListener('mouseleave', () => DOM.cursor.main.classList.remove('active'));
        });
    }

    // Fantasy Dreamy Environment (Sakura Petals, Butterflies, Magic Dust, Sparkles)
    const canvas = document.getElementById('galaxy-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    const resizeCanvas = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    class DreamParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height + height;
            this.size = Math.random() * 4 + 2;
            this.speedY = Math.random() * 0.8 + 0.3;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.5;
            this.rotation = Math.random() * 360;
            this.rotSpeed = Math.random() * 2 - 1;
            this.alpha = Math.random() * 0.7 + 0.3;
            this.type = Math.random() > 0.4 ? 'petal' : (Math.random() > 0.5 ? 'sparkle' : 'heart');
            // Custom Palette: Powder Pink, Warm Pink, Baby Blue, Soft Lavender, Butter Yellow, White
            this.color = ['#ffb7c5', '#f472b6', '#a5f3fc', '#c4b5fd', '#fef08a', '#ffffff'][Math.floor(Math.random() * 6)];
        }
        update(speedMult = 1) {
            this.y -= this.speedY * speedMult;
            this.x += Math.sin(this.y * 0.01) * 0.6 + this.speedX;
            this.rotation += this.rotSpeed;
            if (this.y < -20) {
                this.y = height + 20;
                this.x = Math.random() * width;
            }
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.alpha;

            if (this.type === 'petal') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'heart') {
                ctx.fillStyle = this.color;
                ctx.font = `${this.size * 3}px sans-serif`;
                ctx.fillText('❤', 0, 0);
            } else {
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    const initEnvironment = () => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        for (let i = 0; i < 120; i++) {
            particles.push(new DreamParticle());
        }
        animateEnvironment();
    };

    const animateEnvironment = () => {
        ctx.clearRect(0, 0, width, height);
        const speed = appState.isTransitioning ? 3 : 1;
        particles.forEach(p => {
            p.update(speed);
            p.draw();
        });
        requestAnimationFrame(animateEnvironment);
    };

    initEnvironment();

    // Scene Manager with Smooth GSAP Transitions
    const switchScene = (from, to, callback) => {
        if (appState.isTransitioning) return;
        appState.isTransitioning = true;
        appState.currentScene = to.id;

        const tl = gsap.timeline({
            onComplete: () => {
                if(from && from !== document.createElement('div')) {
                    from.classList.remove('active-scene');
                }
                to.classList.add('active-scene');
                appState.isTransitioning = false;
                if(callback) callback();
            }
        });

        if (from && from !== document.createElement('div')) {
            tl.to(from, { opacity: 0, scale: 0.92, duration: 0.8, ease: "power2.inOut" });
        }
        tl.set(to, { opacity: 0, scale: 1.08 })
          .to(to, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, "+=0.1");
    };

    // Intro Typing Animation (Modified to Hagar)
    const playIntro = () => {
        const tl = gsap.timeline();

        tl.to(DOM.intro.title, {
            duration: 2.2,
            text: "عندي ليكي مفاجأة مميزة يا هاجر...",
            ease: "none",
            onUpdate: () => { if(Math.random() > 0.7) SynthAudio.playTypingBeep(); }
        })
        .to(DOM.intro.subtitle, {
            duration: 3.5,
            text: "في اليوم الحلو ده...\nفي أمنية وفرحة مستنياكي...\nمن كل قلبي ✨🌸",
            ease: "none",
            onUpdate: () => { if(Math.random() > 0.7) SynthAudio.playTypingBeep(); }
        }, "+=0.4")
        .to(DOM.buttons.open, {
            opacity: 1,
            pointerEvents: 'auto',
            y: 0,
            duration: 1,
            ease: "back.out(1.7)"
        }, "+=0.4");
    };

    gsap.set(DOM.buttons.open, { y: 20 });
    setTimeout(playIntro, 1000);

    DOM.buttons.open.addEventListener('click', () => {
        SynthAudio.playClick();
        SynthAudio.playMagic();
        gsap.to(DOM.buttons.open, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        switchScene(DOM.scenes.intro, DOM.scenes.cake, initCakeScene);
    });

    const initCakeScene = () => {
        gsap.from(".cake-stage", { y: 100, opacity: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" });
        gsap.from(".instruction-box", { y: -50, opacity: 0, duration: 1, delay: 0.4, ease: "power2.out" });
        setupMicrophone();

        DOM.cake.candles.forEach(candle => {
            candle.addEventListener('click', () => {
                extinguishCandle(candle);
            });
        });
    };

    let audioContext, analyser, microphone, micDataArray;
    let checkMicFrame;
    let blowCooldown = false;

    const setupMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            micDataArray = new Uint8Array(bufferLength);
            appState.micActive = true;
            listenForBlow();
        } catch (err) {
            document.querySelector('.mic-hint').innerText = "اضغطي على الشموع لإطفائها";
        }
    };

    const listenForBlow = () => {
        if (!appState.micActive || appState.activeCandles === 0) return;
        analyser.getByteFrequencyData(micDataArray);
        let sum = 0;
        for (let i = 0; i < micDataArray.length; i++) {
            sum += micDataArray[i];
        }
        let average = sum / micDataArray.length;

        if (average > 85 && !blowCooldown) {
            const activeCandles = Array.from(DOM.cake.candles).filter(c => !c.classList.contains('off'));
            if (activeCandles.length > 0) {
                const randomCandle = activeCandles[Math.floor(Math.random() * activeCandles.length)];
                extinguishCandle(randomCandle);
                blowCooldown = true;
                setTimeout(() => blowCooldown = false, 400);
            }
        }
        checkMicFrame = requestAnimationFrame(listenForBlow);
    };

    const extinguishCandle = (candle) => {
        if (candle.classList.contains('off')) return;
        candle.classList.add('off');
        SynthAudio.playBlow();
        appState.activeCandles--;

        if (appState.activeCandles === 0) {
            if(appState.micActive) {
                cancelAnimationFrame(checkMicFrame);
                if(microphone) microphone.disconnect();
            }
            setTimeout(triggerCelebration, 1200);
        }
    };

    // Massive Celebration with Camera Shake, Fireworks, Pastel Confetti
    const triggerCelebration = () => {
        document.body.classList.add('shake-screen');
        setTimeout(() => document.body.classList.remove('shake-screen'), 600);

        const tl = gsap.timeline();
        tl.to(DOM.flash, { opacity: 1, duration: 0.1 })
          .set(DOM.scenes.cake, { className: "scene" })
          .to(DOM.flash, { opacity: 0, duration: 1.5, ease: "power2.out" })
          .call(() => {
              launchFloralCelebration();
              setTimeout(() => {
                  switchScene(document.createElement('div'), DOM.scenes.message, initMessageScene);
              }, 4500);
          });
    };

    const launchFloralCelebration = () => {
        const duration = 5000;
        const end = Date.now() + duration;
        // Confetti colors: Pink, Baby Blue, Lavender, Butter Yellow, White
        const colors = ['#ffb7c5', '#f472b6', '#a5f3fc', '#c4b5fd', '#fef08a', '#ffffff'];

        (function frame() {
            confetti({ particleCount: 10, angle: 60, spread: 60, origin: { x: 0 }, colors: colors, zIndex: 100 });
            confetti({ particleCount: 10, angle: 120, spread: 60, origin: { x: 1 }, colors: colors, zIndex: 100 });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    };

    const initMessageScene = () => {
        const lines = document.querySelectorAll('.msg-line');
        const tl = gsap.timeline();

        gsap.from(".message-card", { y: 50, opacity: 0, duration: 1, ease: "power3.out" });

        tl.to(lines, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.6,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(DOM.buttons.toFinal, { opacity: 1, pointerEvents: 'auto', y: 0, duration: 1 });
            }
        });
    };

    gsap.set(DOM.buttons.toFinal, { y: 20 });
    DOM.buttons.toFinal.addEventListener('click', () => {
        SynthAudio.playClick();
        switchScene(DOM.scenes.message, DOM.scenes.final, initFinalScene);
    });

    const initFinalScene = () => {
        SynthAudio.playMagic();
        gsap.fromTo(".huge-heart-container", 
            { scale: 0, opacity: 0, rotation: -15 },
            { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.4)" }
        );
        gsap.fromTo(DOM.buttons.restart, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1 });
        launchInfiniteFloralRain();
    };

    let infiniteConfettiInterval;
    const launchInfiniteFloralRain = () => {
        const colors = ['#ffb7c5', '#f472b6', '#a5f3fc', '#c4b5fd', '#fef08a', '#ffffff'];
        infiniteConfettiInterval = setInterval(() => {
            confetti({
                particleCount: 3,
                angle: 90,
                spread: 360,
                origin: { x: Math.random(), y: -0.1 },
                colors: colors,
                ticks: 350,
                gravity: 0.45,
                scalar: Math.random() * 0.6 + 0.6,
                shapes: ['circle']
            });
        }, 220);
    };

    DOM.buttons.restart.addEventListener('click', () => {
        SynthAudio.playClick();
        clearInterval(infiniteConfettiInterval);
        bgMusic.pause();
        gsap.to("body", { opacity: 0, duration: 1, onComplete: () => window.location.reload() });
    });
});