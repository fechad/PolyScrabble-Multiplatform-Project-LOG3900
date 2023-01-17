/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRefMock } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component.spec';
import { HttpService } from '@app/http.service';
import { Bot } from '@app/interfaces/bot';
import { of } from 'rxjs';
import { EditBotPopupComponent } from './edit-bot-popup.component';

describe('EditDictionaryPopupComponent', () => {
    let component: EditBotPopupComponent;
    let fixture: ComponentFixture<EditBotPopupComponent>;
    let httpService: HttpService;
    const fakeBot: Bot = { name: 'BOT A', gameType: 'expert' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [EditBotPopupComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: fakeBot },
                { provide: HttpService },
                { provide: FormBuilder },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditBotPopupComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('canModifyBot tests', () => {
        it('should return false when the new name is empty', () => {
            (component.botForm.get('name') as FormControl).setValue('');
            expect(component.canModifyBot()).toBeFalse();
        });
        it('should return false when the new gameType is empty', () => {
            (component.botForm.get('gameType') as FormControl).setValue('');
            expect(component.canModifyBot()).toBeFalse();
        });
        it('should return false when nothing has been modified', () => {
            expect(component.canModifyBot()).toBeFalse();
        });
        it('should return true when only the name has been modified', () => {
            (component.botForm.get('name') as FormControl).setValue('Moha');
            expect(component.canModifyBot()).toBeTrue();
        });
        it('should return true when only the gameType has been modified', () => {
            (component.botForm.get('gameType') as FormControl).setValue('Moha');
            expect(component.canModifyBot()).toBeTrue();
        });
        it('should return true when the gameType and the name have been modified', () => {
            (component.botForm.get('name') as FormControl).setValue('Moha');
            (component.botForm.get('gameType') as FormControl).setValue('Moha');
            expect(component.canModifyBot()).toBeTrue();
        });
    });
    describe('modifyBot tests', () => {
        it('should call updateBot with value of the initial bot from the httpService', async () => {
            const spy = spyOn(httpService, 'updateBot').and.returnValue(of(fakeBot));
            spyOn(component, 'isBotNameUnique' as any).and.returnValue(of(true));
            spyOn(httpService, 'anErrorOccurred').and.returnValues(false);
            await component.modifyBot();
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('generateDuplicateBotMessage tests', () => {
        it('should return a string with the verb ajouter and the bot name when the mode is not edit', () => {
            component.modeEdit = false;
            const result = component['generateDuplicateBotMessage'](fakeBot);
            expect(result.includes(fakeBot.name));
            expect(result.includes('éditer'));
        });
        it('should return a string with the verb ajouter and the bot name when the mode is not edit', () => {
            component.modeEdit = true;
            const result = component['generateDuplicateBotMessage'](fakeBot);
            expect(result.includes(fakeBot.name));
            expect(result.includes('ajouter'));
        });
    });
    describe('handleHttpError tests', () => {
        it('should set the processing to false the set the error message to the one made by http service', () => {
            component.isProcessing = true;
            spyOn(httpService, 'getErrorMessage').and.returnValue('error');
            component['handleHttpError']();
            expect(component.errorMessage).toEqual('error');
            expect(component.isProcessing).toEqual(false);
        });
    });
    describe('isBotNameUnique tests', () => {
        it('should call get all bots', async () => {
            const spy = spyOn(httpService, 'getAllBots').and.returnValue(of([fakeBot]));
            await component['isBotNameUnique'](fakeBot);
            expect(spy).toHaveBeenCalled();
        });
        it('should return false when more than one bot of the gameType have the same name', async () => {
            spyOn(httpService, 'getAllBots').and.returnValue(of([fakeBot, fakeBot]));
            const result = await component['isBotNameUnique'](fakeBot);
            expect(result).toEqual(false);
        });
        it('should return false when one bot already have the name of the updatedBot', async () => {
            spyOn(httpService, 'getAllBots').and.returnValue(of([fakeBot, { name: fakeBot.name, gameType: 'impossible' } as Bot]));
            const result = await component['isBotNameUnique'](fakeBot);
            expect(result).toEqual(false);
        });
        it('should return true when no bot have the name of the updateBot', async () => {
            spyOn(httpService, 'getAllBots').and.returnValue(of([] as Bot[]));
            const result = await component['isBotNameUnique'](fakeBot);
            expect(result).toEqual(true);
        });
        it('should return true when the name of the bot is not unique, BUT the game type is not the same', async () => {
            const otherGametypeBots: Bot[] = [
                { name: fakeBot.name, gameType: 'impossible' },
                { name: fakeBot.name, gameType: 'yessir' },
            ];
            spyOn(httpService, 'getAllBots').and.returnValue(of(otherGametypeBots));
            const result = await component['isBotNameUnique'](fakeBot);
            expect(result).toEqual(true);
        });
    });
    describe('handleDuplicateBot tests', () => {
        it('should call handleHttpError when an http error occurred', () => {
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            const spy = spyOn(component, 'handleHttpError' as any);
            component['handleDuplicateBot'](fakeBot);
            expect(spy).toHaveBeenCalled();
        });
        it('should not call handleHttpError when NO http error occurred and call generateDuplicateBotMessage', () => {
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            const spy = spyOn(component, 'generateDuplicateBotMessage' as any);
            component['handleDuplicateBot'](fakeBot);
            expect(spy).toHaveBeenCalled();
        });
    });
    it('isClosedByEditing should return the botHasBeenEdited', () => {
        expect(component.isClosedByEditing()).toEqual(component['botHasBeenEdited']);
    });
});
