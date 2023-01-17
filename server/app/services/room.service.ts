import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { DEFAULT_ROOM_NAME } from '@app/constants/constants';
import { Service } from 'typedi';

@Service()
export class RoomService {
    roomsAvailable: Room[];
    roomsUnavailable: Room[];
    roomsToPick: Room[];
    roomCount: number;

    constructor() {
        this.roomCount = 0;
        this.roomsAvailable = [];
        this.roomsUnavailable = [];
        this.roomsToPick = [];
    }

    isRoomNameValid(roomName: string | undefined): boolean {
        if (typeof roomName !== 'string') return false;
        if (!roomName.startsWith(DEFAULT_ROOM_NAME)) return false;
        return true;
    }

    createRoom(room: Room): Room {
        const serverRoom = this.convertToServerRoom(room);
        serverRoom.roomInfo.name = DEFAULT_ROOM_NAME + this.roomCount;
        this.roomCount++;
        this.roomsAvailable.push(serverRoom);
        return serverRoom;
    }

    getNumberOfRooms(): number {
        return this.roomsAvailable.length + this.roomsUnavailable.length;
    }

    setUnavailable(roomName: string) {
        const roomToRemove = this.roomsAvailable.find((element) => element.roomInfo.name === roomName);
        if (!roomToRemove) return;
        this.roomsAvailable.splice(this.roomsAvailable.indexOf(roomToRemove), 1);
        this.roomsUnavailable.push(roomToRemove);
    }

    setAvailable(roomName: string) {
        const roomToSetAvailable = this.roomsUnavailable.find((element) => element.roomInfo.name === roomName);
        if (!roomToSetAvailable) return;
        this.roomsUnavailable.splice(this.roomsUnavailable.indexOf(roomToSetAvailable), 1);
        this.roomsAvailable.push(roomToSetAvailable);
    }

    removeRoom(roomName: string) {
        const roomAvailableToRemove = this.roomsAvailable.find((element) => element.roomInfo.name === roomName);
        const roomUnavailableToRemove = this.roomsUnavailable.find((element) => element.roomInfo.name === roomName);
        if (roomAvailableToRemove) {
            this.roomsAvailable.splice(this.roomsAvailable.indexOf(roomAvailableToRemove), 1);
        }
        if (roomUnavailableToRemove) {
            this.roomsUnavailable.splice(this.roomsUnavailable.indexOf(roomUnavailableToRemove), 1);
        }
    }

    getRoom(roomName: string): Room | undefined {
        const roomAvailable = this.roomsAvailable.find((element) => element.roomInfo.name === roomName);
        const roomUnavailable = this.roomsUnavailable.find((element) => element.roomInfo.name === roomName);
        if (roomAvailable) {
            return roomAvailable;
        } else if (roomUnavailable) {
            return roomUnavailable;
        }
        return undefined;
    }

    getRoomsAvailable(): Room[] {
        return this.roomsAvailable;
    }
    getRoomsUnavailable(): Room[] {
        return this.roomsUnavailable;
    }

    private convertToServerRoom(clientRoom: Room): Room {
        const serverRoom = new Room(clientRoom);
        for (const player of clientRoom.players) {
            serverRoom.addPlayer(new Player(player.socketId, player.pseudo, player.isCreator));
        }
        return serverRoom;
    }
}
