import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { EditBotPopupComponent } from '@app/components/edit-bot-popup/edit-bot-popup.component';
import { DEFAULT_BOTS_NAME } from '@app/constants/constants';
import { HttpService } from '@app/http.service';
import { Bot } from '@app/interfaces/bot';
import { of } from 'rxjs';
import { BotsTableComponent, SUCCESSFUL_DELETE_ALL_MESSAGE } from './bots-table.component';

describe('BotsTableComponent', () => {
    let component: BotsTableComponent;
    let fixture: ComponentFixture<BotsTableComponent>;
    let httpService: HttpService;
    let fakeBot: Bot;
    let editBotPopupComponent = jasmine.createSpyObj('EditBotPopupComponent', ['isClosedByEditing']) as jasmine.SpyObj<EditBotPopupComponent>;

    const dialogRef = {
        componentInstance: editBotPopupComponent,
        afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of({})),
        beforeClosed: jasmine.createSpy('beforeClosed').and.returnValue(of({})),
    };
    const mockDialogRef = {
        open: jasmine.createSpy('open').and.returnValue(dialogRef),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [BotsTableComponent],
            providers: [{ provide: HttpService }, { provide: MatDialog, useValue: mockDialogRef }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BotsTableComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        fakeBot = { name: 'BOT A', gameType: 'dÃ©butant' };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleRefresh() tests', () => {
        it('should call getAllBots', async () => {
            const spy = spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
        });
        it('should open an error dialog when an HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            const errorDialogSpy = spyOn(component, 'openErrorDialog' as any);
            await component.handleRefresh();
            expect(errorDialogSpy).toHaveBeenCalled();
        });
        it('should NOT open an error when no HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            const errorDialogSpy = spyOn(component, 'openErrorDialog' as any);
            await component.handleRefresh();
            expect(errorDialogSpy).not.toHaveBeenCalled();
        });
        it('should update the bots dialog when no HTTP error has occurred', async () => {
            component.bots = [];
            const serverBots: Bot[] = [fakeBot];
            spyOn(httpService, 'getAllBots').and.returnValue(of(serverBots));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            const errorDialogSpy = spyOn(component, 'openErrorDialog' as any);
            await component.handleRefresh();
            expect(errorDialogSpy).not.toHaveBeenCalled();
            expect(component.bots).toEqual(serverBots);
        });
        it('should clear the bots when an error has occurred', async () => {
            component.bots = [fakeBot];
            spyOn(httpService, 'getAllBots').and.returnValue(of());
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            await component.handleRefresh();
            expect(component.bots).toEqual([]);
        });
    });
    describe('validateBotDeletionWithUser', () => {
        it('should call deleteBot when the popup returns true', () => {
            const spy = spyOn(component, 'deleteBot').and.returnValue(Promise.resolve());
            component.validateBotDeletionWithUser(fakeBot);
            expect(spy).toHaveBeenCalled();
        });
        it('should not call deleteBot when the popup returns false', () => {
            const spy = spyOn(component, 'deleteBot').and.returnValue(Promise.resolve());
            component.validateBotDeletionWithUser(fakeBot);
            expect(spy).toHaveBeenCalled();
        });
        it('should not call deleteDictionary when the popup returns undefined', () => {
            const spy = spyOn(component, 'deleteBot').and.returnValue(Promise.resolve());
            component.validateBotDeletionWithUser(fakeBot);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('deleteBot tests', () => {
        it('should call deleteBot from the httpService with the title provided', async () => {
            const spy = spyOn(httpService, 'deleteBot').and.returnValue(of({} as Bot));
            spyOn(component, 'handleRefresh').and.resolveTo();
            await component.deleteBot('BOT A');
            expect(spy).toHaveBeenCalledOnceWith('BOT A');
        });
    });

    describe('canBeDelete tests', () => {
        it('should return false when the bot is the default one', () => {
            const index = Math.floor(Math.random() * DEFAULT_BOTS_NAME.length);
            expect(component.canBeDeleted(DEFAULT_BOTS_NAME[index])).toBeFalse();
        });
        it('should return true when the dictionary is NOT the default one', () => {
            expect(component.canBeDeleted('idk man')).toBeTrue();
        });
    });

    describe('addBot tests', () => {
        let bot: Bot;
        beforeEach(() => {
            bot = { name: 'BOTTEGA', gameType: 'expert' };
            component.bots = [bot];
            editBotPopupComponent = jasmine.createSpyObj('EditBotPopupComponent', ['isClosedByEditing']) as jasmine.SpyObj<EditBotPopupComponent>;
        });
        it('should call addBot method with the game Type of the virtual player', () => {
            editBotPopupComponent.isClosedByEditing.and.returnValue(false);
            component.addBot(bot.gameType);
            expect(dialogRef.afterClosed).toHaveBeenCalled();
            expect(dialogRef.beforeClosed).toHaveBeenCalled();
        });

        it('should call addBot method with the game Type of the virtual player', () => {
            editBotPopupComponent.isClosedByEditing.and.returnValue(true);
            spyOn(component, 'handleRefresh').and.returnValue(
                new Promise(() => {
                    return;
                }),
            );
            component.addBot(bot.gameType);
            expect(dialogRef.afterClosed).toHaveBeenCalled();
            expect(dialogRef.beforeClosed).toHaveBeenCalled();
        });
    });

    describe('openBotModificationPopup tests', () => {
        let updatedBot: Bot;
        beforeEach(() => {
            updatedBot = { name: 'BOTTEGA', gameType: 'expert' };
            component.bots = [updatedBot];
            editBotPopupComponent = jasmine.createSpyObj('EditBotPopupComponent', ['isClosedByEditing']) as jasmine.SpyObj<EditBotPopupComponent>;
        });
        it('should call handleRefresh when the bot has been modified', () => {
            editBotPopupComponent.isClosedByEditing.and.returnValue(true);
            const spy = spyOn(component, 'handleRefresh').and.returnValue(
                new Promise(() => {
                    return;
                }),
            );
            component.openBotModificationPopup(fakeBot.name);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should not call handleRefresh when the bot has not been modified', () => {
            editBotPopupComponent.isClosedByEditing.and.returnValue(true);
            const spy = spyOn(component, 'handleRefresh').and.returnValue(
                new Promise(() => {
                    return;
                }),
            );
            component.openBotModificationPopup(updatedBot.name);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should not call handleRefresh when the returned value is undefined', () => {
            editBotPopupComponent.isClosedByEditing.and.returnValue(true);
            const spy = spyOn(component, 'handleRefresh').and.returnValue(
                new Promise(() => {
                    return;
                }),
            );
            component.openBotModificationPopup(updatedBot.name);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('handleResetBots tests', () => {
        let httpDeleteAllSpy: jasmine.Spy<jasmine.Func>;
        beforeEach(async () => {
            httpDeleteAllSpy = spyOn(httpService, 'deleteAllBots').and.returnValue(of([fakeBot]));
        });
        it('should open a dialog to confirm with the user that he wants to reset', () => {
            const spy = spyOn(component, 'handleResetBots');
            component.handleResetBots();
            expect(spy).toHaveBeenCalled();
        });
        it('should call httpService.handleResetBots when the user confirms the reset', () => {
            component.handleResetBots();
            expect(httpDeleteAllSpy).toHaveBeenCalled();
        });
        it('should display SUCCESSFUL_DELETE_ALL_MESSAGE when the reset is successful', () => {
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we need to spy the private method openErrorDialog
            const spy = spyOn(component, 'openErrorDialog' as any);
            component.handleResetBots();
            expect(component.successMessage).not.toEqual(SUCCESSFUL_DELETE_ALL_MESSAGE);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should open an error dialog and reset the success message when the reset is NOT successful', () => {
            component.successMessage = 'yessir !';
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we need to spy the private method openErrorDialog
            spyOn(component, 'openErrorDialog' as any);
            component.handleResetBots();
            expect(component.successMessage).not.toEqual('');
        });
    });
    describe('deleteAllBots tests', () => {
        let refreshSpy: jasmine.Spy<jasmine.Func>;
        let httpDeleteAllSpy: jasmine.Spy<jasmine.Func>;
        beforeEach(async () => {
            refreshSpy = spyOn(component, 'handleRefresh').and.resolveTo();
            httpDeleteAllSpy = spyOn(httpService, 'deleteAllBots').and.returnValue(of([fakeBot]));
        });

        it('should not call deleteAllBots when the user cancels his reset', async () => {
            await component.deleteAllBots();
            expect(httpDeleteAllSpy).toHaveBeenCalled();
        });
        it('should call httpService.deleteAllDictionariesExceptDefault when the user confirms the reset', async () => {
            await component.deleteAllBots();
            expect(httpDeleteAllSpy).toHaveBeenCalled();
        });
        it('should Refresh the table when an error occur', async () => {
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            await component.deleteAllBots();
            expect(refreshSpy).toHaveBeenCalled();
        });
        it('should Refresh the table when no error occur', async () => {
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            await component.deleteAllBots();
            expect(refreshSpy).toHaveBeenCalled();
        });
        it('should display SUCCESSFUL_DELETE_ALL_MESSAGE when the reset is successful', async () => {
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we need to spy the private method openErrorDialog
            const spy = spyOn(component, 'openErrorDialog' as any);
            await component.deleteAllBots();
            expect(component.successMessage).toEqual(SUCCESSFUL_DELETE_ALL_MESSAGE);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should open an error dialog and reset the success message when the reset is NOT successful', async () => {
            component.successMessage = 'yessir !';
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we need to spy the private method openErrorDialog
            const spy = spyOn(component, 'openErrorDialog' as any);
            await component.deleteAllBots();
            expect(spy).toHaveBeenCalled();
            expect(component.successMessage).toEqual('');
        });
    });
});
