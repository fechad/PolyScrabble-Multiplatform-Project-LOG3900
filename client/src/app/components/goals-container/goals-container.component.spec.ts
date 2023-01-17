import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { LOG_2990_GAME_TYPE, TIMER_TEST_DELAY } from '@app/constants/constants';
import { GoalDescription } from '@app/enums/goal-descriptions';
import { GoalRewards } from '@app/enums/goal-rewards';
import { GoalTitle } from '@app/enums/goal-titles';
import { Goal } from '@app/interfaces/goal';
import { SocketClientService } from '@app/services/socket-client.service';
import { Socket } from 'socket.io-client';
import { GoalsContainerComponent } from './goals-container.component';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}

describe('GoalsContainerComponent', () => {
    let component: GoalsContainerComponent;
    let fixture: ComponentFixture<GoalsContainerComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we need to access private method
    let componentPrivateAccess: any;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let room: Room;
    let firstPlayer: Player;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        room = new Room();
        room.roomInfo = { name: 'Room1', timerPerTurn: '60', dictionary: 'french', gameType: LOG_2990_GAME_TYPE, maxPlayers: 2 };
        room.currentPlayerPseudo = '';

        firstPlayer = new Player();
        firstPlayer.pseudo = 'playerOne';

        await TestBed.configureTestingModule({
            declarations: [GoalsContainerComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: Player, useValue: firstPlayer },
                { provide: Room, useValue: room },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GoalsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        componentPrivateAccess = component;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit tests', () => {
        it('should call socketService.send(getAllGoals) if the roomType is log2990', () => {
            const socketSendSpy = spyOn(socketServiceMock, 'send');
            component.ngOnInit();
            expect(socketSendSpy).toHaveBeenCalledWith('getAllGoals');
        });

        it('should not call socketService.send(getAllGoals) if the roomType is not log2990', () => {
            room.roomInfo.gameType = 'classic';
            const socketSendSpy = spyOn(socketServiceMock, 'send');
            component.ngOnInit();
            expect(socketSendSpy).not.toHaveBeenCalledWith('getAllGoals');
        });
    });

    describe('receiving event', () => {
        let secondPlayer: Player;

        let privateGoal1: Goal;
        let privateGoal2: Goal;
        let publicGoal1: Goal;
        let publicGoal2: Goal;

        beforeEach(() => {
            componentPrivateAccess.configureBaseSocketFeatures();

            secondPlayer = new Player();
            secondPlayer.pseudo = 'player2';

            privateGoal1 = {
                title: GoalTitle.AtLeastFive,
                description: GoalDescription.AtLeastFive,
                reached: false,
                reward: GoalRewards.AtLeastFive,
                isPublic: false,
                players: [firstPlayer],
            };
            privateGoal2 = {
                title: GoalTitle.FirstToHundred,
                description: GoalDescription.FirstToHundred,
                reached: false,
                reward: GoalRewards.FirstToHundred,
                isPublic: false,
                players: [secondPlayer],
            };
            publicGoal1 = {
                title: GoalTitle.NeedOr,
                description: GoalDescription.NeedOr,
                reached: false,
                reward: GoalRewards.NeedOr,
                isPublic: true,
                players: [firstPlayer, secondPlayer],
            };
            publicGoal2 = {
                title: GoalTitle.NoChangeNoPass,
                description: GoalDescription.NoChangeNoPass,
                reached: false,
                reward: GoalRewards.NoChangeNoPass,
                isPublic: true,
                players: [firstPlayer, secondPlayer],
            };
        });
        it('should update the lettersBacnkCount when receiving the event "lettersBankCountUpdated"', () => {
            const nLetters = 5;
            socketHelper.peerSideEmit('lettersBankCountUpdated', nLetters);
            expect(componentPrivateAccess.lettersBankCount).toEqual(nLetters);
        });

        it('should set the goals correctly on goalsUpdated', () => {
            const goals = [privateGoal1, privateGoal2, publicGoal1, publicGoal2];
            socketHelper.peerSideEmit('goalsUpdated', goals);
            expect(component.publicGoals).toEqual([publicGoal1, publicGoal2]);
            expect(component.privateGoal).toEqual(privateGoal1);
        });

        it('should update the value of private goal on goalsUpdated', () => {
            privateGoal1.reached = false;
            component.privateGoal = { ...privateGoal1 };
            privateGoal1.reached = true;
            const goals = [privateGoal1, privateGoal2, publicGoal1, publicGoal2];
            socketHelper.peerSideEmit('goalsUpdated', goals);
            expect(component.privateGoal.reached).toEqual(true);
        });

        it('should update the values of public goal on goalsUpdated', () => {
            publicGoal1.reached = false;
            component.publicGoals = [{ ...publicGoal1 }, { ...privateGoal2 }];
            publicGoal1.reached = true;
            const goals = [privateGoal1, privateGoal2, publicGoal1, publicGoal2];
            socketHelper.peerSideEmit('goalsUpdated', goals);
            const updatedPublicGoal = component.publicGoals.find((goal) => goal.title === publicGoal1.title) as Goal;
            expect(updatedPublicGoal.reached).toEqual(true);
        });

        describe('setOtherPlayerPrivateGoal tests', () => {
            it('should hide the title, reward and description of the private goal if not reached', () => {
                componentPrivateAccess.setOtherPlayerPrivateGoal(privateGoal1);
                expect(component.otherPlayerPrivateGoal.title).toEqual(GoalTitle.UnknownTitle);
                expect(component.otherPlayerPrivateGoal.reward).toEqual(undefined as unknown as number);
                expect(component.otherPlayerPrivateGoal.description).toEqual(GoalDescription.UnknownDescription);
            });

            it('should show the title, reward and description of the private goal when reached', () => {
                privateGoal1.reached = true;
                componentPrivateAccess.setOtherPlayerPrivateGoal(privateGoal1);
                expect(component.otherPlayerPrivateGoal).toEqual(privateGoal1);
            });
        });
    });

    describe('connect() tests', () => {
        it('should call configureBaseSocketFeatures if the socket is alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });

        it('should try to reconnect if the socket is not alive', () => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(componentPrivateAccess, 'tryReconnection');
            componentPrivateAccess.connect();
            expect(spy).toHaveBeenCalled();
        });

        it('should reconnect if the socket is alive', (done) => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(true);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.tryReconnection();

            setTimeout(() => {
                expect(spy).toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });

        it('should not reconnect if the socket is not alive after 5 sec', (done) => {
            spyOn(socketServiceMock, 'isSocketAlive').and.returnValue(false);
            const spy = spyOn(componentPrivateAccess, 'configureBaseSocketFeatures');
            componentPrivateAccess.tryReconnection();

            setTimeout(() => {
                expect(spy).not.toHaveBeenCalled();
                done();
            }, TIMER_TEST_DELAY);
        });
    });
});
