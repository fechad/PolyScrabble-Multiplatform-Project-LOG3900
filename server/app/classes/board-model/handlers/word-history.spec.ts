import { expect } from 'chai';
import { describe } from 'mocha';
import { WordHistory } from './word-history';
import { DIRECT_PLACEMENT_HISTORY_MAX_LENGTH } from './word-history-constants';

const testWord = 'testWord';

describe('WordHistory tests', () => {
    let history: WordHistory;
    beforeEach(() => {
        history = new WordHistory();
    });
    it('should not register more direct placements than the limit', () => {
        for (let index = 0; index < DIRECT_PLACEMENT_HISTORY_MAX_LENGTH + 1; index++) {
            history.registerDirectPlacement(testWord);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- disabled for testing
        expect(history.directPlacementHistory.length).to.equals(DIRECT_PLACEMENT_HISTORY_MAX_LENGTH);
    });
    it('should pop the correct word when exceeding direct placement limit', () => {
        history.registerDirectPlacement('2');
        history.registerDirectPlacement('projet');
        history.registerDirectPlacement('love');
        history.registerDirectPlacement('I');
        expect(history.directPlacementHistory).to.deep.equals(['I', 'love', 'projet']);
    });
});
