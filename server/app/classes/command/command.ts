import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { CommandResult } from '@app/interfaces/command-result';

export class Command {
    protected readonly command: string;
    protected readonly room: Room;
    protected readonly commandSender: Player;
    constructor(command: string, room: Room, sender: Player) {
        this.command = command;
        this.room = room;
        this.commandSender = sender;
    }
    execute(): CommandResult {
        return {
            commandType: 'command',
        };
    }
    protected isPlayerTurn(): boolean {
        return this.commandSender.isItsTurn;
    }
    protected splitCommand(): string[] {
        const splittedCommand = this.command.split(' ');
        splittedCommand[0] = splittedCommand[0].substring(1);
        return splittedCommand;
    }
}
