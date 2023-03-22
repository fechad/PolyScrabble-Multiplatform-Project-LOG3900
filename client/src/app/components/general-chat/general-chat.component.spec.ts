import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ThemeService } from '@app/services/theme.service';
import { GeneralChatComponent } from './general-chat.component';

const playerName = 'player1';

describe('GeneralChatComponent', () => {
    let component: GeneralChatComponent;
    let fixture: ComponentFixture<GeneralChatComponent>;

    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let playerService: PlayerService;
    let themeService: ThemeService;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);

        playerService = new PlayerService();
        themeService = new ThemeService(playerService);
        playerService.player.pseudo = playerName;

        await TestBed.configureTestingModule({
            declarations: [GeneralChatComponent],
            providers: [
                { provide: PlayerService, useValue: playerService },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: ThemeService, usevalue: themeService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(GeneralChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('isSender tests', () => {
        it('should return true if channelMessage sender === player pseudo', () => {
            const channelMessage = { channelName: '', sender: playerName, system: false, time: '', message: '' };
            expect(component.isSender(channelMessage)).toBeTruthy();
        });

        it('should return false if channelMessage sender !== player pseudo', () => {
            const channelMessage = { channelName: '', sender: '', system: false, time: '', message: '' };
            expect(component.isSender(channelMessage)).toBeFalsy();
        });
    });

    describe('sendChannelMessage tests', () => {
        let inputElement: { value: string };
        beforeEach(() => {
            inputElement = { value: '' };
        });

        it('should send a channelMessage on sendChannelMessage()', () => {
            inputElement.value = 'valid message';
            const previousMessageLength = component.discussionChannel.messages.length;
            const sendSpy = spyOn(socketServiceMock, 'send');
            component.sendChannelMessage(inputElement as unknown as HTMLInputElement);
            expect(sendSpy).toHaveBeenCalled();
            expect(component.discussionChannel.messages.length).toEqual(previousMessageLength + 1);
        });

        it('should not send a channelMessage on sendChannelMessage() if input is empty', () => {
            const previousMessageLength = component.discussionChannel.messages.length;
            const sendSpy = spyOn(socketServiceMock, 'send');
            component.sendChannelMessage(inputElement as unknown as HTMLInputElement);
            expect(sendSpy).not.toHaveBeenCalled();
            expect(component.discussionChannel.messages.length).toEqual(previousMessageLength);
        });

        it('should not send a channelMessage on sendChannelMessage() if input only has blank space', () => {
            inputElement.value = '     ';
            const previousMessageLength = component.discussionChannel.messages.length;
            const sendSpy = spyOn(socketServiceMock, 'send');
            component.sendChannelMessage(inputElement as unknown as HTMLInputElement);
            expect(sendSpy).not.toHaveBeenCalled();
            expect(component.discussionChannel.messages.length).toEqual(previousMessageLength);
        });
    });
});
