import { expect } from 'chai';
import { ScoreMapper } from './score-mapper';
import { WordCollection } from './word-collection';

const testDic = {
    title: 'Test dictionary',
    description: 'test dic',
    words: ['aa'],
};
describe('ScoreMapper test', () => {
    it('createMap should create the correct map', () => {
        const map: Map<string, number> = new Map<string, number>();
        map.set('bon', 1);
        const expectedMap: Map<number, WordCollection> = new Map<number, WordCollection>();
        expectedMap.set(1, new WordCollection(['bon']));
        const result = ScoreMapper.createMap(map);

        expect([...result]).to.deep.equals([...expectedMap]);
    });
    it('formWordsMap should form a map with correct score', () => {
        const expectedMap: Map<string, number> = new Map<string, number>();
        expectedMap.set('aa', 2);
        const result = ScoreMapper.formWordsMap(testDic.words);

        expect([...result]).to.deep.equals([...expectedMap]);
    });
});
