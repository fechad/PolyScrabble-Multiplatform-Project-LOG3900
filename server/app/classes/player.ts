import { Rack } from '@app/classes/rack';
import { DEFAULT_ACCOUNT } from '@app/constants/default-user-settings';
import { ClientAccountInfo } from '@app/interfaces/client-exchange/client-account-info';
import { CommandResult } from '@app/interfaces/command-result';

export class Player {
    socketId: string;
    points: number;
    rack: Rack;
    isCreator: boolean;
    isItsTurn: boolean;
    managerId: number;
    lastThreeCommands?: CommandResult[];
    accountID?: string;
    gaveUpUnfairly?: boolean;
    clientAccountInfo: ClientAccountInfo;

    constructor(socketId: string, pseudo: string, isCreator: boolean, clientAccountInfo?: ClientAccountInfo) {
        this.clientAccountInfo = clientAccountInfo ? { ...clientAccountInfo } : { ...DEFAULT_ACCOUNT };
        if (pseudo) this.pseudo = pseudo;
        this.socketId = socketId;
        this.rack = new Rack('');
        this.isCreator = isCreator;
        this.points = 0;
        this.isItsTurn = false;
        this.lastThreeCommands = new Array<CommandResult>();
    }

    get avatarUrl(): string {
        if (!this.clientAccountInfo) return '';
        return this.clientAccountInfo.userSettings.avatarUrl;
    }

    get pseudo() {
        return this.clientAccountInfo.username;
    }

    set pseudo(pseudo: string) {
        this.clientAccountInfo.username = pseudo;
    }

    replaceRack(rack: Rack) {
        this.rack = rack;
    }

    addCommand(command: CommandResult) {
        if (!this.lastThreeCommands) return;
        this.lastThreeCommands?.splice(0, 0, command);
        if (this.lastThreeCommands?.length > 3) {
            this.lastThreeCommands?.splice(this.lastThreeCommands?.length - 1, 1);
        }
    }
}
