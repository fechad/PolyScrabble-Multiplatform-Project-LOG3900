/* eslint-disable @typescript-eslint/no-explicit-any */
// Disabling lint rules for imports
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
// Need to use require instead of import because of electron
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

let gameWindow;
let chatWindow;

function createWindow() {
    gameWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        backgroundColor: '#ffffff',
        focusable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    gameWindow.loadURL(path.join(__dirname, '/dist/client/index.html'));

    gameWindow.setMenuBarVisibility(false);

    gameWindow.on('closed', function () {
        gameWindow.destroy();
    });
}

app.on('ready', createWindow);

// https://stackoverflow.com/questions/32780726/how-to-access-dom-elements-in-electron
// https://stackoverflow.com/questions/55742327/how-to-send-data-between-electron-ipcmain-and-angular-ipcrenderer-asynchronously
ipcMain.on('open-chat', (event, data) => {
    store.set('player', data.player);
    store.set('room', data.room);
    store.set('account', data.account);
    chatWindow = new BrowserWindow({
        parent: gameWindow,
        height: 600,
        width: 600,
        closable: false,
        fullscreenable: true,
        maximizable: true,
        resizable: true,
        // modal: false,
        focusable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    // chatWindow.webContents.openDevTools();
    chatWindow.removeMenu();

    chatWindow.loadURL(path.join(__dirname, '/dist/client/index.html#chat'));
    chatWindow.show();
});

ipcMain.on('close-chat', (event) => {
    // childWindow.webContents.openDevTools();
    chatWindow.destroy();
});

ipcMain.handle('getStoreValue', (event, key) => {
    return store.get(key);
});
