'use strict';

//----------------------------------------------------------------------
/**
 * Uncomment this while on development stage.
 */
// process.env.NODE_ENV = 'development';
//----------------------------------------------------------------------

const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const config = require('./config/config');
const applicationProtocolName = config.get('applicationProtocolName');
const mainWebAppUrl = config.get('mainWebAppUrl');

let mainWindow;
let forceAppQuit = false;

const applyExternalData = function (mainWindow, commandLine, currentUrl) {
    let data;

    if (commandLine && commandLine[1] && commandLine[1].indexOf(`${applicationProtocolName}://`) === 0) {
        data = commandLine[1].replace(`${applicationProtocolName}://`, '');

        // remove the added slash at the end
        data = data.replace(/\/\s*$/, '');

        /**
         * UPDATE this according to the needs of the application
         * to get external data.
         */
        mainWindow.webContents.executeJavaScript(`window.dispatchEvent(new Event(${data}))`);
    }
};

const focusWindow = function (mainWindow = mainWindow) {
    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }
    mainWindow.show(); // shows and gives focus
};

const onOpen = function (e, data) {
    if (mainWindow) {
        e.preventDefault();
        mainWindow.send('dispatch', 'onOpen', data);
        /**
         * Links opened from Chrome won't focus the app without a setTimeout. The
         * confirmation dialog Chrome shows causes Chrome to steal back the focus.
         * Electron issue: https://github.com/atom/electron/issues/4338
         */
        setTimeout(() => {
            focusWindow(mainWindow);
        }, 100);
    }
};

// Logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Main application window
function createElectronWindow() {
    app.on('open-file', onOpen);
    app.on('open-url', onOpen);
    /**
     * Creating the Browse window.
     */
    mainWindow = new BrowserWindow({
        webPreferences: {
            webSecurity: false
        }
    });

    /**
     * Devtools of electron.
     * Uncomment this only in case of development
     */
    //mainWindow.webContents.openDevTools();

    /**
     * Shows confirmation dialog.
     * Shows when the user attempts to close the application.
     */
    mainWindow.on('close', (e) => {
        if (!forceAppQuit) {
            e.preventDefault();
            dialog.showMessageBox(
                mainWindow, {
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Warning',
                    message: 'Are you sure you want to close the application?'
                },
                (res) => {
                    if (res === 0) {
                        if (process.platform != 'darwin') {
                            forceAppQuit = true;
                            app.quit();
                        } else {
                            app.hide();
                            mainWindow.destroy();
                        }
                    }
                }
            );
        }
    });

    /**
     * Empty the mainWindow variable after the application is closed.
     */
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.on('certificate-error', (ev) => {
        log.info(`certificate-error: ${ev}`);
    });


    mainWindow.maximize();
    mainWindow.loadURL(mainWebAppUrl);

    /**
     * Seta specific protocol of the application
     * so 3rd party applications could use it.
     */
    if (!app.isDefaultProtocolClient(applicationProtocolName)) app.setAsDefaultProtocolClient(applicationProtocolName);

    /**
     * FOR OSX
     * On OS X the system enforces single instance automatically when users try to open a second instance of
     * your app in Finder, and the open-file and open-url events will be emitted for that. However when users
     * start your app in command line the system's single instance mechanism will be bypassed and you have to
     * use this method to ensure single instance.
     */

    let shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
        if (mainWindow) {
            focusWindow(mainWindow);
            applyExternalData(mainWindow, commandLine, mainWebAppUrl);
        }
    });

    if (shouldQuit) {
        forceAppQuit = true;
        app.quit();
        return;
    } else {
        applyExternalData(mainWindow, process.argv, mainWebAppUrl);
    }

    return mainWindow;
}

/**
 * Auto updates.
 * For details about these events, see the Wiki:
 *      https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
 * The app doesn't actually need to listen to any events except `update-downloaded`
 */
autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
});
autoUpdater.on('update-available', (ev, info) => {
    log.info('Update available.');
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update is available',
        message: `The application will be updated in a few seconds.\n
                  Please do NOT log in.\n
                  Click OK to continue.`
    });
});
autoUpdater.on('download-progress', (ev, progressObj) => {
    log.info('Download progress...');
});
autoUpdater.on('update-downloaded', (ev, info) => {
    log.info('Update downloaded and will be installed now');
    forceAppQuit = true;
    autoUpdater.quitAndInstall();
});
autoUpdater.on('update-not-available', (ev, info) => {
    log.info('Update is not available.');
});
autoUpdater.on('error', (ev, err) => {
    log.info(`Error in auto-updater. Error: ${err}`);
});

/**
 * App event listeners
 */
app.on('ready', () => {
    createElectronWindow();
    autoUpdater.checkForUpdates();
});

app.on('window-all-closed', () => {
    app.quit();
});
