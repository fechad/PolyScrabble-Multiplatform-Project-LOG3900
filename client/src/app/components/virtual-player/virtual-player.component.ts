import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { Room } from '@app/classes/room';
import { DEFAULT_DICTIONARY_TITLE } from '@app/components/best-scores-table/best-scores-table.component';
import { ThemedPopUpComponent } from '@app/components/themed-pop-up/themed-pop-up.component';
import { Language } from '@app/enums/language';
import { SocketEvent } from '@app/enums/socket-event';
import { Badge } from '@app/interfaces/serveur info exchange/badge';
import { AudioService } from '@app/services/audio.service';
import { BackgroundService } from '@app/services/background-image.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-virtual-player',
    templateUrl: './virtual-player.component.html',
    styleUrls: ['./virtual-player.component.scss'],
})
export class VirtualPlayerComponent extends ComponentCommunicationManager implements OnInit {
    @Input() botId: string;
    @Input() difficulty: number;
    @Input() time: number;
    diff: string[] = [];
    hasBeatenSanta: boolean;
    imagePath = 'assets/images/avatars/';

    constructor(
        private playerService: PlayerService,
        private audioService: AudioService,
        protected socketService: SocketClientService,
        private router: Router,
        private dialog: MatDialog,
        protected backgroundService: BackgroundService,
    ) {
        super(socketService);
    }

    get room(): Room {
        return this.playerService.room;
    }

    get userLanguage(): Language {
        return this.playerService.account.userSettings.defaultLanguage === 'french' ? Language.French : Language.English;
    }

    ngOnInit(): void {
        this.hasBeatenSanta = this.playerService.account.badges.filter((badge: Badge) => badge.id === 'Santa').length > 0 || this.botId === 'Santa';
        this.diff = new Array(this.difficulty).fill(' ');
        this.connectSocket();
        if (this.hasBeatenSanta) {
            this.imagePath += this.botId + 'Avatar.png';
        } else this.imagePath += 'lock.png';
    }

    openPopUp(): void {
        if (this.hasBeatenSanta) {
            const dialog = this.dialog.open(ThemedPopUpComponent, {
                width: '640px',
                data: {
                    name: this.botId,
                    difficulty: this.difficulty,
                    time: this.time,
                    image: this.imagePath,
                },
            });
            dialog.afterClosed().subscribe(async (result) => {
                if (result) this.createRoom();
            });
        }
    }
    createRoom() {
        this.initializeRoom();

        this.socketService.send(SocketEvent.CreateSoloRoom, {
            room: this.room,
            botName: this.botId,
            desiredLevel: this.botId,
        });
    }
    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.RoomCreated, (serverRoom: Room) => {
            if (!serverRoom.roomInfo.name.startsWith('R-')) return;
            if (serverRoom.botsLevel !== this.botId) return;
            this.room.roomInfo.name = serverRoom.roomInfo.name;
            this.socketService.send(SocketEvent.CreateChatChannel, {
                channel: serverRoom.roomInfo.name,
                username: this.playerService.reducePLayerInfo(),
                isRoomChannel: true,
            });
            this.room.setPlayers(serverRoom.players);
            const themeMusicDelay = 0;
            this.audioService.playBotThemeMusic(this.botId, themeMusicDelay);
            this.router.navigate(['/game']);
            return;
        });
    }
    private initializeRoom() {
        this.room.currentPlayerPseudo = this.playerService.player.pseudo;
        this.room.roomInfo.timerPerTurn = this.time.toString();
        this.room.roomInfo.dictionary = DEFAULT_DICTIONARY_TITLE;
        this.room.roomInfo.botLanguage = this.userLanguage;
        this.room.roomInfo.isSolo = true;
        this.room.botsLevel = this.botId;
        this.room.roomInfo.creatorName = this.playerService.player.pseudo;
        this.room.roomInfo.isPublic = false;
        this.playerService.player.isCreator = true;
        this.playerService.player.socketId = this.socketService.socket.id;
        this.room.players = [this.playerService.player];
        this.backgroundService.setBackground(this.botId.toLowerCase());
    }
}
