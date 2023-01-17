/* eslint-disable @typescript-eslint/no-explicit-any */ // we want to test private methods
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from '@app/http.service';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { of } from 'rxjs';
import { BestScoresTableComponent, SUCCESSFUL_REINITIALIZE_SCORES } from './best-scores-table.component';

describe('BestScoresComponent tests', () => {
    let component: BestScoresTableComponent;
    let fixture: ComponentFixture<BestScoresTableComponent>;
    let httpService: HttpService;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [BestScoresTableComponent],
            providers: [{ provide: HttpService }, { provide: MatDialog, useClass: MatDialogMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BestScoresTableComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        dialog = fixture.debugElement.injector.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('handleRefresh() tests', () => {
        it('should call fetchAllScores', async () => {
            const spy = spyOn(httpService, 'fetchAllScores').and.returnValue(of([]));
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
        });
        it('should open an error dialog when an HTTP error has occurred', async () => {
            spyOn(httpService, 'fetchAllScores').and.returnValue(of([]));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            const errorDialogSpy = spyOn(component, 'openErrorDialog' as any);
            await component.handleRefresh();
            expect(errorDialogSpy).toHaveBeenCalled();
        });
        it('should NOT open an error when no HTTP error has occurred', async () => {
            spyOn(httpService, 'fetchAllScores').and.returnValue(of([]));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            const errorDialogSpy = spyOn(component, 'openErrorDialog' as any);
            await component.handleRefresh();
            expect(errorDialogSpy).not.toHaveBeenCalled();
        });
    });
    describe('handleReinitializeScores tests', () => {
        let refreshSpy: jasmine.Spy<jasmine.Func>;
        let httpDeleteAllSpy: jasmine.Spy<jasmine.Func>;
        beforeEach(async () => {
            refreshSpy = spyOn(component, 'handleRefresh').and.resolveTo();
            httpDeleteAllSpy = spyOn(httpService, 'reinitializeScores').and.returnValue(of());
        });
        it('should open a dialog to confirm with the user that he wants to reset', async () => {
            const spy = spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<typeof component>);
            await component.handleReinitializeScores();
            expect(spy).toHaveBeenCalled();
        });
        it('should not call deleteAllDictionaries when the user cancels his reset', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<typeof component>);
            await component.handleReinitializeScores();
            expect(httpDeleteAllSpy).not.toHaveBeenCalled();
        });
        it('should call httpService.reinitializeScores when the user confirms the reset', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            await component.handleReinitializeScores();
            expect(httpDeleteAllSpy).toHaveBeenCalled();
        });
        it('should Refresh the table when an error occur', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            await component.handleReinitializeScores();
            expect(refreshSpy).toHaveBeenCalled();
        });
        it('should Refresh the table when no error occur', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            await component.handleReinitializeScores();
            expect(refreshSpy).toHaveBeenCalled();
        });
        it('should display SUCCESSFUL_REINITIALIZE_SCORES when the reset is successful', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            const spy = spyOn(component, 'openErrorDialog' as any);
            await component.handleReinitializeScores();
            expect(component.successMessage).toEqual(SUCCESSFUL_REINITIALIZE_SCORES);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should open an error dialog and reset the success message when the reset is NOT successful', async () => {
            component.successMessage = 'yessir !';
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            const spy = spyOn(component, 'openErrorDialog' as any);
            await component.handleReinitializeScores();
            expect(spy).toHaveBeenCalled();
            expect(component.successMessage).toEqual('');
        });
    });
});
