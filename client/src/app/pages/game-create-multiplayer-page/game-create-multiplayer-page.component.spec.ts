/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DEFAULT_DICTIONARY_TITLE } from '@app/components/dictionaries-table/dictionaries-table.component';
import { UNREACHABLE_SERVER_MESSAGE } from '@app/constants/http-constants';
import { GameMode } from '@app/enums/game-mode';
import { HttpService } from '@app/http.service';
import { Bot } from '@app/interfaces/bot';
import { Dictionary } from '@app/interfaces/dictionary';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { of } from 'rxjs';
import { GameCreateMultiplayerPageComponent } from './game-create-multiplayer-page.component';

class ActivatedRouteMock {
    mode = '';
    get snapshot() {
        return new ActivatedRouteMock();
    }
    get params() {
        return new ActivatedRouteMock();
    }
}

describe('GameCreateMultiplayerPageComponent', () => {
    let component: GameCreateMultiplayerPageComponent;
    let fixture: ComponentFixture<GameCreateMultiplayerPageComponent>;
    let dialog: MatDialog;
    let formBuilder: FormBuilder;
    let httpService: HttpService;
    let fakeBot: Bot;
    let fakeDictionary: Dictionary;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we want to mock an attribute
    let activatedRouteMock: any;

    beforeEach(async () => {
        formBuilder = new FormBuilder();
        activatedRouteMock = new ActivatedRouteMock();

        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule],
            declarations: [GameCreateMultiplayerPageComponent],
            providers: [
                { provide: FormBuilder, useValue: formBuilder },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: HttpService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCreateMultiplayerPageComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        dialog = fixture.debugElement.injector.get(MatDialog);
        fakeBot = { name: 'BOTEGA', gameType: 'expert' };
        fakeDictionary = { title: 'english', description: 'simply the best' };
        fixture.detectChanges();
        spyOn(component as any, 'resetDefaultDictionary').and.callFake(() => {
            return;
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleRefresh() tests', () => {
        it('should call getAllBots', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([fakeDictionary]));
            const spy = spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
        });
        it('should open an error dialog when an HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([fakeDictionary]));
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const errorDialogSpy = spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            await component.handleRefresh();
            expect(errorDialogSpy).toHaveBeenCalled();
        });
        it('should NOT open an error when no HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([fakeDictionary]));
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const errorDialogSpy = spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            await component.handleRefresh();
            expect(errorDialogSpy).toHaveBeenCalled();
        });

        it('should update the bots dialog when no HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([fakeDictionary]));
            component.bots = [];
            const serverBots: Bot[] = [fakeBot];
            spyOn(httpService, 'getAllBots').and.returnValue(of(serverBots));
            const errorOccurredSpy = spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            await component.handleRefresh();
            expect(errorOccurredSpy).toHaveBeenCalled();
            expect(component.bots).toEqual(serverBots);
        });
        it('should communicate with the server to get all of the dictionaries', async () => {
            const serverDictionaries: Dictionary[] = [fakeDictionary];
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
            expect(component.dictionaries).toEqual(serverDictionaries);
        });
        it('when an error occurs when getting the dictionaries, the list of dictionaries should be emptied', async () => {
            const serverDictionaries: Dictionary[] = [fakeDictionary];
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
            expect(component.dictionaries).toEqual([]);
        });
        it('When the server returns the default dictionary, the selected dictionary should be the default', async () => {
            const serverDictionaries: Dictionary[] = [{ title: DEFAULT_DICTIONARY_TITLE, description: '...' }];
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            component.gameForm.controls.dictionary.setValue('Hipster words');
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
            expect(component.dictionaries).toEqual(serverDictionaries);
            expect(component.selectedDictionary).toEqual(DEFAULT_DICTIONARY_TITLE);
        });
        it('should be possible to selected a dictionary different from the default one (when it is not the only onen)', async () => {
            const serverDictionaries: Dictionary[] = [{ title: DEFAULT_DICTIONARY_TITLE, description: '...' }, fakeDictionary];
            spyOn(httpService, 'getAllBots').and.returnValue(of([]));
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            component.gameForm.controls.dictionary.setValue('Hipster words');
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
            expect(component.selectedDictionary).toEqual(DEFAULT_DICTIONARY_TITLE);
            expect(component.dictionaries).toEqual(serverDictionaries);
            component.handleDictionarySelection(fakeDictionary.title);
            expect(component.selectedDictionary).toEqual(fakeDictionary.title);
        });
    });

    describe('changeBotName', () => {
        let bot1: Bot;
        let bot2: Bot;
        let bot3: Bot;
        let bot4: Bot;
        let bot5: Bot;
        let bot6: Bot;

        beforeEach(() => {
            bot1 = { name: 'BOTTEGA', gameType: 'débutant' };
            bot2 = { name: 'BOTTEG', gameType: 'débutant' };
            bot3 = { name: 'BOTTE', gameType: 'débutant' };
            bot4 = { name: 'BOTEGA', gameType: 'expert' };
            bot5 = { name: 'BOTEG', gameType: 'expert' };
            bot6 = { name: 'BOTE', gameType: 'expert' };
        });
        it('should change virtual player name of a beginner game type', () => {
            component.bots = [bot1, bot2, bot3];
            const beginnersList = component.beginners.map((e) => e.name);
            component.changeBotName();
            expect(beginnersList).toContain(component.botName);
        });
        it('should change virtual player name of a expert game type', () => {
            component.bots = [bot4, bot5, bot6];
            component.changeBotName();
        });
    });

    describe('timerPerTurn tests', () => {
        const notMultipleOf30 = 35;
        const multipleOf30 = 300;
        it('should not validate a number that is not multiple of 30', () => {
            const control: AbstractControl = component.gameForm.get('timerPerTurn') as AbstractControl;
            control.setValue(notMultipleOf30);
            expect(control.status).toEqual('INVALID');
        });
        it('should have multiple of 30 validator', () => {
            const control: AbstractControl = component.gameForm.get('timerPerTurn') as AbstractControl;
            control.setValue(multipleOf30);
            expect(control.status).toEqual('VALID');
        });
    });

    describe('onInit tests', () => {
        it('should set a new gameForm if the gameMode is solo', () => {
            const routeMock = {
                snapshot: { params: { mode: GameMode.Solo } },
            } as unknown as ActivatedRoute;
            // eslint-disable-next-line dot-notation -- we want to access private attribute
            component['route'] = routeMock;
            const groupSpy = spyOn(formBuilder, 'group');
            const onChangeSpy = spyOn(component, 'onChanges');

            component.ngOnInit();
            expect(groupSpy).toHaveBeenCalled();
            expect(onChangeSpy).toHaveBeenCalled();
        });

        it('should not set a new gameForm if the gameMode is not solo', () => {
            component.mode = GameMode.Multi;
            const groupSpy = spyOn(formBuilder, 'group');
            const onChangeSpy = spyOn(component, 'onChanges');

            component.ngOnInit();
            expect(groupSpy).not.toHaveBeenCalled();
            expect(onChangeSpy).toHaveBeenCalled();
        });
    });

    describe('notEqualValidator Bot tests', () => {
        const botName = 'bot A';
        const randomName = 'Sam';

        beforeEach(() => {
            component.gameForm = formBuilder.group({
                pseudo: ['', [component.notEqual(botName)]],
            });
        });

        it('should not validate a name that is equal to the bot name', () => {
            const control: FormControl = component.gameForm.get('pseudo') as FormControl;
            control.setValue(botName);
            expect(control.status).toEqual('INVALID');
        });

        it('should  validate a name that is not equal to the bot name', () => {
            const control: FormControl = component.gameForm.get('pseudo') as FormControl;
            control.setValue(randomName);
            expect(control.status).toEqual('VALID');
        });
    });
    describe('isSelectedDictionary test', () => {
        it('should return true when it is the selected dictionary', () => {
            const title = 'spring water';
            component.gameForm.controls.dictionary.setValue(title);
            const result = component.isSelectedDictionary(title);
            expect(result).toBeTrue();
        });
        it('should return false when it is not the selected dictionary', () => {
            component.gameForm.controls.dictionary.setValue('muddy water');
            const result = component.isSelectedDictionary('spring water');
            expect(result).toBeFalse();
        });
    });
    describe('handleDictionarySelection tests', () => {
        it('should set the value of the dictionary in the form', () => {
            component.gameForm.controls.dictionary.setValue('');
            component.handleDictionarySelection('400BC slangs');
            const dictionary = (component.gameForm.controls.dictionary as FormControl).value;
            expect(dictionary).toEqual('400BC slangs');
        });
    });
    describe('handleDictionaryDeleted tests', () => {
        it('should call handleRefresh', async () => {
            const spy = spyOn(component, 'handleRefresh').and.resolveTo();
            spyOn(dialog, 'open');
            await component.handleDictionaryDeleted();
            expect(spy).toHaveBeenCalled();
        });
        it('should call showErrorDialog', async () => {
            spyOn(component, 'handleRefresh').and.resolveTo();
            const spy = spyOn(component, 'showErrorDialog' as any);
            spyOn(dialog, 'open');
            await component.handleDictionaryDeleted();
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('updateDictionaries direct tests', () => {
        it('should call httpService.getAllDictionaries', async () => {
            component.gameForm.controls.dictionary.setValue('boo');
            const serverDictionaries: Dictionary[] = [fakeDictionary];
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            await component['updateDictionaries']();
            expect(spy).toHaveBeenCalled();
            expect(component.dictionaries).toEqual(serverDictionaries);
        });
    });
    describe('handleHttpError tests', () => {
        it('should call showErrorDialog with the http error message ', () => {
            const message = 'watch out !';
            const spy = spyOn(component, 'showErrorDialog' as any);
            spyOn(dialog, 'open');
            spyOn(httpService, 'getErrorMessage').and.returnValue(message);
            component.handleHttpError();
            expect(spy).toHaveBeenCalledWith(message);
        });

        it('should return true on isServerUnreachable if the error is UNREACHABLE_SERVER_MESSAGE', () => {
            spyOn(httpService, 'getErrorMessage').and.returnValue(UNREACHABLE_SERVER_MESSAGE);
            expect(component.isServerUnreachable).toBeTrue();
        });
    });

    it('should chose a random name from the beginner bots array', async () => {
        spyOn(component, 'handleRefresh').and.resolveTo();

        component.bots = [
            { name: 'botA', gameType: 'débutant' },
            { name: 'botB', gameType: 'débutant' },
        ];

        const botNames = ['botA', 'botB'];

        await component.ngAfterViewInit();
        expect(botNames.includes(component.botName)).toBeTrue();
    });
});
