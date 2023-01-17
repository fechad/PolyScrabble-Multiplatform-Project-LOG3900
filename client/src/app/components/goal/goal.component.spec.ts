import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { GoalComponent } from './goal.component';

class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

describe('GoalComponent', () => {
    let component: GoalComponent;
    let fixture: ComponentFixture<GoalComponent>;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GoalComponent],
            providers: [{ provide: MatDialog, useClass: MatDialogMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GoalComponent);
        component = fixture.componentInstance;
        dialog = fixture.debugElement.injector.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('showGoalComponent tests', () => {
        it('should open a popup', () => {
            const spy = spyOn(dialog, 'open');
            component.showGoalComponent();
            expect(spy).toHaveBeenCalled();
        });
    });
});
