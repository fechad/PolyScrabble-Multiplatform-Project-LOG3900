import { Component, OnInit } from '@angular/core';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { LOG_2990_GAME_TYPE, MAX_RECONNECTION_DELAY, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { ERROR, RACK_CAPACITY } from '@app/constants/rack-constants';
import { GoalDescription } from '@app/enums/goal-descriptions';
import { GoalTitle } from '@app/enums/goal-titles';
import { Goal } from '@app/interfaces/goal';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-goals-container',
    templateUrl: './goals-container.component.html',
    styleUrls: ['./goals-container.component.scss'],
})
export class GoalsContainerComponent implements OnInit {
    lettersBankCount: number;
    publicGoals: Goal[];
    privateGoal: Goal;
    otherPlayerPrivateGoal: Goal;

    constructor(private socketService: SocketClientService, private room: Room, private player: Player) {
        this.lettersBankCount = 0;
        this.publicGoals = [];
        this.privateGoal = {
            title: GoalTitle.Error,
            description: GoalDescription.Error,
            reward: ERROR,
            reached: false,
            isPublic: false,
            players: [this.player],
        };
        this.otherPlayerPrivateGoal = { ...this.privateGoal };
    }

    ngOnInit() {
        this.connect();
        if (this.room.roomInfo.gameType !== LOG_2990_GAME_TYPE) return;
        this.socketService.send('getAllGoals');
    }

    get is2990GameType(): boolean {
        return this.room.roomInfo.gameType === LOG_2990_GAME_TYPE;
    }

    private setOtherPlayerPrivateGoal(goal: Goal) {
        this.otherPlayerPrivateGoal = goal;
        if (goal.reached) return;

        this.otherPlayerPrivateGoal.title = GoalTitle.UnknownTitle;
        this.otherPlayerPrivateGoal.reward = undefined as unknown as number;
        this.otherPlayerPrivateGoal.description = GoalDescription.UnknownDescription;
    }

    private connect() {
        if (this.socketService.isSocketAlive()) {
            this.configureBaseSocketFeatures();
            return;
        }
        this.tryReconnection();
    }

    private tryReconnection() {
        let secondPassed = 0;

        const timerInterval = setInterval(() => {
            if (secondPassed >= MAX_RECONNECTION_DELAY) {
                clearInterval(timerInterval);
            }
            if (this.socketService.isSocketAlive()) {
                this.configureBaseSocketFeatures();
                this.socketService.send('getAllGoals');
                clearInterval(timerInterval);
            }
            secondPassed++;
        }, ONE_SECOND_IN_MS);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('lettersBankCountUpdated', (lettersBankCount: number) => {
            this.lettersBankCount = lettersBankCount;
            if (lettersBankCount < RACK_CAPACITY) {
                this.room.isBankUsable = false;
            }
        });

        this.socketService.on('goalsUpdated', (goals: Goal[]) => {
            this.publicGoals = goals.filter((goal) => goal.isPublic);

            goals.forEach((goal) => {
                if (goal.isPublic) {
                    return;
                }
                goal.players.forEach((player) => {
                    if (player.pseudo === this.player.pseudo) {
                        this.privateGoal = goal;
                        return;
                    }
                    this.setOtherPlayerPrivateGoal(goal);
                });
            });
        });
    }
}
