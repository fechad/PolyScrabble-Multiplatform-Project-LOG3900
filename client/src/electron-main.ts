// Disabling lint rules for imports
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
// Need to use require instead of import because of electron
const { app, BrowserWindow } = require('electron');

function createWindow() {
    const window = new BrowserWindow({
        width: 1920,
        height: 1080,
        backgroundColor: '#ffffff',
    });
    window.loadURL('http://localhost:4200');

    window.on('closed', function () {
        window.destroy();
    });
}
app.on('ready', createWindow);
