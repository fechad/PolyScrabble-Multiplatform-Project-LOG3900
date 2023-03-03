import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketClientServiceMock } from '@app/classes/socket-client-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client.service';
import { GameWaitMultiplayerPageComponent } from './game-wait-multiplayer-page.component';

describe('GameWaitMultiplayerPageComponent', () => {
    let component: GameWaitMultiplayerPageComponent;
    let fixture: ComponentFixture<GameWaitMultiplayerPageComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock(socketHelper);

        await TestBed.configureTestingModule({
            declarations: [GameWaitMultiplayerPageComponent],
            providers: [{ provide: SocketClientService, useValue: socketServiceMock }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameWaitMultiplayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
