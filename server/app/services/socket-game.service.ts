import { CommandVerbs } from '@app/classes/command/command-verbs';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { Timer } from '@app/classes/timer';
import { COUNT_PLAYER_TURN, END_TIMER_VALUE, ONE_SECOND_IN_MS, SYSTEM_NAME, THREE_SECONDS_IN_MS } from '@app/constants/constants';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { ChatMessage } from '@app/interfaces/chat-message';
import { CommandResult } from '@app/interfaces/command-result';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import * as io from 'socket.io';
import { SocketHandlerService } from './socket-handler.service';

export class SocketGameService extends SocketHandlerService {
    handleGetPlayerInfo(socket: io.Socket, roomName: string) {
        this.updatePlayerView(socket, roomName);
    }

    handleGetRackInfo(socket: io.Socket, roomName: string) {
        if (!this.isRoomAndPlayerValid(socket, roomName)) return;
        const player = (this.roomService.getRoom(roomName) as Room).getPlayer(socket.id) as Player;
        this.socketEmit(socket, 'drawRack', player.rack.getLetters());
    }

    handleGetAllGoals(socket: io.Socket) {
        if (!this.isRoomValid(socket)) return;
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const goals = room.getAllGoals();
        this.sendToEveryoneInRoom(roomName, 'goalsUpdated', goals);
    }

    handleMessage(socket: io.Socket, message: string) {
        this.chatMessageService.restore();
        this.sendToEveryoneInRoom(socket.id, 'messageReceived');
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const isCommand = this.commandController.hasCommandSyntax(message);
        if (!isCommand) {
            const chatMessage = this.convertToChatMessage(room, socket.id, message);
            this.socketEmitRoom(socket, room.roomInfo.name, 'message', chatMessage);
            return;
        }
        const commandSender = room.getPlayer(socket.id) as Player;
        const executionResult: CommandResult = this.commandController.executeCommand(message, room, commandSender) as CommandResult;
        if (this.chatMessageService.isError) {
            this.chatMessageService.message.sender = SYSTEM_NAME;
            this.chatMessageService.message.color = MessageSenderColors.SYSTEM;
            this.sendToEveryoneInRoom(socket.id, 'message', this.chatMessageService.message);
            return;
        }
        if (room.turnPassedCounter >= COUNT_PLAYER_TURN) {
            this.handleGamePassFinish(room);
            return;
        }
        this.notifyViewBasedOnCommandResult(executionResult, room, commandSender, socket);
        const currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;
        this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.pseudo);
        if (!room.isGameFinished()) return;
        this.handleGamePlaceFinish(room, socket.id);
    }
    handleStartGame(socket: io.Socket) {
        const roomName = this.getSocketRoom(socket);
        if (!roomName) return;
        const room = this.roomService.getRoom(roomName) as Room;
        if (!room) return;
        if (room.players.length !== room.maxPlayers) return;
        room.choseRandomTurn();
        const currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;

        const player = room.getPlayer(socket.id);
        if (!player) return;
        this.socketEmit(socket, 'updatePlayerScore', player);
        this.sendToEveryoneInRoom(roomName, 'playerTurnChanged', currentTurnPlayer.pseudo);
        this.socketEmit(socket, 'lettersBankCountUpdated', room.letterBank.getLettersCount());
        this.socketEmit(socket, 'drawRack', player.rack.getLetters());

        if (room.hasTimer()) return;
        this.setTimer(room);
        const botGreeting = room.getBotGreeting();
        if (botGreeting) this.handleBotGreeting(room.bot.pseudo, botGreeting, roomName);
        if (room.roomInfo.gameType !== 'log2990') return;
        room.givesPlayerGoals();
    }

    handleChangeTurn(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        this.changeTurn(room);
    }

    async handleBotPlayAction(socket: io.Socket) {
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) {
            this.sendToEveryoneInRoom(roomName, 'botPlayedAction', FullCommandVerbs.SKIP);
            return;
        }

        await Timer.wait(THREE_SECONDS_IN_MS);
        const message = await room.bot.playTurn();
        this.sendToEveryoneInRoom(roomName, 'botPlayedAction', message);
        this.socketEmitRoom(socket, roomName, 'message', { text: message, sender: room.bot.pseudo, color: MessageSenderColors.PLAYER2 });
    }

    setTimer(room: Room) {
        if (!room) return;
        room.stopOtherTimerCreation();
        const timerInterval = setInterval(() => {
            if (room.elapsedTime < 0) {
                clearInterval(timerInterval);
                return;
            }
            ++room.elapsedTime;
            if (room.elapsedTime >= +room.roomInfo.timerPerTurn) {
                const currentPlayer = room.getCurrentPlayerTurn();
                if (!currentPlayer) return;
                this.sendToEveryoneInRoom(currentPlayer.socketId, 'message', {
                    text: '!passer',
                    sender: 'Vous',
                    color: MessageSenderColors.PLAYER1,
                });
                const otherPlayer = room.players.find((playerInRoom) => playerInRoom !== currentPlayer);
                if (!otherPlayer) return;
                this.sendToEveryoneInRoom(otherPlayer.socketId, 'message', {
                    text: `${currentPlayer.pseudo} a passé son tour`,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                this.changeTurn(room);
            } else {
                this.sendToEveryoneInRoom(room.roomInfo.name, 'timeUpdated', room);
            }
        }, ONE_SECOND_IN_MS);
    }

    changeTurn(room: Room) {
        if (!room) return;
        room.elapsedTime = 0;
        room.incrementTurnPassedCounter();
        if (!room.canChangePlayerTurn()) {
            this.handleGamePassFinish(room);
            return;
        }
        room.changePlayerTurn();

        const currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;
        this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.pseudo);
        return;
    }

    private handleBotGreeting(name: string, greeting: string, roomName: string) {
        const chatMessage: ChatMessage = { sender: name, text: greeting, color: MessageSenderColors.PLAYER2 };
        this.sendToEveryoneInRoom(roomName, 'message', chatMessage);
    }

    private isRoomAndPlayerValid(socket: io.Socket, roomName: string): boolean {
        const room = this.roomService.getRoom(roomName);
        if (!room) return false;
        if (!room.getPlayer(socket.id)) return false;
        return true;
    }

    private isRoomValid(socket: io.Socket): boolean {
        if (!this.getSocketRoom(socket)) return false;
        if (!this.roomService.getRoom(this.getSocketRoom(socket) as string)) return false;
        return true;
    }

    private notifyViewBasedOnCommandResult(report: CommandResult, room: Room, sender: Player, socket: io.Socket) {
        if (!report || !room || !sender) return;
        switch (report.commandType) {
            case CommandVerbs.PLACE:
                this.sendToEveryoneInRoom(room.roomInfo.name, 'drawBoard', report.commandData);
                this.sendToEveryoneInRoom(room.roomInfo.name, 'updatePlayerScore', sender);
                this.sendToEveryoneInRoom(sender.socketId, 'drawRack', sender.rack.getLetters());
                this.sendToEveryoneInRoom(room.roomInfo.name, 'lettersBankCountUpdated', room.letterBank.getLettersCount());
                sender.addCommand(report);
                break;
            case CommandVerbs.SWITCH:
                this.sendToEveryoneInRoom(sender.socketId, 'drawRack', sender.rack.getLetters());
                this.sendToEveryoneInRoom(sender.socketId, 'message', {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                if (!socket) return;
                socket
                    .to(room.roomInfo.name)
                    .emit('message', { text: report.messageToOthers, sender: SYSTEM_NAME, color: MessageSenderColors.SYSTEM });
                sender.addCommand(report);
                break;
            case CommandVerbs.SKIP:
                sender.addCommand(report);
                break;
            case CommandVerbs.BANK:
                this.sendToEveryoneInRoom(sender.socketId, 'message', {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                break;
            case CommandVerbs.HINT:
                this.sendToEveryoneInRoom(sender.socketId, 'message', {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                break;
            case CommandVerbs.HELP:
                this.sendToEveryoneInRoom(sender.socketId, 'message', {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                break;
        }

        if (report.message) {
            const systemMessage: ChatMessage = { text: report.message, sender: SYSTEM_NAME, color: MessageSenderColors.SYSTEM };
            this.sendToEveryoneInRoom(room.roomInfo.name, 'message', systemMessage);
        }
        if (room.roomInfo.gameType !== 'log2990') return;
        this.sendToEveryoneInRoom(room.roomInfo.name, 'goalsUpdated', room.getAllGoals());
        this.communicateNewAchievements(room.roomInfo.name, room.getReachedGoals());
    }
    private communicateNewAchievements(roomName: string, goalsReached: ReachedGoal[]) {
        goalsReached.forEach((goal) => {
            if (goal.communicated) return;
            const goalMessage: ChatMessage = {
                text: `${goal.playerName} a atteint l'objectif: \n ${goal.title} \n \n Récompense: ${goal.reward} points!!!`,
                sender: SYSTEM_NAME,
                color: MessageSenderColors.GOALS,
            };
            this.sendToEveryoneInRoom(roomName, 'message', goalMessage);
            goal.communicated = true;
        });
    }
    private handleGamePlaceFinish(room: Room, socketId: string) {
        if (!room) return;
        room.setPlayersTurnToFalse();

        const winner = room.getPlayer(socketId);
        if (!winner) return;
        room.updateScoresOnPlaceFinish(winner);
        this.updatePlayersScore(room);
        room.elapsedTime = END_TIMER_VALUE; // to clear the interval
        this.updateLeaderboard(room);
        this.updateGame(room);
        this.sendToEveryoneInRoom(room.roomInfo.name, 'gameIsOver', [winner]);
        this.displayGameResume(room);
    }

    private updatePlayerView(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const player = room.getPlayer(socket.id);
        if (!player) return;

        this.socketEmit(socket, 'updatePlayerScore', player);
        this.socketEmit(socket, 'lettersBankCountUpdated', room.letterBank.getLettersCount());

        const currentPlayerTurn = room.getCurrentPlayerTurn();
        if (!currentPlayerTurn) return;
        this.socketEmit(socket, 'playerTurnChanged', currentPlayerTurn.pseudo);
    }

    private handleGamePassFinish(room: Room) {
        if (!room) return;
        room.setPlayersTurnToFalse();
        room.updateScoreOnPassFinish();
        this.updatePlayersScore(room);
        this.updateLeaderboard(room);
        this.updateGame(room);
        room.elapsedTime = END_TIMER_VALUE; // to clear the interval
        this.sendToEveryoneInRoom(room.roomInfo.name, 'gameIsOver', room.getWinner());
        this.displayGameResume(room);
    }

    private updatePlayersScore(room: Room) {
        for (const player of room.players) {
            if (!player || !player.rack || !room.letterBank) {
                continue;
            }
            this.sendToEveryoneInRoom(room.roomInfo.name, 'updatePlayerScore', player);
        }
    }

    private convertToChatMessage(room: Room, socketId: string, message: string): ChatMessage {
        const chatMessage: ChatMessage = {
            text: message,
            sender: room.getPlayerName(socketId) as string,
            color: MessageSenderColors.PLAYER2,
        };
        return chatMessage;
    }
}
