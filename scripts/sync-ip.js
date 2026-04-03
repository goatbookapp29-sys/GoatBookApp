const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Finds the local IPv4 address of the host machine.
 * Prioritizes Wi-Fi (en0) or Ethernet interfaces.
 */
function getLocalAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (loopback) and non-ipv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

function updateFiles() {
    const ip = getLocalAddress();
    console.log(`📡 Detected Local IP: ${ip}`);

    const ROOT_DIR = path.join(__dirname, '..');
    const FRONTEND_API_PATH = path.join(ROOT_DIR, 'frontend', 'src', 'api', 'index.js');
    const BACKEND_SERVER_PATH = path.join(ROOT_DIR, 'backend', 'server.js');

    // 1. Update Frontend API
    if (fs.existsSync(FRONTEND_API_PATH)) {
        let content = fs.readFileSync(FRONTEND_API_PATH, 'utf8');
        // Regex to match the BASE_URL assignment with an IP address
        const frontendRegex = /const BASE_URL = 'http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:5001\/api';/;
        if (frontendRegex.test(content)) {
            content = content.replace(frontendRegex, `const BASE_URL = 'http://${ip}:5001/api';`);
            fs.writeFileSync(FRONTEND_API_PATH, content);
            console.log(`✅ Updated Frontend API with IP: ${ip}`);
        } else {
            console.warn('⚠️ Could not find BASE_URL pattern in frontend/src/api/index.js');
        }
    }

    // 2. Update Backend Server CORS
    if (fs.existsSync(BACKEND_SERVER_PATH)) {
        let content = fs.readFileSync(BACKEND_SERVER_PATH, 'utf8');
        // Regex to match the IP in the CORS origin array
        const serverRegex = /'http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:8081'/;
        if (serverRegex.test(content)) {
            content = content.replace(serverRegex, `'http://${ip}:8081'`);
            fs.writeFileSync(BACKEND_SERVER_PATH, content);
            console.log(`✅ Updated Backend CORS with IP: ${ip}`);
        } else {
            console.warn('⚠️ Could not find IP pattern in backend/server.js CORS configuration');
        }
    }
}

updateFiles();
