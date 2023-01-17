import { Player } from '@app/classes/player';
import { Room } from './room';

describe('Room tests', () => {
    let room: Room;
    let player: Player;
    let player2: Player;

    beforeEach(() => {
        room = new Room();
        player = new Player();
        player.socketId = 'id1';
        player2 = new Player();
        player2.socketId = 'id2';
    });
    it('should create an instance', () => {
        expect(room).toBeTruthy();
    });

    describe('addPlayer tests', () => {
        it('should increment room.players length on addPlayer', () => {
            const nCurrentPlayer = room.players.length;
            room.addPlayer(player);
            expect(room.players.length).toEqual(nCurrentPlayer + 1);
        });

        it('should not add the player if room.players has the max amount of player', () => {
            room.players = [player, player2];
            const nCurrentPlayer = room.players.length;
            room.addPlayer(player);
            expect(room.players.length).toEqual(nCurrentPlayer);
        });
    });

    describe('removePlayer tests', () => {
        it('should decrement room.players length on removePlayer', () => {
            room.players = [player];
            const nCurrentPlayer = room.players.length;
            room.removePlayer(player.socketId);
            expect(room.players.length).toEqual(nCurrentPlayer - 1);
        });

        it('should not remove the player if room.players does not have him', () => {
            room.players = [player];
            const nCurrentPlayer = room.players.length;
            room.removePlayer(player2.socketId);
            expect(room.players.length).toEqual(nCurrentPlayer);
        });
    });
});
