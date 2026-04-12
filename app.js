const correctPin = "0900";
let enteredPin = "";

// Create Numpad Keys
const numpad = document.getElementById('numpad');
[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "X"].forEach(val => {
    const key = document.createElement('div');
    key.className = 'key';
    key.innerText = val;
    key.onclick = () => handleInput(val);
    numpad.appendChild(key);
});

function handleInput(val) {
    if (val === "" || val === "X") {
        enteredPin = "";
        updateDots();
        return;
    }

    if (enteredPin.length < 4) {
        enteredPin += val;
        updateDots();
    }

    if (enteredPin.length === 4) {
        if (enteredPin === correctPin) {
            transitionToLoading();
        } else {
            alert("Incorrect PIN");
            enteredPin = "";
            updateDots();
        }
    }
}

function updateDots() {
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`dot-${i}`).classList.toggle('active', i <= enteredPin.length);
    }
}

function transitionToLoading() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');
    
    // Simulate BLE Connection Delay (2.5 seconds)
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
    }, 2500);
}

function triggerRelay(command) {
    alert(`MOCK ESP32: Executing ${command} command via BLE...`);
}