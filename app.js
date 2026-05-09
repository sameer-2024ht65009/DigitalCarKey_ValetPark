const correctPin = "0900";
let enteredPin = "";

// Global variables for BLE connection
let bleCharacteristic = null;
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

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

// Updated to include Hardware Handshake
async function transitionToLoading() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');
    
    try {
        // Step 1: Connect to the Physical ESP32
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'Mercedes_DCK_Anchor' }],
            optionalServices: [SERVICE_UUID]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        bleCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        // Step 2: Show Dashboard once connected
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
    } catch (error) {
        console.error("BLE Handshake Failed:", error);
        alert("Vehicle Connection Failed. Ensure ESP32 is powered on.");
        // Revert to auth screen if hardware is missing
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.remove('hidden');
        enteredPin = "";
        updateDots();
    }
}

// Updated to send Actual Bluetooth Signals
async function triggerRelay(command) {
    if (!bleCharacteristic) {
        alert("Hardware not connected!");
        return;
    }

    try {
        // Send '1' for Unlock, '0' for Lock
        const signal = (command === 'unlock' || command === 'start') ? "1" : "0";
        const data = new TextEncoder().encode(signal);
        await bleCharacteristic.writeValue(data);
        console.log(`Hardware: ${command} signal sent.`);
    } catch (error) {
        console.error("Transmission failed:", error);
    }
}