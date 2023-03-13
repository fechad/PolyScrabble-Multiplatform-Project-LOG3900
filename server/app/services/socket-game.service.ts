/* eslint-disable max-lines */
import { CommandVerbs } from '@app/classes/command/command-verbs';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import {
    BOT_COMMAND_TIMEOUT_SEC,
    COUNT_PLAYER_TURN,
    END_TIMER_VALUE,
    ONE_SECOND_IN_MS,
    SYSTEM_NAME,
    // eslint-disable-next-line prettier/prettier
    THREE_SECONDS_IN_MS
} from '@app/constants/constants';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { SocketEvent } from '@app/enums/socket-event';
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
        this.socketEmit(socket, SocketEvent.DrawRack, player.rack.getLetters());
    }

    handleGetAllGoals(socket: io.Socket) {
        if (!this.isRoomValid(socket)) return;
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const goals = room.getAllGoals();
        this.sendToEveryoneInRoom(roomName, SocketEvent.GoalsUpdated, goals);
    }

    async handleMessage(socket: io.Socket, message: string) {
        this.chatMessageService.restore();
        this.sendToEveryoneInRoom(socket.id, SocketEvent.MessageReceived);
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) return;

        const commandSender = room.getPlayer(socket.id) as Player;
        this.handleCommand(socket, room, message, commandSender);
    }

    handleStartGame(socket: io.Socket) {
        const roomName = this.getSocketRoom(socket);
        if (!roomName) return;
        const room = this.roomService.getRoom(roomName) as Room;
        if (!room) return;
        if (room.players.length > room.maxPlayers || room.players.length <= 1) return;
        let currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) {
            room.choseRandomTurn();
            currentTurnPlayer = room.getCurrentPlayerTurn();
        }

        const player = room.getPlayer(socket.id);
        if (!player) return;
        this.socketEmit(socket, SocketEvent.UpdatePlayerScore, player);
        this.sendToEveryoneInRoom(roomName, SocketEvent.PlayerTurnChanged, currentTurnPlayer?.pseudo);
        this.socketEmit(socket, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());
        this.socketEmit(socket, SocketEvent.DrawRack, player.rack.getLetters());

        if (room.hasTimer()) return;
        this.setTimer(socket, room);
        room.fillPlayersRack();
        this.roomService.setUnavailable(room.roomInfo.name);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
        this.socketEmit(socket, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());
        const botGreeting = room.getBotGreeting();
        if (botGreeting) this.handleBotGreeting(room.bot.pseudo, botGreeting, roomName);

        this.handleNewPlayerTurn(socket, room, currentTurnPlayer);

        room.givesPlayerGoals();
    }

    handleNewPlayerTurn(socket: io.Socket, room: Room, currentTurnPlayer: Player | undefined) {
        if (currentTurnPlayer instanceof VirtualPlayer === false) return;
        const virtualPlayer = currentTurnPlayer as VirtualPlayer;

        setTimeout(async () => {
            if (!virtualPlayer.isItsTurn) return;
            const message = await virtualPlayer.playTurn();
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, {
                text: message,
                sender: virtualPlayer.pseudo,
                color: MessageSenderColors.PLAYER2,
            });
            this.handleCommand(socket, room, message, virtualPlayer);
        }, THREE_SECONDS_IN_MS);
    }

    handleBotMissedTurn(socket: io.Socket, room: Room, currentTurnPlayer: Player | undefined) {
        if (currentTurnPlayer instanceof VirtualPlayer === false) return;
        const virtualPlayer = currentTurnPlayer as VirtualPlayer;
        if (!virtualPlayer.isItsTurn) return;

        const message = '!passer';
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, {
            text: message,
            sender: virtualPlayer.pseudo,
            color: MessageSenderColors.PLAYER2,
        });
        this.handleCommand(socket, room, message, virtualPlayer);
    }

    handleCommand(socket: io.Socket, room: Room, message: string, commandSender: Player) {
        const isCommand = this.commandController.hasCommandSyntax(message);
        if (!isCommand) {
            const chatMessage = this.convertToChatMessage(room, socket.id, message);
            if (commandSender instanceof VirtualPlayer === false) {
                this.socketEmitRoom(socket, room.roomInfo.name, SocketEvent.Message, chatMessage);
                return;
            }
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, chatMessage);
            return;
        }

        const executionResult = this.commandController.executeCommand(message, room, commandSender) as CommandResult;
        if (this.chatMessageService.isError) {
            this.chatMessageService.message.sender = SYSTEM_NAME;
            this.chatMessageService.message.color = MessageSenderColors.SYSTEM;
            if (commandSender instanceof VirtualPlayer === false)
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, this.chatMessageService.message);
            this.chatMessageService.restore();
            return;
        }
        if (room.turnPassedCounter >= COUNT_PLAYER_TURN) {
            this.handleGamePassFinish(room);
            return;
        }
        this.notifyViewBasedOnCommandResult(executionResult, room, commandSender, socket);

        const currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayerTurnChanged, currentTurnPlayer.pseudo);

        this.handleNewPlayerTurn(socket, room, currentTurnPlayer);

        if (!room.isGameFinished()) return;
        this.handleGamePlaceFinish(room, socket.id);
    }

    handleStartGameRequest(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName) as Room;
        if (!room) return;

        this.sendToEveryoneInRoom(roomName, SocketEvent.GameStarted);
    }

    async handleChangeTurn(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        this.changeTurn(socket, room);
    }

    setTimer(socket: io.Socket, room: Room) {
        if (!room) return;
        room.stopOtherTimerCreation();
        const timerInterval = setInterval(async () => {
            if (room.elapsedTime < 0) {
                clearInterval(timerInterval);
                return;
            }

            if (room.elapsedTime >= +room.roomInfo.timerPerTurn) {
                const currentPlayer = room.getCurrentPlayerTurn();
                if (!currentPlayer) return;
                this.sendToEveryoneInRoom(currentPlayer.socketId, SocketEvent.Message, {
                    text: '!passer',
                    sender: 'Vous',
                    color: MessageSenderColors.PLAYER1,
                });

                // TODO: see if this otherPlayerCheck is necessary, or should delete the room if false
                const otherPlayer = room.players.find((playerInRoom) => playerInRoom !== currentPlayer);
                if (!otherPlayer) return;
                this.sendToEveryoneInRoom(otherPlayer.socketId, SocketEvent.Message, {
                    text: `${currentPlayer.pseudo} a passé son tour`,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                this.changeTurn(socket, room);
                return;
            }

            if (this.mustVerifyBotPlayedHisTurn(room)) {
                this.handleBotMissedTurn(socket, room, room.getCurrentPlayerTurn());
                ++room.elapsedTime;
                return;
            }

            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.TimeUpdated, room);
            ++room.elapsedTime;
        }, ONE_SECOND_IN_MS);
    }

    changeTurn(socket: io.Socket, room: Room) {
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

        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayerTurnChanged, currentTurnPlayer.pseudo);
        this.handleNewPlayerTurn(socket, room, currentTurnPlayer);
        return;
    }

    private mustVerifyBotPlayedHisTurn(room: Room): boolean {
        return (
            ((room.elapsedTime - 1) % BOT_COMMAND_TIMEOUT_SEC) + 1 === BOT_COMMAND_TIMEOUT_SEC &&
            room.getCurrentPlayerTurn() instanceof VirtualPlayer === true
        );
    }

    private handleBotGreeting(name: string, greeting: string, roomName: string) {
        const chatMessage: ChatMessage = { sender: name, text: greeting, color: MessageSenderColors.PLAYER2 };
        this.sendToEveryoneInRoom(roomName, SocketEvent.Message, chatMessage);
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
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.DrawBoard, report.commandData);
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.UpdatePlayerScore, sender);
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.DrawRack, sender.rack.getLetters());
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());
                sender.addCommand(report);
                break;
            case CommandVerbs.SWITCH:
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.DrawRack, sender.rack.getLetters());
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.Message, {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                if (!socket) return;
                socket
                    .to(room.roomInfo.name)
                    .emit(SocketEvent.Message, { text: report.messageToOthers, sender: SYSTEM_NAME, color: MessageSenderColors.SYSTEM });
                sender.addCommand(report);
                break;
            case CommandVerbs.SKIP:
                sender.addCommand(report);
                break;
            case CommandVerbs.BANK:
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.Message, {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                break;
            case CommandVerbs.HINT:
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.Message, {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                break;
            case CommandVerbs.HELP:
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.Message, {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                break;
        }

        if (report.message) {
            const systemMessage: ChatMessage = { text: report.message, sender: SYSTEM_NAME, color: MessageSenderColors.SYSTEM };
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, systemMessage);
        }
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.GoalsUpdated, room.getAllGoals());
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
            this.sendToEveryoneInRoom(roomName, SocketEvent.Message, goalMessage);
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
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.GameIsOver, [winner]);
        this.displayGameResume(room);
    }

    private handleGamePassFinish(room: Room) {
        if (!room) return;
        room.setPlayersTurnToFalse();
        room.updateScoreOnPassFinish();
        this.updatePlayersScore(room);
        this.updateLeaderboard(room);
        this.updateGame(room);
        room.elapsedTime = END_TIMER_VALUE; // to clear the interval
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.GameIsOver, room.getWinner());
        this.displayGameResume(room);
    }

    private updatePlayerView(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const player = room.getPlayer(socket.id);
        if (!player) return;

        this.socketEmit(socket, SocketEvent.UpdatePlayerScore, player);
        this.socketEmit(socket, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());

        const currentPlayerTurn = room.getCurrentPlayerTurn();
        if (!currentPlayerTurn) return;
        this.socketEmit(socket, SocketEvent.PlayerTurnChanged, currentPlayerTurn.pseudo);
    }

    private updatePlayersScore(room: Room) {
        for (const player of room.players) {
            if (!player || !player.rack || !room.letterBank) {
                continue;
            }
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.UpdatePlayerScore, player);
        }
    }

    private convertToChatMessage(room: Room, socketId: string, message: string, pseudo?: string): ChatMessage {
        const chatMessage: ChatMessage = {
            text: message,
            sender: pseudo || (room.getPlayerName(socketId) as string),
            color: MessageSenderColors.PLAYER2,
        };
        return chatMessage;
    }
}
