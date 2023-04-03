import { DiscussionChannel } from '@app/classes/discussion-channel';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { CHAT_WINDOW_SOCKET_CHANNEL, DEFAULT_ROOM_NAME, SYSTEM_NAME } from '@app/constants/constants';
import { FILLER_BOT_NAMES } from '@app/constants/virtual-player-constants';
import { CommandController } from '@app/controllers/command.controller';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { SocketEvent } from '@app/enums/socket-event';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Game } from '@app/interfaces/firestoreDB/game';
import { PlayerData } from '@app/interfaces/player-data';
import { Score } from '@app/interfaces/score';
import { firestore } from 'firebase-admin';
import * as io from 'socket.io';
import { PlayerGameHistoryService } from './GameEndServices/player-game-history.service';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
import { DiscussionChannelService } from './discussion-channel.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { ScoresService } from './score.service';

export class SocketHandlerService {
    commandController: CommandController;
    constructor(
        public discussionChannelService: DiscussionChannelService,
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

    swapPlayerForBot(room: Room, player: Player) {
        const fillerName = FILLER_BOT_NAMES[room.fillerNamesUsed.length];
        const bot = room.createVirtualPlayer(fillerName);
        room.fillerNamesUsed.push(fillerName);

        bot.points = player.points;
        bot.replaceRack(player.rack);

        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.BotJoinedRoom, room.players);

        const systemAlert: ChatMessage = {
            sender: SYSTEM_NAME,
            color: MessageSenderColors.SYSTEM,
            text: 'Votre adversaire a quitté la partie \n Il a été remplacé par le jouer virtuel ' + bot.pseudo,
        };
        this.sendToEveryoneInRoom(room.roomInfo.name, SocketEvent.Message, systemAlert);
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

    handleChatWindowSocket(socket: io.Socket) {
        this.socketJoin(socket, CHAT_WINDOW_SOCKET_CHANNEL);
    }

    getSocketRoom(socket: io.Socket): Room | undefined {
        if (socket.rooms.has(CHAT_WINDOW_SOCKET_CHANNEL)) return;

        for (const room of socket.rooms) {
            if (room.toLowerCase().startsWith(DEFAULT_ROOM_NAME.toLowerCase())) {
                const wantedRoom = this.roomService.getRoom(room);
                if (!wantedRoom) {
                    continue;
                }
                return wantedRoom;
            }
        }
        return;
    }

    getSocketDiscussionChannels(socket: io.Socket): DiscussionChannel[] {
        if (socket.rooms.has(CHAT_WINDOW_SOCKET_CHANNEL)) return [];

        const socketDiscussionChannels = [];
        for (const channelName of socket.rooms) {
            const wantedDiscussionChannel = this.discussionChannelService.getDiscussionChannel(channelName);
            if (!wantedDiscussionChannel) {
                continue;
            }
            socketDiscussionChannels.push(wantedDiscussionChannel);
        }
        return socketDiscussionChannels;
    }

    leaveAllSocketRoom(socket: io.Socket) {
        for (const roomName of socket.rooms) {
            socket.leave(roomName);
        }
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
        const playerResults: { playerID: string; score: number; unfairQuit: boolean }[] = [];
        const players = room.players.concat(room.leavers);
        players.forEach((player) => {
            let playerId = 'notAnswered';

            if (player.pseudo && !(player instanceof VirtualPlayer)) playerId = player.pseudo;
            if (player.pseudo && player instanceof VirtualPlayer) playerId = 'Bot' + player.pseudo;
            const result = { playerID: playerId, score: player.points, unfairQuit: player.gaveUpUnfairly ? player.gaveUpUnfairly : false };
            playerResults.push(result);
        });
        const game: Game = {
            startDatetime: room.startDate,
            results: playerResults,
            gameType: room.roomInfo.gameType,
            endDatetime: firestore.Timestamp.now(),
        };

        await this.gamesHistoryService.updateGame(game);
        await this.playerGameHistoryService.updatePlayersGameHistories(game);
    }
}
