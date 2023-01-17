import { Room } from '@app/classes/room-model/room';
import { Score } from '@app/classes/score';
import { COUNT_PLAYER_TURN, DEFAULT_ROOM_NAME, DISCONNECT_DELAY, END_TIMER_VALUE, SYSTEM_NAME } from '@app/constants/constants';
import { CommandController } from '@app/controllers/command.controller';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Game } from '@app/interfaces/game';
import { PlayerData } from '@app/interfaces/player-data';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';

export class SocketHandlerService {
    commandController: CommandController;
    constructor(
        public sio: io.Server,
        private scoreService: ScoresService,
        private gamesHistoryService: GamesHistoryService,
        public chatMessageService: ChatMessageService,
        public roomService: RoomService,
        public dateService: DateService,
    ) {
        this.commandController = new CommandController(this.chatMessageService);
    }

    handleConvertToRoomSoloBot(socket: io.Socket, data: { roomName: string; botName: string; points: number; isExpertLevel: boolean }) {
        if (!data.roomName) return;
        const room = this.roomService.getRoom(data.roomName);
        if (!room) return;
        room.createPlayerVirtual(socket.id, data.botName);
        room.roomInfo.isSolo = true;
        room.bot.points = data.points;
        this.socketJoin(socket, room.roomInfo.name);
        this.sendToEveryoneInRoom(room.roomInfo.name, 'botInfos', room.bot);
        this.sendToEveryoneInRoom(room.roomInfo.name, 'convertToRoomSoloBotStatus');
        this.roomService.setUnavailable(room.roomInfo.name);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());

        const systemAlert: ChatMessage = {
            sender: SYSTEM_NAME,
            color: MessageSenderColors.SYSTEM,
            text: 'Votre adversaire a quitté la partie \n Il a été remplacé par le jouer virtuel ' + room.bot.pseudo,
        };
        this.sendToEveryone('message', systemAlert);
        const botGreeting: ChatMessage = { sender: room.bot.pseudo, color: MessageSenderColors.PLAYER2, text: room.bot.greeting };
        this.sendToEveryone('message', botGreeting);
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

    handleDisconnecting(socket: io.Socket) {
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        if (room.players.length <= 1) {
            this.roomService.removeRoom(roomName);
        } else {
            setTimeout(() => {
                const player = room.getPlayer(socket.id);
                if (!player) return;
                if (room.bot) {
                    if (room.turnPassedCounter < COUNT_PLAYER_TURN) {
                        this.updateLeaderboard(room);
                    }
                    room.roomInfo.surrender = 'Mode solo abandonné';
                    this.updateGame(room).then(() => {
                        room.removePlayer(player);
                    });
                    room.elapsedTime = END_TIMER_VALUE;
                    player.points = 0;
                    this.sendToEveryoneInRoom(
                        roomName,
                        'gameIsOver',
                        room.players.filter((playerInRoom) => playerInRoom !== player),
                    );
                    this.displayGameResume(room);
                }
                room.removePlayer(player);
                this.socketEmitRoom(socket, roomName, 'playerLeft', player);
                this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', room.getCurrentPlayerTurn()?.pseudo);
            }, DISCONNECT_DELAY);
        }
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }

    handleReconnect(socket: io.Socket, playerData: PlayerData) {
        if (!playerData.roomName) return;
        const room = this.roomService.getRoom(playerData.roomName);
        if (!room) return;
        const player = room.getPlayer(playerData.socketId);
        if (!player) return;

        player.socketId = socket.id;
        this.socketJoin(socket, playerData.roomName);
        this.socketEmit(socket, 'reconnected', { room, player });
    }

    getSocketRoom(socket: io.Socket): string | undefined {
        for (const room of socket.rooms) {
            if (room.startsWith(DEFAULT_ROOM_NAME)) return room;
        }
        return;
    }

    displayGameResume(room: Room) {
        if (!room.verifyBothPlayersExist()) return;
        if (!room.letterBank) return;

        const message = `
            Fin de partie - ${room.letterBank.convertAvailableLettersBankToString()} \n
            ${room.players[0].pseudo}: ${room.players[0].rack.getLetters()} \n
            ${room.players[1].pseudo}: ${room.players[1].rack.getLetters()}
        `;
        const chatMessage: ChatMessage = {
            text: message,
            sender: SYSTEM_NAME,
            color: MessageSenderColors.SYSTEM,
        };
        this.sendToEveryoneInRoom(room.roomInfo.name, 'message', chatMessage);
    }

    updateLeaderboard(room: Room) {
        const isoDate = this.dateService.getCurrentDate();
        for (const player of room.players) {
            if (!player || room.bot === player) continue;
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
        const game: Game = {
            date: room.startDate.toUTCString(),
            period: this.dateService.convertToString(this.dateService.getGamePeriod(room.startDate, new Date())),
            player1: room.players[0].pseudo,
            scorePlayer1: room.players[0].points,
            player2: room.players[1].pseudo,
            scorePlayer2: room.players[1].points,
            gameType: room.roomInfo.gameType,
            surrender: room.roomInfo.surrender,
        };
        await this.gamesHistoryService.updateGame(game.date, game);
    }
}
