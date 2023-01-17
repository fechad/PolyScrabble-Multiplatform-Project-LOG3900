import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GoalDialogDataComponent } from '@app/components/goal-dialog-data/goal-dialog-data.component';
import { GoalDescription } from '@app/enums/goal-descriptions';
import { GoalRewards } from '@app/enums/goal-rewards';
import { GoalTitle } from '@app/enums/goal-titles';
import { Goal } from '@app/interfaces/goal';

const GOAL_DIALOG_WIDTH = '400px';
@Component({
    selector: 'app-goal',
    templateUrl: './goal.component.html',
    styleUrls: ['./goal.component.scss'],
})
export class GoalComponent {
    @Input() title: GoalTitle;
    @Input() description: GoalDescription;
    @Input() reward: GoalRewards;
    @Input() reached: boolean;
    @Input() isPublic: boolean;
    constructor(private dialog: MatDialog) {}

    showGoalComponent() {
        this.dialog.open(GoalDialogDataComponent, {
            width: GOAL_DIALOG_WIDTH,
            autoFocus: true,
            data: { title: this.title, description: this.description, reward: this.reward, reached: this.reached, isPublic: this.isPublic } as Goal,
        });
    }
}
