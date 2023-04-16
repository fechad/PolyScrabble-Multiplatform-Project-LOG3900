import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { DEFAULT_ROOM_NAME } from '@app/constants/constants';
import { Service } from 'typedi';

@Service()
export class RoomService {
    roomsAvailable: Room[];
    roomsUnavailable: Room[];
    roomCount: number;
    private roomToDelete?: Room;
    constructor() {
        this.roomCount = 0;
        this.roomsAvailable = [];
        this.roomsUnavailable = [];
    }

    getRoomsPublic(): Room[] {
        const publicUnavailableRoom = this.roomsUnavailable.filter((room) => !room.isSolo && room.roomInfo.isPublic);
        const publicAvailableRoom = this.roomsAvailable.filter((room) => !room.isSolo && room.roomInfo.isPublic);

        return publicUnavailableRoom.concat(publicAvailableRoom).map((room) => this.getLightVersionRoom(room));
    }

    getRoomsAvailable(): Room[] {
        return this.roomsAvailable.map((room) => this.getLightVersionRoom(room));
    }

    getRoomsUnavailable(): Room[] {
        return this.roomsUnavailable.map((room) => this.getLightVersionRoom(room));
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
            const roomIndex = this.roomsAvailable.indexOf(roomAvailableToRemove);
            this.roomsAvailable.splice(roomIndex, 1);
            roomAvailableToRemove.reset();
            this.roomToDelete = roomAvailableToRemove;
        }
        if (roomUnavailableToRemove) {
            const roomIndex = this.roomsUnavailable.indexOf(roomUnavailableToRemove);
            this.roomsUnavailable.splice(roomIndex, 1);
            roomUnavailableToRemove.reset();
            this.roomToDelete = roomUnavailableToRemove;
        }
        delete this.roomToDelete;
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

    getLightRoom(roomName: string): Room | undefined {
        const wantedRoom = this.getRoom(roomName);
        return wantedRoom ? this.getLightVersionRoom(wantedRoom) : undefined;
    }

    private getLightVersionRoom(room: Room): Room {
        const copy = {
            elapsedTime: room.elapsedTime,
            players: room.players,
            observers: room.observers,
            roomInfo: room.roomInfo,
            botsLevel: room.botsLevel,
            placementsData: room.placementsData,
        };
        return copy as unknown as Room;
    }

    private convertToServerRoom(clientRoom: Room): Room {
        const serverRoom = new Room(clientRoom);
        for (const player of clientRoom.players) {
            serverRoom.addPlayer(
                new Player(player.socketId, player.pseudo, player.isCreator, player.clientAccountInfo),
                serverRoom.roomInfo.password,
            );
        }
        return serverRoom;
    }
}
