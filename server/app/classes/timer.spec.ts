import { expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { Timer } from './timer';

describe('Timer tests', () => {
    it('call the correct methods on timer', async () => {
        const clearTimeoutSpy = sinon.spy(setTimeout);
        await Timer.wait(1);
        expect(clearTimeoutSpy.called);
    });
});
