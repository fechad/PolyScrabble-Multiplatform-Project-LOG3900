import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DEFAULT_ROOM_NAME, DISCONNECT_DELAY, SYSTEM_NAME } from '@app/constants/constants';
import { FILLER_BOT_NAMES } from '@app/constants/virtual-player-constants';
import { CommandController } from '@app/controllers/command.controller';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { SocketEvent } from '@app/enums/socket-event';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Game } from '@app/interfaces/firestoreDB/game';
import { PlayerData } from '@app/interfaces/player-data';
import { Score } from '@app/interfaces/score';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';

export class SocketHandlerService {
    commandController: CommandController;
    constructor(
        public sio: io.Server,
        private scoreService: ScoresService,
        private playerGameHistoryService: PlayerGameHistoryService,
        private gamesHistoryService: GamesHistoryService,
        public chatMessageService: ChatMessageService,
        public roomService: RoomService,
        public dateService: DateService,
    ) {
        this.commandController = new CommandController(this.chatMessageService);
    }

    sendToEveryoneInRoom(roomName: string, nameEvent: string, dataEvent?: unknown) {
        this.sio.to(roomName).emit(nameEvent, dataEvent);
    }
    sendToEveryone(nameEvent: string, dataEvent: unknown) {
        this.sio.sockets.emit(nameEvent, dataEvent);
    }
    socketJoin(socket: io.Socket, roomName: string) {
        socket.join(roomName);
    }
    socketEmit(socket: io.Socket, nameEvent: string, dataEvent?: unknown) {
        socket.emit(nameEvent, dataEvent);
    }
    socketEmitRoom(socket: io.Socket, roomName: string, nameEvent: string, dataEvent?: unknown) {
        socket.to(roomName).emit(nameEvent, dataEvent);
    }
    socketLeaveRoom(socket: io.Socket, roomName: string) {
        socket.leave(roomName);
    }

    async handleDisconnecting(socket: io.Socket): Promise<void> {
        const room = this.roomService.getRoom(this.getSocketRoom(socket) as string);
        if (!room || this.handleOnlyPlayerLeft(room)) return;

        return new Promise((resolve) => {
            setTimeout(() => {
                const player = room.getPlayer(socket.id);
                if (!player) return;
                if (room.isSolo) {
                    this.handleSoloPlayerLeft(room);
                    return;
                }
                resolve(this.handleMultiPlayerLeft(socket, room, player));
            }, DISCONNECT_DELAY);
        });
    }

    handleOnlyPlayerLeft(room: Room): boolean {
        if (room.players.length <= 1) {
            this.roomService.removeRoom(room.roomInfo.name);
            return true;
        }
        return false;
    }

    handleSoloPlayerLeft(room: Room) {
        this.roomService.removeRoom(room.roomInfo.name);
    }

    handleMultiPlayerLeft(socket: io.Socket, room: Room, player: Player) {
        room.removePlayer(player);
        if (!room.hasARealPlayerLeft()) {
            this.roomService.removeRoom(room.roomInfo.name);
            return;
        }
        this.swapPlayerForBot(room, player);
        this.socketEmitRoom(socket, room.roomInfo.name, SocketEvent.PlayerLeft, player);
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.PlayerTurnChanged, room.getCurrentPlayerTurn()?.pseudo);
    }

    swapPlayerForBot(room: Room, player: Player) {
        const bot = room.createVirtualPlayer(FILLER_BOT_NAMES[room.fillerNamesUsed.length]);
        bot.points = player.points;
        bot.replaceRack(player.rack);

        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.BotJoinedRoom, room.players);

        const systemAlert: ChatMessage = {
            sender: SYSTEM_NAME,
            color: MessageSenderColors.SYSTEM,
            text: 'Votre adversaire a quitté la partie \n Il a été remplacé par le jouer virtuel ' + bot.pseudo,
        };
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, systemAlert);
        const botGreeting: ChatMessage = { sender: bot.pseudo, color: MessageSenderColors.PLAYER2, text: bot.greeting };
        bot.notifyObservers({ roomName: room.roomInfo.name, chatMessage: botGreeting });
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, botGreeting);
    }

    handleReconnect(socket: io.Socket, playerData: PlayerData) {
        if (!playerData.roomName) return;
        const room = this.roomService.getRoom(playerData.roomName);
        if (!room) return;
        const player = room.getPlayer(playerData.socketId);
        if (!player) return;

        player.socketId = socket.id;
        this.socketJoin(socket, playerData.roomName);
        this.socketEmit(socket, SocketEvent.Reconnected, { room, player });
    }

    getSocketRoom(socket: io.Socket): string | undefined {
        for (const room of socket.rooms) {
            if (room.startsWith(DEFAULT_ROOM_NAME)) return room;
        }
        return;
    }

    displayGameResume(room: Room) {
        if (!room.letterBank) return;

        let message = `
            Fin de partie - ${room.letterBank.convertAvailableLettersBankToString()} \n
        `;

        for (const player of room.players) {
            message += `${player.pseudo}: ${player.rack.getLetters()} \n`;
        }

        const chatMessage: ChatMessage = {
            text: message,
            sender: SYSTEM_NAME,
            color: MessageSenderColors.SYSTEM,
        };
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, chatMessage);
    }

    updateLeaderboard(room: Room) {
        const isoDate = this.dateService.getCurrentDate();
        for (const player of room.players) {
            if (!player || player instanceof VirtualPlayer) continue;
            const score: Score = {
                author: player.pseudo,
                points: player.points,
                gameType: room.roomInfo.gameType,
                dictionary: room.roomInfo.dictionary,
                date: isoDate,
            };
            this.scoreService.updateBestScore(score);
        }
    }

    protected async updateGame(room: Room) {
        const playerResults: { playerID: string; score: number }[] = [];
        room.players.forEach((player) => {
            let playerId = 'notAnswered';
            if (player.pseudo && !(player instanceof VirtualPlayer)) {
                playerId = player.pseudo;
            }
            const result = { playerID: playerId, score: player.points };
            playerResults.push(result);
        });
        const game: Game = {
            startDatetime: room.startDate.toUTCString(),
            period: this.dateService.convertToString(this.dateService.getGamePeriod(room.startDate, new Date())),
            results: playerResults,
            gameType: room.roomInfo.gameType,
            surrender: room.roomInfo.surrender,
            botIDS: [],
        };
        room.bots.forEach((bot) => game.botIDS.push(bot.pseudo));

        await this.gamesHistoryService.updateGame(game.startDatetime, game);
        await this.playerGameHistoryService.updatePlayersGameHistories(game);
    }
}
