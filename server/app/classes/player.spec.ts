import { Player } from '@app/classes/player';
import { Rack } from '@app/classes/rack';
import { CommandResult } from '@app/interfaces/command-result';
import { expect } from 'chai';
import { describe } from 'mocha';
import { CommandVerbs } from './command/command-verbs';

describe('Player tests', () => {
    const socketID = 'socketID1';
    const pseudo = 'Huuge';
    const isCreator = true;

    let player: Player;
    beforeEach(() => {
        player = new Player(socketID, pseudo, isCreator);
        player.lastThreeCommands = new Array<CommandResult>();
    });
    it('should replace correctly the player"s rack', () => {
        const newRack = new Rack('');
        player.replaceRack(newRack);
        expect(player.rack).to.equal(newRack);
    });
    it('should add correctly the last command when it is empty', () => {
        const command: CommandResult = { commandType: CommandVerbs.PLACE };
        const commands = [command];
        player.addCommand(command);
        expect(player.lastThreeCommands).to.deep.equal(commands);
    });
    it('should add correctly the last command', () => {
        const command1: CommandResult = { commandType: CommandVerbs.PLACE };
        const command2: CommandResult = { commandType: CommandVerbs.SKIP };
        player.addCommand(command1);
        player.addCommand(command2);
        const commands = [command2, command1];
        expect(player.lastThreeCommands).to.deep.equal(commands);
    });
    it('should add correctly and remove the oldest element  the last command when length is 3', () => {
        const command1: CommandResult = { commandType: CommandVerbs.PLACE };
        const command2: CommandResult = { commandType: CommandVerbs.SKIP };
        const command3: CommandResult = { commandType: CommandVerbs.BANK };
        const command4: CommandResult = { commandType: CommandVerbs.HINT };
        player.addCommand(command1);
        player.addCommand(command2);
        player.addCommand(command3);
        player.addCommand(command4);
        const commands = [command4, command3, command2];
        expect(player.lastThreeCommands).to.deep.equal(commands);
    });
});
