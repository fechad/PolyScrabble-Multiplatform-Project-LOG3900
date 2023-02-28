import { Player } from '@app/classes/player';

export interface JoinRoomForm {
    roomName: string;
    player: Player;
    password: string;
}
