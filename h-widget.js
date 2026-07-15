import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7p9HknzV6mmX3Fe78U-l46DqY0fikC58",
    authDomain: "hgt-policy.firebaseapp.com",
    projectId: "hgt-policy",
    storageBucket: "hgt-policy.firebasestorage.app",
    messagingSenderId: "440193588775",
    appId: "1:440193588775:web:49fe3fb7d8ee3e008cf802",
    measurementId: "G-X18YPTYQCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Capture Website Information
const currentHostname = window.location.hostname; // e.g., example.com
const currentURL = window.location.href; // e.g., https://example.com/page

// Master Control Switch & Initialization
async function checkAccessAndInit() {
    try {
        // Query Firestore for admin control status
        const accessRef = doc(db, "access_control", currentHostname || "local");
        const accessSnap = await getDoc(accessRef);

        // If document exists and is marked false, completely block the website
        if (accessSnap.exists() && accessSnap.data().is_active === false) {
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; width: 100vw; background-color: #031124; color: white; font-family: 'Segoe UI', Tahoma, sans-serif; text-align: center; padding: 20px; box-sizing: border-box; margin: 0; position: fixed; top: 0; left: 0; z-index: 9999999;">
                    <h1 style="color: #ff4c4c; max-width: 800px; font-weight: bold;">This website violates the HDPA privacy policy.</h1>
                </div>
            `;
            return; // Stop any further execution
        } else {
            // Website is allowed, inject widget and splash screen
            injectWidget();
        }
    } catch (error) {
        console.error("H Widget Error:", error);
        // Default to loading the widget if the network fails so the host site isn't broken
        injectWidget(); 
    }
}

// Dynamic HTML/CSS Injection & Logic
function injectWidget() {
    // 1. Inject CSS Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #hdpa-splash {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #031124; z-index: 999999; display: flex;
            flex-direction: column; justify-content: center; align-items: center;
            transition: opacity 0.8s ease; padding: 20px; box-sizing: border-box; text-align: center; margin: 0;
        }
        #hdpa-splash img { max-width: 240px; height: auto; margin-bottom: 25px; animation: pulse 2s infinite; }
        
        .glow-title { 
            color: #ffffff; margin: 0 0 10px 0; font-size: 26px; font-weight: 800; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            text-shadow: 0 0 10px #48abe0, 0 0 20px #48abe0, 0 0 30px #48abe0;
            animation: glow-anim 1.5s ease-in-out infinite alternate;
        }
        @keyframes glow-anim {
            from { text-shadow: 0 0 10px #48abe0, 0 0 20px #48abe0; }
            to { text-shadow: 0 0 10px #48abe0, 0 0 20px #48abe0, 0 0 30px #48abe0, 0 0 40px #48abe0; }
        }

        .progress-wrapper { position: relative; margin-top: 35px; width: 80px; height: 80px; font-family: sans-serif; }
        .progress-ring__circle {
            stroke-dasharray: 213.6; stroke-dashoffset: 213.6; transition: stroke-dashoffset 8s linear;
            stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50% 50%;
        }
        .ring-bg { opacity: 0.2; }
        .progress-text {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; justify-content: center; align-items: center;
            color: white; font-weight: bold; font-size: 15px;
        }

        #hdpa-widget-btn {
            position: fixed; bottom: 20px; right: 20px; z-index: 999998;
            width: 56px; height: 56px; border-radius: 50%;
            background: #ff9800; color: white; display: flex;
            justify-content: center; align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer;
            user-select: none; transition: left 0.5s ease, right 0.5s ease;
        }
        #hdpa-widget-btn svg { width: 28px; height: 28px; fill: white; }

        #hdpa-report-modal {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.6); z-index: 1000000;
            display: none; justify-content: center; align-items: center;
            padding: 20px; box-sizing: border-box; backdrop-filter: blur(5px);
            font-family: 'Segoe UI', Tahoma, sans-serif;
        }
        .hdpa-modal-card {
            background: #ffffff; border-radius: 12px; width: 100%; max-width: 400px;
            padding: 30px; box-sizing: border-box; position: relative; text-align: left;
        }
        .hdpa-modal-card h3 { margin: 0 0 15px 0; color: #333; font-size: 20px; }
        .hdpa-modal-card label { display: block; margin-bottom: 5px; color: #666; font-size: 13px; font-weight: 600; }
        .hdpa-modal-card input, .hdpa-modal-card textarea {
            width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ccc;
            border-radius: 6px; box-sizing: border-box; font-family: inherit; font-size: 14px; outline: none;
        }
        .hdpa-modal-card textarea { resize: none; height: 100px; }
        .hdpa-modal-submit {
            background: #008751; color: white; border: none; padding: 12px;
            width: 100%; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 15px;
        }
        .hdpa-modal-close {
            position: absolute; top: 15px; right: 15px; background: none;
            border: none; font-size: 24px; cursor: pointer; color: #999;
        }

        #hdpa-toast {
            position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
            background: #333; color: #fff; padding: 10px 20px; border-radius: 20px;
            font-size: 13px; z-index: 1000001; opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
            font-family: 'Segoe UI', Tahoma, sans-serif; white-space: nowrap;
        }

        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML Elements
    const widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = `
        <div id="hdpa-splash">
            <img src="https://cdn.phototourl.com/free/2026-07-13-b04fcd38-f6d4-4406-b3f8-daf40903fda0.png" alt="HDPA Logo">
            <h2 class="glow-title">This website Is Under The Protection Of Henry Authority for Data Protection and Regulatory Accountability(HDPA)</h2>
            <div class="progress-wrapper">
                <svg class="progress-ring" width="80" height="80">
                    <circle stroke="#ffffff" stroke-width="4" fill="transparent" r="34" cx="40" cy="40" class="ring-bg"/>
                    <circle class="progress-ring__circle" stroke="#48abe0" stroke-width="5" fill="transparent" r="34" cx="40" cy="40"/>
                </svg>
                <div class="progress-text" id="progress-text">0%</div>
            </div>
        </div>

        <div id="hdpa-widget-btn">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </div>

        <div id="hdpa-report-modal">
            <div class="hdpa-modal-card">
                <button class="hdpa-modal-close" id="hdpa-close-btn">&times;</button>
                <h3>How is this website treating you?</h3>
                <label>REPORT TITLE</label>
                <input type="text" id="hdpa-report-title" placeholder="e.g., Unwanted Tracking">
                <label>DESCRIPTION</label>
                <textarea id="hdpa-report-desc" placeholder="Explain your experience here..."></textarea>
                <button class="hdpa-modal-submit" id="hdpa-submit-btn">Post Report</button>
            </div>
        </div>
        <div id="hdpa-toast"></div>
    `;
    document.body.appendChild(widgetContainer);

    // 3. Splash Screen Logic (8 Seconds)
    setTimeout(() => { document.querySelector('.progress-ring__circle').style.strokeDashoffset = "0"; }, 50);

    let progress = 0;
    const pText = document.getElementById('progress-text');
    const interval = setInterval(() => {
        progress += 1;
        pText.innerText = Math.min(progress, 100) + '%';
        if(progress >= 100) clearInterval(interval);
    }, 80); 

    setTimeout(() => {
        const splash = document.getElementById('hdpa-splash');
        splash.style.opacity = '0';
        setTimeout(() => splash.style.display = 'none', 800); // Exposes website, widget remains
    }, 8000);

    // 4. Alternating Widget Logic
    const widgetBtn = document.getElementById('hdpa-widget-btn');
    let isRight = true;
    setInterval(() => {
        if (isRight) {
            widgetBtn.style.right = 'auto'; widgetBtn.style.left = '20px'; isRight = false;
        } else {
            widgetBtn.style.left = 'auto'; widgetBtn.style.right = '20px'; isRight = true;
        }
    }, 60000);

    // 5. Long Press Logic (Corrected branding to "H")
    let pressTimer; let isLongPress = false;
    const toast = document.getElementById('hdpa-toast');

    function showToast(msg) {
        toast.innerText = msg; toast.style.opacity = '1';
        setTimeout(() => toast.style.opacity = '0', 2500);
    }
    const startPress = () => {
        isLongPress = false;
        pressTimer = setTimeout(() => { isLongPress = true; showToast("Powered by H, Henry Global Tech Industry"); }, 1000);
    };
    const cancelPress = () => clearTimeout(pressTimer);

    widgetBtn.addEventListener('mousedown', startPress);
    widgetBtn.addEventListener('touchstart', startPress, { passive: true });
    widgetBtn.addEventListener('mouseup', cancelPress);
    widgetBtn.addEventListener('touchend', cancelPress);
    widgetBtn.addEventListener('mouseleave', cancelPress);

    // 6. Modal Logic
    const modal = document.getElementById('hdpa-report-modal');
    widgetBtn.addEventListener('click', () => { if (!isLongPress) modal.style.display = 'flex'; });
    document.getElementById('hdpa-close-btn').addEventListener('click', () => modal.style.display = 'none');

    // 7. Firebase Post Logic with URL Documentation
    document.getElementById('hdpa-submit-btn').addEventListener('click', async () => {
        const title = document.getElementById('hdpa-report-title').value.trim();
        const desc = document.getElementById('hdpa-report-desc').value.trim();
        const btn = document.getElementById('hdpa-submit-btn');

        if (!title || !desc) { alert("Please complete both fields."); return; }
        btn.innerText = "Posting...";
        try {
            await addDoc(collection(db, "reports"), { 
                title: title, 
                description: desc, 
                timestamp: new Date().toISOString(),
                websiteURL: currentURL // Saves the host website URL directly to Firestore
            });
            alert("Report successfully sent to H Data Servers."); 
            modal.style.display = 'none';
            document.getElementById('hdpa-report-title').value = '';
            document.getElementById('hdpa-report-desc').value = '';
        } catch (error) { 
            alert("Failed to send. Please try again."); 
        }
        btn.innerText = "Post Report";
    });
}

// Execute Script
checkAccessAndInit();
