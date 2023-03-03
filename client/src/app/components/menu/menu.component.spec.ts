/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DEFAULT_ROOM_INFO } from '@app/constants/constants';
import { SocketEvent } from '@app/enums/socket-event';
import { Account } from '@app/interfaces/account';
import { ChannelMessage } from '@app/interfaces/channel-message';
import { DiscussionChannel } from '@app/interfaces/discussion-channel';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { HttpService } from '@app/services/http.service';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { of } from 'rxjs';
import { MenuComponent } from './menu.component';
import SpyObj = jasmine.SpyObj;

const discussionChannelName = 'channel1';
const roomName = 'Room1';

describe('MenuComponent', () => {
    let component: MenuComponent;
    let fixture: ComponentFixture<MenuComponent>;
    let routerSpy: SpyObj<Router>;
    let dialog: MatDialog;

    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let playerService: PlayerService;
    let firstPlayer: Player;
    let discussionChannel: DiscussionChannel;
    let channelMessage: ChannelMessage;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);

        playerService = new PlayerService();
        playerService.player.pseudo = 'player1';

        playerService.room.roomInfo = DEFAULT_ROOM_INFO;
        playerService.room.roomInfo.name = roomName;

        firstPlayer = new Player();
        firstPlayer.pseudo = 'player2';

        discussionChannel = new DiscussionChannel(discussionChannelName);
        channelMessage = { channelName: discussionChannelName, system: false, time: '', message: '' };

        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule],
            declarations: [MenuComponent],
            providers: [
                { provide: HttpService },
                { provide: PlayerService, useValue: playerService },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;
        dialog = fixture.debugElement.injector.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('isGameCreator tests', () => {
        it('should return true if creatorName === playerName', () => {
            playerService.room.roomInfo.creatorName = playerService.player.pseudo;
            expect(component.isGameCreator).toBeTruthy();
        });

        it('should return false if creatorName !== playerName', () => {
            playerService.room.roomInfo.creatorName = '';
            expect(component.isGameCreator).toBeFalsy();
        });
    });

    describe('showChatChannel tests', () => {
        const discussionChannelIndex = 0;
        const negativeIndex = -1;
        const tooHighIndex = 50;
        let closeChatMenuSpy: jasmine.Spy;
        beforeEach(() => {
            component.availableDiscussionChannels = [discussionChannel];
            closeChatMenuSpy = spyOn(component, 'closeChatMenu');
        });

        it('should set the selectedDiscussionChannel correctly', () => {
            component.selectedDiscussionChannel = {} as unknown as DiscussionChannel;
            component.showChatChannel(discussionChannelIndex);
            expect(component.selectedDiscussionChannel).toEqual(discussionChannel);
        });

        it('should close chatMenu', () => {
            component.showChatChannel(discussionChannelIndex);
            expect(closeChatMenuSpy).toHaveBeenCalled();
        });

        it('should not closeChatMenu if discussionChannelIndex < 0', () => {
            component.showChatChannel(negativeIndex);
            expect(closeChatMenuSpy).not.toHaveBeenCalled();
        });

        it('should not closeChatMenu if discussionChannelIndex > availableDiscussionChannels.length', () => {
            component.showChatChannel(tooHighIndex);
            expect(closeChatMenuSpy).not.toHaveBeenCalled();
        });
    });

    describe('receiving event', () => {
        describe('channelMessage event tests', () => {
            it('should update the message of discussions channel on channelMessage if channel exist', () => {
                discussionChannel.messages = [];
                component.availableDiscussionChannels = [discussionChannel];

                const getDiscussionChannelSpy = spyOn(component as any, 'getDiscussionChannelByName').and.returnValue(discussionChannel);
                socketHelper.peerSideEmit(SocketEvent.ChannelMessage, [channelMessage]);
                expect(getDiscussionChannelSpy).toHaveBeenCalledWith(discussionChannelName);
                expect(component.availableDiscussionChannels[0].messages).toEqual([channelMessage]);
            });

            it('should not update the message of discussions channel on channelMessage if channel does not exist', () => {
                discussionChannel.name = 'other';
                discussionChannel.messages = [];
                component.availableDiscussionChannels = [discussionChannel];

                const getDiscussionChannelSpy = spyOn(component as any, 'getDiscussionChannelByName').and.returnValue(undefined);
                socketHelper.peerSideEmit(SocketEvent.ChannelMessage, [channelMessage]);
                expect(getDiscussionChannelSpy).toHaveBeenCalledWith(discussionChannelName);
                expect(component.availableDiscussionChannels[0].messages).toEqual([]);
            });
        });

        it('should update available discussion channel on availableChannels', () => {
            component.availableDiscussionChannels = [];
            socketHelper.peerSideEmit(SocketEvent.AvailableChannels, [discussionChannel]);
            expect(component.availableDiscussionChannels).toEqual([discussionChannel]);
        });

        it('should set the players correctly on PlayerAccepted', () => {
            const roomMock2 = new Room();
            roomMock2.players = [firstPlayer];
            socketHelper.peerSideEmit(SocketEvent.PlayerAccepted, roomMock2);
            expect(playerService.room.players).toEqual(roomMock2.players);
        });

        it('it should call handlePlayerFound on PlayerFound', () => {
            const roomMock2 = new Room();
            const handlePlayerFoundSpy = spyOn(component, 'handlePlayerFound');
            socketHelper.peerSideEmit(SocketEvent.PlayerFound, { room: roomMock2, player: firstPlayer });
            expect(handlePlayerFoundSpy).toHaveBeenCalledWith({ room: roomMock2, player: firstPlayer });
        });

        describe('playerLeft tests', () => {
            it('should remove the player from the room on playerLeft', () => {
                playerService.room.players = [firstPlayer];
                const previousPlayersLength = playerService.room.players.length;
                socketHelper.peerSideEmit(SocketEvent.PlayerLeft, firstPlayer);
                expect(component.room.players.length).toEqual(previousPlayersLength - 1);
            });

            it('should send setRoomAvailable signal on playerLeft if the new player length is 3', () => {
                playerService.room.players = [firstPlayer, firstPlayer, firstPlayer, firstPlayer];
                const previousPlayersLength = playerService.room.players.length;
                const socketSendSpy = spyOn(socketServiceMock, 'send');
                socketHelper.peerSideEmit(SocketEvent.PlayerLeft, firstPlayer);
                expect(component.room.players.length).toEqual(previousPlayersLength - 1);
                expect(socketSendSpy).toHaveBeenCalledWith(SocketEvent.SetRoomAvailable, component.room.roomInfo.name);
            });

            it('should not remove a player from the room if he is not in the room', () => {
                playerService.room.players = [firstPlayer];
                const previousPlayersLength = playerService.room.players.length;
                socketHelper.peerSideEmit(SocketEvent.PlayerLeft, new Player());
                expect(component.room.players.length).toEqual(previousPlayersLength);
            });

            it('should move the player to game page on GameStarted', () => {
                socketHelper.peerSideEmit(SocketEvent.GameStarted);
                expect(routerSpy.navigate).toHaveBeenCalledWith(['/game']);
            });
        });
    });

    describe('leaveRoom tests', () => {
        it('should call leaveRoomCreator if the selectedDiscussionChannel owner is the player', () => {
            discussionChannel.owner = { username: playerService.player.pseudo } as unknown as Account;
            component.selectedDiscussionChannel = discussionChannel;
            const socketSendSpy = spyOn(socketServiceMock, 'send');
            component.leaveRoom();
            expect(socketSendSpy).toHaveBeenCalledWith(SocketEvent.LeaveRoomCreator, roomName);
        });

        it('should call reinitialize room when leaveRoomCreator', () => {
            discussionChannel.owner = { username: playerService.player.pseudo } as unknown as Account;
            component.selectedDiscussionChannel = discussionChannel;
            const reinitializeRoomSpy = spyOn(component.room, 'reinitialize');
            component.leaveRoom();
            expect(reinitializeRoomSpy).toHaveBeenCalledWith(component.room.roomInfo.gameType);
        });

        it('should navigate to main page when leaveRoomCreator', () => {
            discussionChannel.owner = { username: playerService.player.pseudo } as unknown as Account;
            component.selectedDiscussionChannel = discussionChannel;
            component.leaveRoom();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
        });

        it('should call leaveRoomOther if the selectedDiscussionChannel owner is the player', () => {
            discussionChannel.owner = { username: 'other' } as unknown as Account;
            component.selectedDiscussionChannel = discussionChannel;
            const socketSendSpy = spyOn(socketServiceMock, 'send');
            component.leaveRoom();
            expect(socketSendSpy).toHaveBeenCalledWith(SocketEvent.LeaveRoomOther, roomName);
        });

        it('should call reinitialize room when leaveRoomOther', () => {
            discussionChannel.owner = { username: 'other' } as unknown as Account;
            component.selectedDiscussionChannel = discussionChannel;
            const reinitializeRoomSpy = spyOn(component.room, 'reinitialize');
            component.leaveRoom();
            expect(reinitializeRoomSpy).toHaveBeenCalledWith(component.room.roomInfo.gameType);
        });

        it('should navigate to main page when leaveRoomOther', () => {
            discussionChannel.owner = { username: 'other' } as unknown as Account;
            component.selectedDiscussionChannel = discussionChannel;
            component.leaveRoom();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
        });
    });

    describe('handlePlayerFound tests', () => {
        let data: { room: Room; player: Player };
        let roomMock2: Room;
        beforeEach(() => {
            roomMock2 = new Room();
            roomMock2.roomInfo.name = 'Room2';
            roomMock2.players = [firstPlayer];
            data = { room: roomMock2, player: firstPlayer };
        });

        it('should set the room players correctly on handlePlayerFound', () => {
            component.handlePlayerFound(data);
            expect(component.room.players).toEqual(data.room.players);
        });

        it('should call acceptPlayer when confirmPopup returns true', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            const acceptPlayerSpy = spyOn(component, 'acceptPlayer');
            const rejectPlayerSpy = spyOn(component, 'rejectPlayer');
            component.handlePlayerFound(data);
            expect(acceptPlayerSpy).toHaveBeenCalledWith(data.player.pseudo);
            expect(rejectPlayerSpy).not.toHaveBeenCalled();
        });

        it('should call rejectPlayer when confirmPopup returns false', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<typeof component>);
            const acceptPlayerSpy = spyOn(component, 'acceptPlayer');
            const rejectPlayerSpy = spyOn(component, 'rejectPlayer');
            component.handlePlayerFound(data);
            expect(acceptPlayerSpy).not.toHaveBeenCalled();
            expect(rejectPlayerSpy).toHaveBeenCalledWith(data.player.pseudo);
        });
    });

    it('should send AcceptPlayer event on acceptPlayer', () => {
        const playerName = 'harry';
        const socketSendSpy = spyOn(socketServiceMock, 'send');
        component.acceptPlayer(playerName);
        expect(socketSendSpy).toHaveBeenCalledWith(SocketEvent.AcceptPlayer, { roomName: component.room.roomInfo.name, playerName });
    });

    it('should send RejectPlayer event on rejectPlayer', () => {
        const playerName = 'harry';
        const socketSendSpy = spyOn(socketServiceMock, 'send');
        component.rejectPlayer(playerName);
        expect(socketSendSpy).toHaveBeenCalledWith(SocketEvent.RejectPlayer, { roomName: component.room.roomInfo.name, playerName });
    });

    it('should send StartGameRequest event on requestGameStart', () => {
        const socketSendSpy = spyOn(socketServiceMock, 'send');
        component.requestGameStart();
        expect(socketSendSpy).toHaveBeenCalledWith(SocketEvent.StartGameRequest, component.room.roomInfo.name);
    });

    describe('logOut tests', () => {
        const playerName = 'player1';
        it('should send LeaveChatChannel event on logOut', () => {
            playerService.player.pseudo = playerName;
            const socketSendSpy = spyOn(socketServiceMock, 'send');
            component.logOut();
            expect(socketSendSpy).toHaveBeenCalledWith(SocketEvent.LeaveChatChannel, {
                channel: 'General Chat',
                username: playerName,
            });
        });

        it('should setValue correctly on logOut', () => {
            playerService.player.pseudo = playerName;
            component.logOut();
            expect(playerService.player.pseudo).toEqual('');
        });

        it('should navigate to home on logOut', () => {
            component.logOut();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
        });
    });

    describe('handleGameWaitPage tests', () => {
        it('should call showChatChannel on handleGameWaitPage if isWaitMultiPage', () => {
            component.isWaitMultiPage = true;
            discussionChannel.name = playerService.room.roomInfo.name;
            component.availableDiscussionChannels = [discussionChannel];
            const indexOfDiscussionChannel = 0;
            const getDiscussionChannelSpy = spyOn(component as any, 'getDiscussionChannelByName').and.returnValue(discussionChannel);
            const showChatChannelSpy = spyOn(component, 'showChatChannel');
            (component as any).handleGameWaitPage();
            expect(getDiscussionChannelSpy).toHaveBeenCalledWith(playerService.room.roomInfo.name);
            expect(showChatChannelSpy).toHaveBeenCalledWith(indexOfDiscussionChannel);
        });

        it('should not call showChatChannel if it is not isWaitMultiPage', () => {
            component.isWaitMultiPage = false;
            const showChatChannelSpy = spyOn(component, 'showChatChannel');
            (component as any).handleGameWaitPage();
            expect(showChatChannelSpy).not.toHaveBeenCalled();
        });

        it('should not call showChatChannel on handleGameWaitPage on isWaitMultiPage if gameRoomChat is undef', () => {
            component.isWaitMultiPage = true;
            const getDiscussionChannelSpy = spyOn(component as any, 'getDiscussionChannelByName').and.returnValue(undefined);
            const showChatChannelSpy = spyOn(component, 'showChatChannel');
            (component as any).handleGameWaitPage();
            expect(getDiscussionChannelSpy).toHaveBeenCalledWith(playerService.room.roomInfo.name);
            expect(showChatChannelSpy).not.toHaveBeenCalled();
        });
    });

    it('should send GetDiscussionChannels signal on updateAvailableChannels', () => {
        const socketSendSpy = spyOn(socketServiceMock, 'send');
        component.updateAvailableChannels();
        expect(socketSendSpy).toHaveBeenCalledWith(SocketEvent.GetDiscussionChannels);
    });

    it('should return the correct discussionChannel on  getDiscussionChannelByName', () => {
        component.availableDiscussionChannels = [discussionChannel];
        expect((component as any).getDiscussionChannelByName(discussionChannel.name)).toEqual(discussionChannel);
    });
});
