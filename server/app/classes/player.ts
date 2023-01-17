import { Rack } from '@app/classes/rack';
import { CommandResult } from '@app/interfaces/command-result';

export class Player {
    pseudo: string;
    socketId: string;
    points: number;
    rack: Rack;
    isCreator: boolean;
    isItsTurn: boolean;
    managerId: number;
    lastThreeCommands?: CommandResult[];

    constructor(socketId: string, pseudo: string, isCreator: boolean) {
        this.pseudo = pseudo;
        this.socketId = socketId;
        this.rack = new Rack('');
        this.isCreator = isCreator;
        this.points = 0;
        this.isItsTurn = false;
        this.lastThreeCommands = new Array<CommandResult>();
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
