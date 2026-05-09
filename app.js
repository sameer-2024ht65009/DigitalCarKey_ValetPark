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

// Shows the loading screen and manual connect button
function transitionToLoading() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');
    
    // Create the connect button dynamically if it doesn't exist in your HTML
    if (!document.getElementById('connect-hw-btn')) {
        const btn = document.createElement('button');
        btn.id = 'connect-hw-btn';
        btn.className = 'tile';
        btn.style.cssText = "background: #4cd964; margin-top: 20px; width: 80%;";
        btn.innerText = "Connect to Vehicle";
        btn.onclick = connectToESP32;
        document.getElementById('loading-screen').appendChild(btn);
    }
}

// THE UPDATED CONNECTION LOGIC
async function connectToESP32() {
    const btn = document.getElementById('connect-hw-btn');
    btn.innerText = "Connecting...";
    
    try {
        // Step 1: Request Device (User Gesture Requirement)
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'Mercedes_DCK_Anchor' }],
            optionalServices: [SERVICE_UUID]
        });
        
        // Step 2: Connect to GATT Server
        const server = await device.gatt.connect();
        
        // Step 3: Wait 500ms for services to stabilize (Critical for ESP32)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 4: Get Service and Characteristic
        const service = await server.getPrimaryService(SERVICE_UUID);
        bleCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        // Step 5: Transition to Dashboard
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        
    } catch (error) {
        console.error("BLE Handshake Failed:", error);
        alert("Connection Failed: " + error.message);
        btn.innerText = "Retry Connection";
    }
}

async function triggerRelay(command) {
    if (!bleCharacteristic) {
        alert("Hardware not connected!");
        return;
    }

    try {
        // Send '1' for Unlock/Start, '0' for Lock
        const signal = (command === 'unlock' || command === 'start') ? "1" : "0";
        const data = new TextEncoder().encode(signal);
        await bleCharacteristic.writeValue(data);
        console.log(`Hardware: ${command} signal sent.`);
    } catch (error) {
        console.error("Transmission failed:", error);
    }
}
