  // --- DOM Elements ---
        const coin = document.getElementById('coin');
        const resultDisplay = document.getElementById('result');
        const flipBtn = document.getElementById('flipBtn');
        const historyDiv = document.getElementById('history');
        const coinContainer = document.getElementById('coinContainer');
        const countdownDisplay = document.getElementById('countdown');
        const headsCountSpan = document.getElementById('headsCount');
        const tailsCountSpan = document.getElementById('tailsCount');
        const headsStreakSpan = document.getElementById('headsStreak');
        const tailsStreakSpan = document.getElementById('tailsStreak');
        const resetBtn = document.getElementById('resetBtn');
        const choiceHeadsBtn = document.getElementById('choiceHeads');
        const choiceTailsBtn = document.getElementById('choiceTails');
        const choiceButtons = [choiceHeadsBtn, choiceTailsBtn];

        // --- State Variables ---
        let isFlipping = false;
        let flipCount = 0;
        let headsTotal = 0;
        let tailsTotal = 0;
        let currentHeadsStreak = 0;
        let maxHeadsStreak = 0;
        let currentTailsStreak = 0;
        let maxTailsStreak = 0;
        let userChoice = null; // 'Heads' or 'Tails'
        let animationFrameId = null;

        // --- Sound Effects (Improved Placeholders - Replace with better Base64 or files) ---
        const flipSound = new Audio("data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA//8="); // Placeholder
        const landSoundHeads = new Audio("data:audio/wav;base64,UklGRjoAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRYAAAAA/////+P/9v/u/+f/5//q/+z/8f/zAAAAAP8A"); // Placeholder
        const landSoundTails = new Audio("data:audio/wav;base64,UklGRjoAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRYAAAAA/////+L/9v/u/+f/5//q/+z/8f/zAAAAAP8A"); // Slightly different placeholder
        const winSound = new Audio("data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA/v8A/v8="); // Placeholder
        const loseSound = new Audio("data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA/v8A/v8="); // Placeholder


        // --- Physics & Animation Parameters ---
        const GRAVITY = -0.04; // Acceleration due to gravity
        const INITIAL_VELOCITY = 2.2; // How high the coin goes
        const ROTATION_SPEED_Y = 25 + Math.random() * 10; // Degrees per frame (randomized)
        const ROTATION_SPEED_X_WOBBLE = 0.5 + Math.random() * 1; // Wobble amount
        const AIR_RESISTANCE = 0.99; // Slows down rotation/velocity slightly


        // --- Core Flip Function ---
        function flipCoin() {
            if (isFlipping) return;
            if (!userChoice) {
                alert('कृपया टॉस करने से पहले हेड्स या टेल्स चुनें!');
                return;
            }

            isFlipping = true;
            resultDisplay.classList.remove('show', 'win', 'lose');
            flipBtn.disabled = true;
            choiceButtons.forEach(btn => btn.disabled = true);
            countdownDisplay.textContent = 'हवा में है...';

            flipSound.currentTime = 0;
            flipSound.play().catch(e => console.warn("Flip audio play failed:", e));

            // Determine outcome BEFORE animation starts
            const finalOutcome = Math.random() < 0.5 ? 'Heads' : 'Tails'; // 0: Heads, 1: Tails

            // --- Start JS Animation ---
            let posY = 0; // Current vertical position
            let velocityY = INITIAL_VELOCITY;
            let rotationY = Math.random() * 360; // Start at random rotation
            let rotationX = 0; // Wobble rotation
            let currentRotationSpeedY = ROTATION_SPEED_Y;

            const targetYRotation = (finalOutcome === 'Heads') ? 0 : 180; // Target face up

            function animate() {
                // Apply physics
                velocityY += GRAVITY;
                posY += velocityY;
                rotationY = (rotationY + currentRotationSpeedY) % 360;
                rotationX = Math.sin(posY * 0.5) * ROTATION_SPEED_X_WOBBLE * (INITIAL_VELOCITY - Math.abs(velocityY)); // Wobble more at apex

                // Apply air resistance (optional, subtle)
                velocityY *= AIR_RESISTANCE;
                currentRotationSpeedY *= AIR_RESISTANCE;


                // Apply transformations
                coin.style.transform = `translateY(${-posY * 25}px) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`; // Multiply posY for visual height

                // Check for landing
                if (posY <= 0 && velocityY < 0) { // Coin has hit the "ground"
                     cancelAnimationFrame(animationFrameId);
                     landCoin(finalOutcome);
                     return;
                 }

                // Continue animation
                animationFrameId = requestAnimationFrame(animate);
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // --- Coin Landing ---
        function landCoin(finalOutcome) {
            // Snap to final rotation (Heads or Tails face up) with slight settle bounce
            const finalRotationY = (finalOutcome === 'Heads' ? 0 : 180) + (360 * Math.floor(4 + Math.random() * 3)); // Multiple spins + target
            const settleTime = 400; // ms

            coin.style.transition = `transform ${settleTime}ms cubic-bezier(0.34, 1.56, 0.64, 1)`; // Bounce ease-out
            coin.style.transform = `translateY(0px) rotateY(${finalRotationY}deg) rotateX(0deg)`; // Land flat

            // Play landing sound
             setTimeout(() => {
                 const landSound = finalOutcome === 'Heads' ? landSoundHeads : landSoundTails;
                 landSound.currentTime = 0;
                 landSound.play().catch(e => console.warn("Land audio play failed:", e));
             }, 50); // Play slightly after animation starts

            // Process result after settle animation
            setTimeout(() => {
                processResult(finalOutcome);
                coin.style.transition = ''; // Remove transition for next flip
            }, settleTime);
        }


        // --- Process Result ---
        function processResult(outcome) {
            const didWin = outcome === userChoice;

            resultDisplay.textContent = `${outcome}! आप ${didWin ? 'जीते 🎉' : 'हारे 😢'}!`;
            resultDisplay.classList.add('show', didWin ? 'win' : 'lose');
            countdownDisplay.textContent = '';

            // Play win/lose sound
            const resultSound = didWin ? winSound : loseSound;
            resultSound.currentTime = 0;
            resultSound.play().catch(e => console.warn("Result audio play failed:", e));

            // Update Stats
            flipCount++;
            if (outcome === 'Heads') {
                headsTotal++;
                currentHeadsStreak++;
                currentTailsStreak = 0;
                if (currentHeadsStreak > maxHeadsStreak) maxHeadsStreak = currentHeadsStreak;
            } else {
                tailsTotal++;
                currentTailsStreak++;
                currentHeadsStreak = 0;
                if (currentTailsStreak > maxTailsStreak) maxTailsStreak = currentTailsStreak;
            }

            // Update Display
            headsCountSpan.textContent = headsTotal;
            tailsCountSpan.textContent = tailsTotal;
            headsStreakSpan.textContent = maxHeadsStreak;
            tailsStreakSpan.textContent = maxTailsStreak;

            // Update History
            updateHistory(outcome, didWin);

            // Re-enable UI
            isFlipping = false;
            flipBtn.disabled = false;
            choiceButtons.forEach(btn => btn.disabled = false);
        }

        // --- Update History ---
        function updateHistory(resultText, didWin) {
            const now = new Date();
            const time = now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

            const historyEntry = document.createElement('p');
            historyEntry.textContent = `#${flipCount}: ${resultText} (${userChoice} चुना था) - ${time}`;
            historyEntry.classList.add(didWin ? 'win' : 'lose');

            historyDiv.insertBefore(historyEntry, historyDiv.firstChild);
            if (historyDiv.childElementCount > 5) {
                historyDiv.removeChild(historyDiv.lastChild);
            }
        }

        // --- Handle User Choice ---
        function handleChoiceSelection(event) {
             if (isFlipping) return;
             const selectedBtn = event.target;
             userChoice = selectedBtn.id === 'choiceHeads' ? 'Heads' : 'Tails';

             choiceButtons.forEach(btn => btn.classList.remove('selected'));
             selectedBtn.classList.add('selected');
        }

        // --- Reset Function ---
        function resetGame() {
            if (isFlipping) return;

            flipCount = 0;
            headsTotal = 0;
            tailsTotal = 0;
            currentHeadsStreak = 0;
            maxHeadsStreak = 0;
            currentTailsStreak = 0;
            maxTailsStreak = 0;
            userChoice = null;

            headsCountSpan.textContent = '0';
            tailsCountSpan.textContent = '0';
            headsStreakSpan.textContent = '0';
            tailsStreakSpan.textContent = '0';
            historyDiv.innerHTML = '';
            resultDisplay.textContent = 'रीसेट! अपना अनुमान चुनें।';
            resultDisplay.classList.remove('win', 'lose');
            resultDisplay.classList.add('show');
            choiceButtons.forEach(btn => btn.classList.remove('selected'));
            countdownDisplay.textContent = '';

            // Reset coin position visually
             coin.style.transition = 'transform 0.5s ease';
             coin.style.transform = 'translateY(0px) rotateY(0deg) rotateX(0deg)';
             setTimeout(() => coin.style.transition = '', 500);

             setTimeout(() => resultDisplay.classList.remove('show'), 2000);
        }

        // --- Event Listeners ---
        flipBtn.addEventListener('click', flipCoin);
        coinContainer.addEventListener('click', flipCoin); // Allow clicking coin itself
        resetBtn.addEventListener('click', resetGame);
        choiceHeadsBtn.addEventListener('click', handleChoiceSelection);
        choiceTailsBtn.addEventListener('click', handleChoiceSelection);

        // --- Initial Setup & Audio Unlock ---
        resultDisplay.textContent = 'शुरू करने के लिए हेड्स या टेल्स चुनें!';
        resultDisplay.classList.add('show');

        const enableAudio = () => {
             // Play and immediately pause sounds to enable them
             try {
                 [flipSound, landSoundHeads, landSoundTails, winSound, loseSound].forEach(sound => {
                     sound.play().then(() => sound.pause()).catch(()=>{});
                     sound.currentTime = 0;
                 });
             } catch (e) {}
             document.body.removeEventListener('click', enableAudio);
             document.body.removeEventListener('touchstart', enableAudio);
             console.log("Audio Context Unlocked (Attempted)");
        };
        document.body.addEventListener('click', enableAudio, { once: true });
        document.body.addEventListener('touchstart', enableAudio, { once: true });
