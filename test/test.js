'use strict';

/**
 * For testing purposes are used mocha, chai, chaiaspromised modules.
 * Update variable `pathToInstalledApplication` according to the OS of yours.
 */

const Application = require('spectron').Application;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const pathToInstalledApplication = '/Applications/MyApp.app/Contents/MacOS/MyApp';

chai.should();
chai.use(chaiAsPromised);

describe('application launch', function () {
    beforeEach(function () {
        this.app = new Application({
            path: pathToInstalledApplication,
            args: ['TEST_MODE']
        });
        return this.app.start();
    });

    beforeEach(function () {
        chaiAsPromised.transferPromiseness = this.app.transferPromiseness;
    });

    afterEach(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    });

    it('opens a window', function () {
        return this.app.client.waitUntilWindowLoaded()
            .getWindowCount().should.eventually.equal(1);
    });

    it('opens a window which is NOT minimized', function () {
        return this.app.client.waitUntilWindowLoaded()
            .browserWindow.isMinimized().should.eventually.be.false;
    });

    it('opens a window where the devtools are not opened', function () {
        return this.app.client.waitUntilWindowLoaded()
            .browserWindow.isDevToolsOpened().should.eventually.be.false;
    });

    it('opens a window which is visible', function () {
        return this.app.client.waitUntilWindowLoaded()
            .browserWindow.isVisible().should.eventually.be.true;
    });

    it('opens a window which is focused', function () {
        return this.app.client.waitUntilWindowLoaded()
            .browserWindow.isFocused().should.eventually.be.true;
    });

    it('opens a window which has non zero width', function () {
        return this.app.client.waitUntilWindowLoaded()
            .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0);
    });

    it('opens a window which has non zero height', function () {
        return this.app.client.waitUntilWindowLoaded()
            .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0);
    });
});
