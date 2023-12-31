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
import { BASE_AVATAR_PATH } from '@app/constants/default-user-settings';
import { TOGGLE_PREFIX } from '@app/constants/virtual-player-constants';
import { CommandVerbs } from '@app/enums/command-verbs';
import { Language } from '@app/enums/language';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { SocketEvent } from '@app/enums/socket-event';
import { ChatMessage } from '@app/interfaces/chat-message';
import { ClientAccountInfo } from '@app/interfaces/client-exchange/client-account-info';
import { CommandResult } from '@app/interfaces/command-result';
import { PlacementData } from '@app/interfaces/placement-data';
import { Position } from '@app/interfaces/position';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import * as io from 'socket.io';
import { SocketHandlerService } from './socket-handler.service';
import { SocketManager } from './socket-manager.service';

export class SocketGameService extends SocketHandlerService {
    async handleDisconnecting(socket: io.Socket): Promise<string | undefined> {
        const room = this.getSocketRoom(socket);
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
            const leaveMessage = this.discussionChannelService.leaveChannel(room.roomInfo.name, roomObserver.username);
            if (leaveMessage) this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.ChannelMessage, leaveMessage);
            this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.ObserversUpdated, room.observers);
            this.sendToEveryone(SocketEvent.UpdatePublicRooms, this.roomService.getRoomsPublic());
            return roomObserver.username;
        }

        const player = room.getPlayer(socket.id);
        if (!player) return;

        if (room.elapsedTime === 0) {
            this.handleLeaveGameBeforeStart(socket, player, room.roomInfo.name);
            return;
        }

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

        const leaveMessage = this.discussionChannelService.leaveChannel(room.roomInfo.name, player.pseudo);
        if (leaveMessage) this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.ChannelMessage, leaveMessage);
        this.swapPlayerForBot(room, player);
        this.socketEmitRoom(socket, room.roomInfo.name, SocketEvent.PlayerLeft, player);
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayerTurnChanged, room.getCurrentPlayerTurn()?.pseudo);

        if (room.realPlayers.length <= 1 && room.elapsedTime !== END_TIMER_VALUE) {
            this.handleGamePassFinish(room);
        }
    }

    handleGetPlayerInfo(socket: io.Socket, roomName: string) {
        this.updatePlayerView(socket, roomName);
    }

    handleGetRackInfo(socket: io.Socket, roomName: string) {
        if (!this.isRoomAndPlayerValid(socket, roomName)) return;
        const player = (this.roomService.getRoom(roomName) as Room).getPlayer(socket.id);
        if (!player) return;
        this.socketEmit(socket, SocketEvent.DrawRack, player.rack.getLetters());
    }

    handleGetPlayersRackInfo(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        this.socketEmit(socket, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());
        this.socketEmit(socket, SocketEvent.PlayersRackUpdated, room.getPlayersRack());
    }

    handleFirstTilePlaced(socket: io.Socket, tileIndexes: Position | null) {
        const room = this.getSocketRoom(socket);
        if (!room) return;
        this.socketEmitRoom(socket, room.roomInfo.name, SocketEvent.FirstTilePlaced, tileIndexes);
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
        const room = this.getSocketRoom(socket);
        if (!room) return;

        const commandSender = room.getPlayer(socket.id);
        if (!commandSender) return;
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
        this.sendToEveryoneInRoom(
            room.roomInfo.name,
            SocketEvent.BotJoinedRoom,
            room.players.map((roomPlayer) => this.getLightPlayer(roomPlayer)),
        );
        if (room.hasTimer()) return;
        room.fillWithVirtualPlayers();

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
                this.handleCommand(socket, room, message, virtualPlayer);
            }, BOT_DELAY);
        }, BOT_DELAY);
    }

    handleBotMissedTurn(socket: io.Socket, room: Room, currentTurnPlayer: Player | undefined) {
        if (currentTurnPlayer instanceof VirtualPlayer === false) return;
        const virtualPlayer = currentTurnPlayer as VirtualPlayer;
        if (!virtualPlayer.isItsTurn) return;

        const message = '!passer';
        this.handleCommand(socket, room, message, virtualPlayer);
    }

    handleCommand(socket: io.Socket, room: Room, message: string, commandSender: Player) {
        const isCommand = this.commandController.hasCommandSyntax(message);
        if (!isCommand) {
            const player = room.getPlayer(socket.id);
            if (!player) return;
            this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, message, player.pseudo, player.clientAccountInfo);
            return;
        }

        const executionResult = this.commandController.executeCommand(message, room, commandSender, socket) as CommandResult;
        if (this.chatMessageService.isError) {
            this.chatMessageService.restore();
            if (message.startsWith('!placer')) this.changeTurn(socket, room);
            return;
        }
        if (room.turnPassedCounter >= room.realPlayers.length * COUNT_PLAYER_TURN) {
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
        const room = this.roomService.getLightRoom(roomName);
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
                this.changeTurn(socket, room);
                return;
            }

            if (this.mustVerifyBotPlayedHisTurn(room)) {
                this.handleBotMissedTurn(socket, room, room.getCurrentPlayerTurn());
                ++room.elapsedTime;
                return;
            }
            this.updateWantedMessages(room);
            ++room.elapsedTime;
        }, ONE_SECOND_IN_MS);
    }

    changeTurn(socket: io.Socket, room: Room) {
        if (!room) return;
        room.elapsedTime = 1;
        const playerPassing = room.getCurrentPlayerTurn();
        if (playerPassing && playerPassing instanceof VirtualPlayer === false) room.incrementTurnPassedCounter();
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
    toggleAngryBotAvatar(room: Room, botInfo: ClientAccountInfo) {
        const currentAvatar = botInfo.userSettings.avatarUrl;
        botInfo.userSettings.avatarUrl = currentAvatar.startsWith(BASE_AVATAR_PATH + 'angry')
            ? BASE_AVATAR_PATH + botInfo.username + 'Avatar.png'
            : BASE_AVATAR_PATH + 'angry' + botInfo.username + 'Avatar.png';
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.ToggleAngryBotAvatar, botInfo.username);
    }

    notifyViewBasedOnCommandResult(report: CommandResult, room: Room, sender: Player, socket: io.Socket) {
        if (!report || !room || !sender) return;
        switch (report.commandType) {
            case CommandVerbs.PLACE:
                room.addPlacementData(report.commandData as PlacementData);
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.DrawBoard, report.commandData);
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.UpdatePlayerScore, this.getLightPlayer(sender) as Player);
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.DrawRack, sender.rack.getLetters());
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayersRackUpdated, room.getPlayersRack());
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.LettersBankCountUpdated, room.letterBank.getLettersCount());
                sender.addCommand(report);
                break;
            case CommandVerbs.SWITCH:
                this.sendToEveryoneInRoom(sender.socketId, SocketEvent.DrawRack, sender.rack.getLetters());
                this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayersRackUpdated, room.getPlayersRack());
                if (!socket) return;
                sender.addCommand(report);
                break;
            case CommandVerbs.SKIP:
                sender.addCommand(report);
                break;
            case CommandVerbs.BANK:
                break;
            case CommandVerbs.HINT:
                this.sendToEveryoneInRoom(sender.socketId, 'hint', {
                    text: report.messageToSender,
                });
                break;
            case CommandVerbs.HELP:
                break;
        }

        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.GoalsUpdated, room.getAllGoals());
        this.communicateNewAchievements(room.roomInfo.name, room.getReachedGoals(), room.roomInfo.botLanguage === Language.English);
    }

    private handleLeaveGameBeforeStart(socket: io.Socket, player: Player, roomName: string) {
        if (player.isCreator) {
            SocketManager.instance.socketRoomService.handleLeaveRoomCreator(socket, roomName);
            SocketManager.instance.socketChannelService.handleLeaveChannelCreator(socket, roomName, true);
            return;
        }

        const playerRemovedPseudo = SocketManager.instance.socketRoomService.handleLeaveRoomOther(socket, roomName);
        if (!playerRemovedPseudo) return;
        SocketManager.instance.socketChannelService.handleLeaveChannel(socket, roomName, playerRemovedPseudo);
    }

    private updateWantedMessages(room: Room) {
        // eslint-disable-next-line no-unused-vars, no-underscore-dangle
        for (const _wantedMessage of room.botCommunicationManager.wantedMessages) {
            const messageInfo = room.botCommunicationManager.popFirstWantedMessage();
            if (!messageInfo || !messageInfo.message) return;
            if (!messageInfo.sender.startsWith(TOGGLE_PREFIX))
                return this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, messageInfo.message, messageInfo.sender, messageInfo.account);
            messageInfo.sender = messageInfo.sender.replace(new RegExp('^' + TOGGLE_PREFIX), '');
            this.toggleAngryBotAvatar(room, messageInfo.account);
            this.sendChannelMessageToEveryoneInRoom(room.roomInfo.name, messageInfo.message, messageInfo.sender, messageInfo.account);
        }
    }

    private sendChannelMessageToEveryoneInRoom(channelName: string, message: string, sender?: string, account?: ClientAccountInfo) {
        const discussionChannel = this.discussionChannelService.getDiscussionChannel(channelName);
        if (!discussionChannel) return;
        const channelMessage = {
            channelName,
            system: sender ? false : true,
            sender,
            account,
            message,
            time: new Date().toLocaleTimeString([], { hour12: false }),
        };
        discussionChannel.addMessage(channelMessage);
        this.sendToEveryoneInRoom(channelName, SocketEvent.ChannelMessage, channelMessage);
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

    private communicateNewAchievements(roomName: string, goalsReached: ReachedGoal[], isEnglishLanguage: boolean) {
        goalsReached.forEach((goal) => {
            const message = isEnglishLanguage
                ? `${goal.playerName} reached the objective: \n ${goal.title} \n \n Reward: ${goal.reward} points!!!`
                : `${goal.playerName} a atteint l'objectif: \n ${goal.title} \n \n Récompense: ${goal.reward} points!!!`;

            if (goal.communicated) return;

            const goalMessage: ChatMessage = {
                text: message,
                sender: SYSTEM_NAME,
                color: MessageSenderColors.GOALS,
            };
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
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.GameIsOver, [this.getLightPlayer(winner) as Player]);
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
        this.sendToEveryoneInRoom(
            room.roomInfo.name,
            SocketEvent.GameIsOver,
            room.getWinner().map((player) => this.getLightPlayer(player)),
        );
        this.displayGameResume(room);
    }

    private updatePlayerView(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const player = this.getLightPlayer(room.getPlayer(socket.id));
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
}
