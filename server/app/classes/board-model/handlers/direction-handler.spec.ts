import { expect } from 'chai';
import { describe } from 'mocha';
import { DirectionHandler } from './direction-handler';
describe('DirectionHandler tests', () => {
    it('should return vertical when asked to reverse Horizontal', () => {
        expect(DirectionHandler.reversePlacementDirection('h')).to.equals('v');
    });
    it('should return horizontal when asked to reverse Vertical', () => {
        expect(DirectionHandler.reversePlacementDirection('v')).to.equals('h');
    });
    it('should throw an error if string provided is not a valid direction', () => {
        try {
            DirectionHandler.getPlacementDirections('heaven');
        } catch (error) {
            expect(error.message).to.equals('Argument was not a valid direction');
        }
    });
});
