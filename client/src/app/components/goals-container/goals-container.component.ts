import { Component, OnInit } from '@angular/core';
import { ComponentCommunicationManager } from '@app/classes/communication-manager/component-communication-manager';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { LOG_2990_GAME_TYPE } from '@app/constants/constants';
import { ERROR, RACK_CAPACITY } from '@app/constants/rack-constants';
import { GoalDescription } from '@app/enums/goal-descriptions';
import { GoalTitle } from '@app/enums/goal-titles';
import { SocketEvent } from '@app/enums/socket-event';
import { Goal } from '@app/interfaces/goal';
import { PlayerService } from '@app/services/player.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-goals-container',
    templateUrl: './goals-container.component.html',
    styleUrls: ['./goals-container.component.scss'],
})
export class GoalsContainerComponent extends ComponentCommunicationManager implements OnInit {
    lettersBankCount: number;
    publicGoals: Goal[];
    privateGoal: Goal;
    otherPlayerPrivateGoal: Goal;

    constructor(protected socketService: SocketClientService, private playerService: PlayerService) {
        super(socketService);
        this.lettersBankCount = 0;
        this.publicGoals = [
            {
                title: GoalTitle.AtLeastFive,
                description: GoalDescription.AtLeastFive,
                reward: 30,
                reached: false,
                isPublic: true,
                players: [this.player],
            },
            {
                title: GoalTitle.FirstToHundred,
                description: GoalDescription.FirstToHundred,
                reward: 30,
                reached: true,
                isPublic: true,
                players: [this.player],
            },
        ];
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

    get room(): Room {
        return this.playerService.room;
    }

    get player(): Player {
        return this.playerService.player;
    }

    get is2990GameType(): boolean {
        return this.room.roomInfo.gameType === LOG_2990_GAME_TYPE;
    }

    ngOnInit() {
        this.connectSocket();
        this.socketService.send(SocketEvent.GetAllGoals);
    }

    protected configureBaseSocketFeatures() {
        this.socketService.on(SocketEvent.LettersBankCountUpdated, (lettersBankCount: number) => {
            this.lettersBankCount = lettersBankCount;
            if (lettersBankCount < RACK_CAPACITY) {
                this.room.isBankUsable = false;
            }
        });

        this.socketService.on(SocketEvent.GoalsUpdated, (goals: Goal[]) => {
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

    private setOtherPlayerPrivateGoal(goal: Goal) {
        this.otherPlayerPrivateGoal = goal;
        if (goal.reached) return;

        this.otherPlayerPrivateGoal.title = GoalTitle.UnknownTitle;
        this.otherPlayerPrivateGoal.reward = undefined as unknown as number;
        this.otherPlayerPrivateGoal.description = GoalDescription.UnknownDescription;
    }
}
