import { Room } from '@app/classes/room-model/room';
import { RoomService } from '@app/services/room.service';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('Room service tests', () => {
    const roomMock: Room = new Room();
    roomMock.roomInfo.name = 'Room0';
    const roomService = new RoomService();

    it('should be empty on start', () => {
        expect(roomService.getNumberOfRooms()).to.equals(0);
    });

    describe('setUnavailable tests', () => {
        it('should reduce the number of available rooms when setUnavailable is called', () => {
            roomService.roomsAvailable = [roomMock];
            const nAvailableRooms = roomService.roomsAvailable.length;
            roomService.setUnavailable(roomMock.roomInfo.name);
            expect(roomService.roomsAvailable.length).to.equals(nAvailableRooms - 1);
        });

        it('should increment the number of unavailable rooms when setUnavailable is called', () => {
            roomService.roomsAvailable = [roomMock];
            const nUnavailableRooms = roomService.roomsUnavailable.length;
            roomService.setUnavailable(roomMock.roomInfo.name);
            expect(roomService.roomsUnavailable.length).to.equals(nUnavailableRooms + 1);
        });

        it('should put the correct available room to roomsUnavailable when setUnavailable is called', () => {
            roomService.roomsAvailable = [roomMock];
            roomService.setUnavailable(roomMock.roomInfo.name);
            expect(roomService.roomsUnavailable[0]).to.equals(roomMock);
        });

        it('should not do anything when setUnavailable is called with a room that does not exist', () => {
            roomService.roomsUnavailable = [roomMock];
            const nUnavailableRooms = roomService.roomsUnavailable.length;
            roomService.setUnavailable('invalidRoomName');
            expect(roomService.roomsUnavailable.length).to.equals(nUnavailableRooms);
        });
    });

    describe('setAvailable tests', () => {
        it('should reduce the number of unAvailable rooms when setAvailable is called', () => {
            roomService.roomsUnavailable = [roomMock];
            const nUnavailableRooms = roomService.roomsUnavailable.length;
            roomService.setAvailable(roomMock.roomInfo.name);
            expect(roomService.roomsUnavailable.length).to.equals(nUnavailableRooms - 1);
        });

        it('should increment the number of available rooms when setAvailable is called', () => {
            roomService.roomsUnavailable = [roomMock];
            const nAvailableRooms = roomService.roomsAvailable.length;
            roomService.setAvailable(roomMock.roomInfo.name);
            expect(roomService.roomsAvailable.length).to.equals(nAvailableRooms + 1);
        });

        it('should put the correct unavailable room to roomsAvailable when setAvailable is called', () => {
            roomService.roomsUnavailable = [roomMock];
            roomService.setAvailable(roomMock.roomInfo.name);
            expect(roomService.roomsAvailable[0]).to.equals(roomMock);
        });

        it('should not do anything when setAvailable is called with a room that does not exist', () => {
            roomService.roomsUnavailable = [roomMock];
            const nAvailableRooms = roomService.roomsAvailable.length;
            roomService.setAvailable('invalidRoomName');
            expect(roomService.roomsAvailable.length).to.equals(nAvailableRooms);
        });
    });

    describe('removeRoom tests', () => {
        it('should reduce the number of available rooms when removeRoom is called', () => {
            roomService.roomsAvailable = [roomMock];
            const nAvailableRooms = roomService.roomsAvailable.length;
            roomService.removeRoom(roomMock.roomInfo.name);
            expect(roomService.roomsAvailable.length).to.equals(nAvailableRooms - 1);
        });

        it('should reduce the number of unavailable rooms when removeRoom is called', () => {
            roomService.roomsUnavailable = [roomMock];
            const nUnavailableRooms = roomService.roomsUnavailable.length;
            roomService.removeRoom(roomMock.roomInfo.name);
            expect(roomService.roomsUnavailable.length).to.equals(nUnavailableRooms - 1);
        });

        it('should not decrement the number of rooms when removeRoom is called with a room that does not exist', () => {
            roomService.roomsAvailable = [roomMock];
            roomService.roomsUnavailable = [roomMock];
            const numberOfRooms = roomService.getNumberOfRooms();
            roomService.removeRoom('invalidRoomName');
            expect(roomService.getNumberOfRooms()).to.equals(numberOfRooms);
        });
    });

    it('should add the newly created room to the list of rooms available when createRoom is called', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to stub private method
        sinon.stub(roomService as any, 'convertToServerRoom').callsFake(() => {
            return roomMock;
        });
        const currentCount = roomService.roomCount;
        const nAvailableRooms = roomService.roomsAvailable.length;
        roomService.createRoom(roomMock);
        expect(roomService.roomsAvailable.length).to.equals(nAvailableRooms + 1);
        expect(roomService.roomCount).to.equals(currentCount + 1);
    });

    describe('getNumberOfRooms tests', () => {
        it('should return the correct number of room when getNumberOfRooms is called', () => {
            roomService.roomsAvailable = [roomMock];
            roomService.roomsUnavailable = [roomMock];
            const expectedResult = roomService.roomsAvailable.length + roomService.roomsUnavailable.length;
            const result = roomService.getNumberOfRooms();
            expect(result).to.equals(expectedResult);
        });

        it('should return the correct number of room when getNumberOfRooms is called and no room exist', () => {
            roomService.roomsAvailable = [];
            roomService.roomsUnavailable = [];
            const expectedResult = 0;
            const result = roomService.getNumberOfRooms();
            expect(result).to.equals(expectedResult);
        });
    });

    describe('get Rooms(Un)Available tests', () => {
        it('should return the available rooms when getAvailableRooms is called', () => {
            roomService.roomsAvailable = [roomMock];
            expect(roomService.roomsAvailable).to.equals(roomService.getRoomsAvailable());
        });

        it('should return the unavailable rooms when getUnavailableRooms is called', () => {
            roomService.roomsUnavailable = [roomMock];
            expect(roomService.roomsUnavailable).to.equals(roomService.getRoomsUnavailable());
        });
    });

    describe('getRoom tests', () => {
        it('should return undefined if the room does not exist on getRoom', () => {
            expect(roomService.getRoom('invalidName')).to.equals(undefined);
        });
        it('should return a room if it is in the roomsAvailable array on getRoom', () => {
            roomService.roomsAvailable = [roomMock];
            expect(roomService.getRoom(roomMock.roomInfo.name)).to.equals(roomMock);
        });
        it('should return a room if it is in the roomsUnavailable array on getRoom', () => {
            roomService.roomsAvailable = [];
            roomService.roomsUnavailable = [roomMock];
            expect(roomService.getRoom(roomMock.roomInfo.name)).to.equals(roomMock);
        });
    });

    describe('isRoomNameValid tests', () => {
        it('should return true if the room name is valid', () => {
            const result = roomService.isRoomNameValid(roomMock.roomInfo.name);
            expect(result).to.equal(true);
        });

        it('should return false if the room name is invalid', () => {
            const result = roomService.isRoomNameValid('invalidName');
            expect(result).to.equal(false);
        });
    });
});
