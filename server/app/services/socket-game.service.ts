/* eslint-disable max-lines */
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import {
    BOT_COMMAND_TIMEOUT_SEC,
    BOT_DELAY,
    COUNT_PLAYER_TURN,
    DISCONNECT_DELAY,
    END_TIMER_VALUE,
    ONE_SECOND_IN_MS,
    SYSTEM_NAME,
} from '@app/constants/constants';
import { TOGGLE_PREFIX } from '@app/constants/virtual-player-constants';
import { CommandVerbs } from '@app/enums/command-verbs';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { SocketEvent } from '@app/enums/socket-event';
import { ChatMessage } from '@app/interfaces/chat-message';
import { CommandResult } from '@app/interfaces/command-result';
import { PlacementData } from '@app/interfaces/placement-data';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { DiscussionChannelService } from './discussion-channel.service';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';
import { SocketHandlerService } from './socket-handler.service';

export class SocketGameService extends SocketHandlerService {
    constructor(
        public discussionChannelService: DiscussionChannelService,
        public sio: io.Server,
        scoreService: ScoresService,
        playerGameHistoryService: PlayerGameHistoryService,
        gamesHistoryService: GamesHistoryService,
        public chatMessageService: ChatMessageService,
        public roomService: RoomService,
        public dateService: DateService,
    ) {
        super(sio, scoreService, playerGameHistoryService, gamesHistoryService, chatMessageService, roomService, dateService);
    }

    async handleDisconnecting(socket: io.Socket): Promise<string | undefined> {
        const room = this.getSocketRoom(socket);
        if (!room) return;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.handleLeaveGame(socket, room));
            }, DISCONNECT_DELAY);
        });
    }

    handleLeaveGame(socket: io.Socket, leavingRoom?: Room): string | undefined {
        const room = leavingRoom || this.getSocketRoom(socket);
        if (!room) return;

        this.socketLeaveRoom(socket, room.roomInfo.name);

        const roomObserver = room.getObserver(socket.id);
        if (roomObserver) {
            room.removeObserver(roomObserver.username);
            this.discussionChannelService.leaveChannel(room.roomInfo.name, roomObserver.username);
            const channelMessages = this.discussionChannelService.getDiscussionChannel(room.roomInfo.name)?.messages;
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.ChannelMessage, channelMessages);
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.ObserversUpdated, room.observers);
            this.sendToEveryone(SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
            return roomObserver.username;
        }

        const player = room.getPlayer(socket.id);
        if (!player) return;
        this.handlePlayerLeft(socket, room, player);
        return player.pseudo;
    }

    handlePlayerLeft(socket: io.Socket, room: Room, player: Player) {
        room.removePlayer(player);
        if (!room.hasARealPlayerLeft()) {
            this.updateGame(room);
            this.roomService.removeRoom(room.roomInfo.name);
            if (!room.roomInfo.isPublic) return;
            this.sendToEveryone(SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
            return;
        }

        this.discussionChannelService.leaveChannel(room.roomInfo.name, player.pseudo);
        const channelMessages = this.discussionChannelService.getDiscussionChannel(room.roomInfo.name)?.messages;
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.ChannelMessage, channelMessages);

        this.swapPlayerForBot(room, player);
        this.socketEmitRoom(socket, room.roomInfo.name, SocketEvent.PlayerLeft, player);
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayerTurnChanged, room.getCurrentPlayerTurn()?.pseudo);
    }

    handleGetPlayerInfo(socket: io.Socket, roomName: string) {
        this.updatePlayerView(socket, roomName);
    }

    handleGetRackInfo(socket: io.Socket, roomName: string) {
        if (!this.isRoomAndPlayerValid(socket, roomName)) return;
        const player = (this.roomService.getRoom(roomName) as Room).getPlayer(socket.id) as Player;
        this.socketEmit(socket, SocketEvent.DrawRack, player.rack.getLetters());
    }

    handleGetPlayersRackInfo(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        this.socketEmit(socket, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());
        this.socketEmit(socket, SocketEvent.PlayersRackUpdated, room.getPlayersRack());
    }

    handleGetAllGoals(socket: io.Socket) {
        if (!this.isRoomValid(socket)) return;
        const room = this.getSocketRoom(socket);
        if (!room) return;
        const goals = room.getAllGoals();
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.GoalsUpdated, goals);
    }

    async handleMessage(socket: io.Socket, message: string) {
        this.chatMessageService.restore();
        this.sendToEveryoneInRoom(socket.id, SocketEvent.MessageReceived);
        const room = this.getSocketRoom(socket);
        if (!room) return;

        const commandSender = room.getPlayer(socket.id) as Player;
        this.handleCommand(socket, room, message, commandSender);
    }

    handleStartGame(socket: io.Socket) {
        const room = this.getSocketRoom(socket);

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
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayerTurnChanged, currentTurnPlayer?.pseudo);
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());
        this.socketEmit(socket, SocketEvent.DrawRack, player.rack.getLetters());
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayersRackUpdated, room.getPlayersRack());

        if (room.hasTimer()) return;
        room.fillWithVirtualPlayers();
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.BotJoinedRoom, room.players);
        this.setTimer(socket, room);
        room.fillPlayersRack();
        this.roomService.setUnavailable(room.roomInfo.name);
        this.sendToEveryone(SocketEvent.UpdateAvailableRoom, this.roomService.getRoomsAvailable());
        this.socketEmit(socket, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());

        this.handleNewPlayerTurn(socket, room, currentTurnPlayer);

        room.givesPlayerGoals();
    }

    handleNewPlayerTurn(socket: io.Socket, room: Room, currentTurnPlayer: Player | undefined) {
        if (currentTurnPlayer instanceof VirtualPlayer === false) return;
        const virtualPlayer = currentTurnPlayer as VirtualPlayer;

        setTimeout(async () => {
            if (!virtualPlayer.isItsTurn) return;

            const pointGap = room.computeAverageHumanPoints() - virtualPlayer.points;
            virtualPlayer.setScoreInterval(pointGap);
            this.updateWantedMessages(room);
            setTimeout(async () => {
                const message = await virtualPlayer.playTurn();
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, {
                    text: message,
                    sender: virtualPlayer.pseudo,
                    color: MessageSenderColors.PLAYER2,
                });
                this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, message, virtualPlayer.pseudo, virtualPlayer.avatarUrl);
                this.handleCommand(socket, room, message, virtualPlayer);
            }, BOT_DELAY);
        }, BOT_DELAY);
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
        this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, message, virtualPlayer.pseudo, virtualPlayer.avatarUrl);
        this.handleCommand(socket, room, message, virtualPlayer);
    }

    handleCommand(socket: io.Socket, room: Room, message: string, commandSender: Player) {
        const isCommand = this.commandController.hasCommandSyntax(message);
        if (!isCommand) {
            const chatMessage = this.convertToChatMessage(room, socket.id, message);
            const player = room.getPlayer(socket.id);
            if (commandSender instanceof VirtualPlayer === false) {
                this.socketEmitRoom(socket, room.roomInfo.name, SocketEvent.Message, chatMessage);
                if (!player) return;
                this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, message, player.pseudo, player.avatarUrl);
                return;
            }
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, chatMessage);
            if (!player) return;
            this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, message, player.pseudo, player.avatarUrl);
            return;
        }

        const executionResult = this.commandController.executeCommand(message, room, commandSender) as CommandResult;
        if (this.chatMessageService.isError) {
            this.chatMessageService.message.sender = SYSTEM_NAME;
            this.chatMessageService.message.color = MessageSenderColors.SYSTEM;
            if (commandSender instanceof VirtualPlayer === false) {
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, this.chatMessageService.message);
                this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, this.chatMessageService.message.text);
            }
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
        if (message.startsWith('!indice')) return;
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayerTurnChanged, currentTurnPlayer.pseudo);

        this.handleNewPlayerTurn(socket, room, currentTurnPlayer);

        if (!room.isGameFinished()) return;
        this.handleGamePlaceFinish(room, socket.id);
    }

    handleStartGameRequest(_socket: io.Socket, roomName: string) {
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
            if (room.elapsedTime < 0 || room.players.length <= 0) {
                clearInterval(timerInterval);
                if (room.players.length > 0) return;
                this.roomService.removeRoom(room.roomInfo.name);
                if (!room.roomInfo.isPublic) return;
                this.sendToEveryone(SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
                return;
            }

            if (room.elapsedTime > +room.roomInfo.timerPerTurn) {
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
            this.updateWantedMessages(room);
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.TimeUpdated, room);
            ++room.elapsedTime;
        }, ONE_SECOND_IN_MS);
    }

    changeTurn(socket: io.Socket, room: Room) {
        if (!room) return;
        room.elapsedTime = 1;
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
    toggleAngryBotAvatar(room: Room, botName: string) {
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.ToggleAngryBotAvatar, botName);
    }
    private updateWantedMessages(room: Room) {
        // eslint-disable-next-line no-unused-vars, no-underscore-dangle
        for (const _wantedMessage of room.botCommunicationManager.wantedMessages) {
            const messageInfo = room.botCommunicationManager.popFirstWantedMessage();
            if (!messageInfo || !messageInfo.message) return;
            if (!messageInfo.sender.startsWith(TOGGLE_PREFIX))
                return this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, messageInfo.message, messageInfo.sender, messageInfo.avatarUrl);
            messageInfo.sender = messageInfo.sender.replace(new RegExp('^' + TOGGLE_PREFIX), '');
            this.toggleAngryBotAvatar(room, messageInfo.sender);
            this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, messageInfo.message, messageInfo.sender, messageInfo.avatarUrl);
        }
    }

    private sendChannelMessageToEveryoneInRoom(channelName: string, message: string, sender?: string, avatarUrl?: string) {
        const discussionChannel = this.discussionChannelService.getDiscussionChannel(channelName);
        if (!discussionChannel) return;
        const channelMessage = {
            channelName,
            system: sender ? false : true,
            sender,
            avatarUrl,
            message,
            time: new Date().toLocaleTimeString([], { hour12: false }),
        };
        discussionChannel.addMessage(channelMessage);
        this.sendToEveryoneInRoom(channelName, SocketEvent.ChannelMessage, discussionChannel.messages);
    }

    private mustVerifyBotPlayedHisTurn(room: Room): boolean {
        return (
            ((room.elapsedTime - 1) % BOT_COMMAND_TIMEOUT_SEC) + 1 === BOT_COMMAND_TIMEOUT_SEC &&
            room.getCurrentPlayerTurn() instanceof VirtualPlayer === true
        );
    }

    private isRoomAndPlayerValid(socket: io.Socket, roomName: string): boolean {
        const room = this.roomService.getRoom(roomName);

        if (!room) return false;
        if (!room.getPlayer(socket.id)) return false;
        return true;
    }

    private isRoomValid(socket: io.Socket): boolean {
        if (!this.getSocketRoom(socket)) return false;
        return true;
    }

    private notifyViewBasedOnCommandResult(report: CommandResult, room: Room, sender: Player, socket: io.Socket) {
        if (!report || !room || !sender) return;
        switch (report.commandType) {
            case CommandVerbs.PLACE:
                room.addPlacementData(report.commandData as PlacementData);
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.DrawBoard, report.commandData);
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.UpdatePlayerScore, sender);
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.DrawRack, sender.rack.getLetters());
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayersRackUpdated, room.getPlayersRack());
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());
                sender.addCommand(report);
                break;
            case CommandVerbs.SWITCH:
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.DrawRack, sender.rack.getLetters());
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayersRackUpdated, room.getPlayersRack());
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.Message, {
                    text: report.messageToSender,
                    sender: SYSTEM_NAME,
                    color: MessageSenderColors.SYSTEM,
                });
                if (!socket) return;
                socket
                    .to(room.roomInfo.name)
                    .emit(SocketEvent.Message, { text: report.messageToOthers, sender: SYSTEM_NAME, color: MessageSenderColors.SYSTEM });
                this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, report.messageToOthers as string);
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
                this.sendToEveryoneInRoom(sender.socketId, 'hint', {
                    text: report.messageToSender,
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
            this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, systemMessage.text);
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
            this.sendChannelMessageToEveryoneInRoom(roomName, goalMessage.text);
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
