import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client.service';
import { Socket } from 'socket.io-client';
import { GameOptionPageComponent } from './game-option-page.component';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}

describe('GameOptionPageComponent', () => {
    let component: GameOptionPageComponent;
    let fixture: ComponentFixture<GameOptionPageComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        await TestBed.configureTestingModule({
            declarations: [GameOptionPageComponent],
            providers: [{ provide: SocketClientService, useValue: socketServiceMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameOptionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Connection tests', () => {
        it('should call socketServiceMock.disconnect on disconnect if socket is alive', () => {
            const spy1 = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy2 = spyOn(socketServiceMock, 'disconnect');
            component.disconnect();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });

        it('should not call socketServiceMock.disconnect on disconnect if socket is not alive', () => {
            const spy1 = spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
            const spy2 = spyOn(socketServiceMock, 'disconnect');
            component.disconnect();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });
    });
});
