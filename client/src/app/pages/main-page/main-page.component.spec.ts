import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Score } from '@app/classes/score';
import { LeaderboardDialogDataComponent } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component';
import { HttpService } from '@app/http.service';
import { routes } from '@app/modules/app-routing.module';
import { DIALOG_WIDTH, LEADERBOARD_SIZE, MainPageComponent } from '@app/pages/main-page/main-page.component';
import { of } from 'rxjs';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let dialog: MatDialog;
    let httpService: HttpService;
    const isoDate = '2022-03-16T14:26:51.458Z';
    beforeEach(async () => {
        return await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule, BrowserAnimationsModule],
            declarations: [MainPageComponent],
            providers: [{ provide: MatDialog, useClass: MatDialogMock }, { provide: HttpService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        dialog = fixture.debugElement.injector.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have an admin route (/admin) and the component associated with it to be AdminPageComponent', () => {
        const adminRouteObject = routes.find((routeObject) => routeObject.path === 'admin');
        expect(adminRouteObject).toBeDefined();
        expect(adminRouteObject?.component).toBeDefined();
        expect(adminRouteObject?.component).toEqual(AdminPageComponent);
    });

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('LOG2990');
    });

    it('setGameType(classic) should change gameType to classic', () => {
        component.setGameType('classic');
        expect(component.room.roomInfo.gameType).toEqual('classic');
    });
    describe('showLeaderboard() tests', () => {
        it('should call getNScoresByCategory twice to get the 5 best scores from the game modes log2990 and classic', async () => {
            const spy = spyOn(httpService, 'getNScoresByCategory').and.returnValue(of([{} as Score]));
            await component.showLeaderboard();
            expect(spy).toHaveBeenCalledWith('log2990', LEADERBOARD_SIZE);
            expect(spy).toHaveBeenCalledWith('classic', LEADERBOARD_SIZE);
            expect(spy).toHaveBeenCalledTimes(2);
        });
        it('should open a dialog with the fetched data', async () => {
            const scores: Score[] = [
                { author: 'user1', points: 0, gameType: 'log2990', dictionary: 'english', date: isoDate },
                { author: 'user2', points: 5, gameType: 'log2990', dictionary: 'english', date: isoDate },
            ];
            spyOn(httpService, 'getNScoresByCategory').and.returnValue(of(scores));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            const spy = spyOn(dialog, 'open');
            await component.showLeaderboard();
            expect(spy).toHaveBeenCalledWith(LeaderboardDialogDataComponent, { width: DIALOG_WIDTH, autoFocus: true, data: [scores, scores] });
        });
        it('should open an error dialog when getting the scores of a gameType and an error occurred', async () => {
            spyOn(httpService, 'getNScoresByCategory').and.returnValue(of());
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            // We want to test private method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dialogSpy = spyOn(component, 'showErrorDialog' as any).and.callThrough();
            await component.showLeaderboard();
            expect(dialogSpy).toHaveBeenCalled();
        });
    });
    describe('showAllScores() tests', () => {
        it('should call fetchAllScores', async () => {
            const spy = spyOn(httpService, 'fetchAllScores').and.returnValue(of([]));
            await component.showAllScores();
            expect(spy).toHaveBeenCalledWith();
        });
        it('should open an error dialog when getting the scores of a gameType', async () => {
            spyOn(dialog, 'open');
            spyOn(httpService, 'fetchAllScores').and.returnValue(of());
            // We want to test private method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dialogSpy = spyOn(component, 'showErrorDialog' as any).and.callThrough();
            await component.showAllScores();
            expect(dialogSpy).toHaveBeenCalled();
        });
    });
});
