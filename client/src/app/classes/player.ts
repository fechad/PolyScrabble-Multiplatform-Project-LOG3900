import { DEFAULT_ACCOUNT } from '@app/constants/default-user-settings';
import { ClientAccountInfo } from '@app/interfaces/serveur info exchange/client-account-info';

export class Player {
    email: string;
    socketId: string;
    points: number;
    isCreator: boolean;
    isItsTurn: boolean;
    clientAccountInfo: ClientAccountInfo;

    constructor() {
        this.clientAccountInfo = { ...DEFAULT_ACCOUNT };
        this.email = '';
        this.socketId = '';
        this.points = 0;
        this.isCreator = false; // Remove this from here, obsolete
        this.isItsTurn = false;
    }

    get avatarUrl(): string {
        return this.clientAccountInfo.userSettings.avatarUrl;
    }

    get pseudo(): string {
        return this.clientAccountInfo.username;
    }

    set pseudo(pseudo: string) {
        this.clientAccountInfo.username = pseudo;
    }

    // tested on game-page.component.spec.ts
    setPlayerGameAttributes(player: Player) {
        this.pseudo = player.pseudo;
        this.socketId = player.socketId;
        this.points = player.points;
        this.isCreator = player.isCreator;
        this.isItsTurn = player.isItsTurn;

        this.clientAccountInfo = player.clientAccountInfo;
    }

    resetPlayerInfo() {
        this.points = 0;
        this.isCreator = false; // Remove this from here, obsolete
        this.isItsTurn = false;
    }
}
