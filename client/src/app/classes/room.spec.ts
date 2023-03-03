import { Room } from './room';

describe('Room tests', () => {
    let room: Room;

    beforeEach(() => {
        room = new Room();
    });

    it('should create an instance', () => {
        expect(room).toBeTruthy();
    });
});
