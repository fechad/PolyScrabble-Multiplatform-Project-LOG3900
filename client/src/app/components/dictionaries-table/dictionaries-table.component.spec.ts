// Some methods are private and I needed them for my tests
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
    SUCCESSFUL_DELETE_ALL_MESSAGE,
    SUCCESSFUL_DELETE_MESSAGE,
    SUCCESSFUL_EDIT_MESSAGE,
    SUCCESSFUL_UPLOAD_MESSAGE,
} from '@app/constants/dictionary-constant';
import { HttpService } from '@app/http.service';
import { Dictionary } from '@app/interfaces/dictionary';
import { MatDialogMock } from '@app/pages/main-page/main-page.component.spec';
import { of } from 'rxjs';
import { DEFAULT_DICTIONARY_TITLE, DictionariesTableComponent } from './dictionaries-table.component';

describe('DictionariesTableComponent', () => {
    let component: DictionariesTableComponent;
    let fixture: ComponentFixture<DictionariesTableComponent>;
    let httpService: HttpService;
    let fakeDictionary: Dictionary;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [DictionariesTableComponent],
            providers: [{ provide: HttpService }, { provide: MatDialog, useClass: MatDialogMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DictionariesTableComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        fakeDictionary = { title: 'anglais', description: 'very useful' };
        dialog = fixture.debugElement.injector.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('deleteDictionary tests', () => {
        it('should call deleteDictionary from the httpService with the title provided', async () => {
            const spy = spyOn(httpService, 'deleteDictionary').and.returnValue(of({} as Dictionary));
            spyOn(component, 'handleRefresh').and.resolveTo();
            await component.deleteDictionary('english');
            expect(spy).toHaveBeenCalledOnceWith('english');
        });
        it('should refresh the table when no error occurs', async () => {
            const deleteSpy = spyOn(httpService, 'deleteDictionary').and.returnValue(of({} as Dictionary));
            const refreshSpy = spyOn(component, 'handleRefresh').and.resolveTo();
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            await component.deleteDictionary('english');
            expect(refreshSpy).toHaveBeenCalledOnceWith();
            expect(deleteSpy).toHaveBeenCalledBefore(refreshSpy);
        });
        it('should refresh the table when an error occurs', async () => {
            const deleteSpy = spyOn(httpService, 'deleteDictionary').and.returnValue(of({} as Dictionary));
            const refreshSpy = spyOn(component, 'handleRefresh').and.resolveTo();
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            await component.deleteDictionary('english');
            expect(refreshSpy).toHaveBeenCalledOnceWith();
            expect(deleteSpy).toHaveBeenCalledBefore(refreshSpy);
        });
        it('should clear the success message when an error occurs !', async () => {
            spyOn(httpService, 'deleteDictionary').and.returnValue(of({} as Dictionary));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            spyOn(component, 'handleRefresh').and.resolveTo();
            const spy = spyOn(component, 'clearSuccessMessage');
            await component.deleteDictionary('english');
            expect(spy).toHaveBeenCalled();
        });
        it('should set the success message when no error occurs', async () => {
            component.successMessage = '';
            spyOn(httpService, 'deleteDictionary').and.returnValue(of({} as Dictionary));
            spyOn(component, 'handleRefresh').and.resolveTo();
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            await component.deleteDictionary('english');
            expect(component.successMessage).toEqual(SUCCESSFUL_DELETE_MESSAGE);
        });
    });

    describe('validateDictionaryDeletionWithUser', () => {
        it('should call deleteDictionary when the popup returns true', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'deleteDictionary').and.returnValue(Promise.resolve());
            component.validateDictionaryDeletionWithUser(fakeDictionary);
            expect(spy).toHaveBeenCalled();
        });
        it('should not call deleteDictionary when the popup returns false', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'deleteDictionary').and.returnValue(Promise.resolve());
            component.validateDictionaryDeletionWithUser(fakeDictionary);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should not call deleteDictionary when the popup returns undefined', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(undefined) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'deleteDictionary').and.returnValue(Promise.resolve());
            component.validateDictionaryDeletionWithUser(fakeDictionary);
            expect(spy).not.toHaveBeenCalled();
        });
    });
    describe('handleRefresh() tests', () => {
        it('should call getAllDictionaries', async () => {
            const spy = spyOn(httpService, 'getAllDictionaries').and.returnValue(of([]));
            await component.handleRefresh();
            expect(spy).toHaveBeenCalled();
        });
        it('should open an error dialog when an HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([]));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            const errorDialogSpy = spyOn(component, 'openErrorDialog' as any);
            await component.handleRefresh();
            expect(errorDialogSpy).toHaveBeenCalled();
        });
        it('should NOT open an error when no HTTP error has occurred', async () => {
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of([]));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            const errorDialogSpy = spyOn(component, 'openErrorDialog' as any);
            await component.handleRefresh();
            expect(errorDialogSpy).not.toHaveBeenCalled();
        });

        it('should update the dictionaries dialog when no HTTP error has occurred', async () => {
            component.dictionaries = [];
            const serverDictionaries: Dictionary[] = [fakeDictionary];
            spyOn(httpService, 'getAllDictionaries').and.returnValue(of(serverDictionaries));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- oppenErrorDialog is private and must not become public for the tests
            const errorDialogSpy = spyOn(component, 'openErrorDialog' as any);
            await component.handleRefresh();
            expect(errorDialogSpy).not.toHaveBeenCalled();
            expect(component.dictionaries).toEqual(serverDictionaries);
        });
    });
    describe('canBeDelete tests', () => {
        it('should return false when the dictionary is the default one', () => {
            expect(component.canBeDeleted(DEFAULT_DICTIONARY_TITLE)).toBeFalse();
        });
        it('should return true when the dictionary is NOT the default one', () => {
            expect(component.canBeDeleted('idk man')).toBeTrue();
        });
    });

    describe('openDictionaryModificationPopup tests', () => {
        let updatedDictionary: Dictionary;
        beforeEach(() => {
            updatedDictionary = { title: 'summer', description: 'season' };
            component.successMessage = '';
        });
        it('should call handleRefresh when the dictionary has been modified', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(updatedDictionary) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'handleRefresh');
            component.openDictionaryModificationPopup(fakeDictionary);
            expect(spy).toHaveBeenCalled();
        });
        it('should not call handleRefresh when the dictionary has not been modified', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(fakeDictionary) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'handleRefresh');
            component.openDictionaryModificationPopup(fakeDictionary);
            expect(spy).not.toHaveBeenCalled();
            expect(component.successMessage).toEqual('');
        });
        it('should not call handleRefresh when the returned value is undefined', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(undefined) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'handleRefresh');
            component.openDictionaryModificationPopup(fakeDictionary);
            expect(spy).not.toHaveBeenCalled();
            expect(component.successMessage).toEqual('');
        });
        it('should update the success message when a dictionary has been modified', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(updatedDictionary) } as MatDialogRef<typeof component>);
            spyOn(component, 'handleRefresh');
            component.openDictionaryModificationPopup(fakeDictionary);
            expect(component.successMessage).toEqual(SUCCESSFUL_EDIT_MESSAGE);
        });
    });
    describe('openUploadDictionaryPopup tests', () => {
        beforeEach(() => {
            component.successMessage = '';
        });
        it('should call handleRefresh when a dictionary has been added', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'handleRefresh');
            component.openUploadDictionaryPopup();
            expect(spy).toHaveBeenCalled();
        });
        it('should not call handleRefresh when the dictionary has not been modified', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'handleRefresh');
            component.openUploadDictionaryPopup();
            expect(spy).not.toHaveBeenCalled();
            expect(component.successMessage).toEqual('');
        });
        it('should not call handleRefresh when the returned value is undefined', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(undefined) } as MatDialogRef<typeof component>);
            const spy = spyOn(component, 'handleRefresh');
            component.openUploadDictionaryPopup();
            expect(spy).not.toHaveBeenCalled();
            expect(component.successMessage).toEqual('');
        });
        it('should update the success message when a dictionary has been modified', () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(component, 'handleRefresh');
            component.openUploadDictionaryPopup();
            expect(component.successMessage).toEqual(SUCCESSFUL_UPLOAD_MESSAGE);
        });
    });

    describe('downloadDictionary tests', () => {
        let dataString: string;
        let anchorElement: HTMLAnchorElement;
        let httpGetSpy: jasmine.Spy<jasmine.Func>;
        let clickSpy: jasmine.Spy<jasmine.Func>;
        beforeEach(() => {
            dataString = 'data:text/json;charset=utf-8,';
            anchorElement = document.createElement('a');
            httpGetSpy = spyOn(httpService, 'getDictionary').and.returnValue(of(fakeDictionary));
            clickSpy = spyOn(anchorElement, 'click').and.callFake(() => {
                return;
            });
        });
        it('should set the attribute download with dictionary.json and href', async () => {
            spyOn(document, 'getElementById').and.returnValue(anchorElement);
            spyOn(component, 'generateDataString' as any).and.returnValue(dataString);
            const spy = spyOn(anchorElement, 'setAttribute');
            await component.downloadDictionary(fakeDictionary);
            expect(spy).toHaveBeenCalledWith('download', 'dictionary.json');
            expect(spy).toHaveBeenCalledWith('href', dataString);
        });
        it('should click on the anchor when it exists', async () => {
            spyOn(document, 'getElementById').and.returnValue(anchorElement);
            await component.downloadDictionary(fakeDictionary);
            expect(clickSpy).toHaveBeenCalled();
        });
        it('should not generate a datastring when the anchor element does not exist', async () => {
            spyOn(document, 'getElementById').and.returnValue(null);
            const spy = spyOn(component, 'generateDataString' as any).and.returnValue(dataString);
            await component.downloadDictionary(fakeDictionary);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should get the dictionary using HTTP when the anchor element exists', async () => {
            spyOn(document, 'getElementById').and.returnValue(anchorElement);
            await component.downloadDictionary(fakeDictionary);
            expect(httpGetSpy).toHaveBeenCalled();
        });
    });
    describe('handleResetDictionaries tests', () => {
        let refreshSpy: jasmine.Spy<jasmine.Func>;
        let httpDeleteAllSpy: jasmine.Spy<jasmine.Func>;
        beforeEach(async () => {
            refreshSpy = spyOn(component, 'handleRefresh').and.resolveTo();
            httpDeleteAllSpy = spyOn(httpService, 'deleteAllDictionariesExceptDefault').and.returnValue(of([fakeDictionary]));
        });
        it('should open a dialog to confirm with the user that he wants to reset', async () => {
            const spy = spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<typeof component>);
            await component.handleResetDictionaries();
            expect(spy).toHaveBeenCalled();
        });
        it('should not call deleteAllDictionaries when the user cancels his reset', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<typeof component>);
            await component.handleResetDictionaries();
            expect(httpDeleteAllSpy).not.toHaveBeenCalled();
        });
        it('should call httpService.deleteAllDictionariesExceptDefault when the user confirms the reset', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            await component.handleResetDictionaries();
            expect(httpDeleteAllSpy).toHaveBeenCalled();
        });
        it('should Refresh the table when an error occur', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            await component.handleResetDictionaries();
            expect(refreshSpy).toHaveBeenCalled();
        });
        it('should Refresh the table when no error occur', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            await component.handleResetDictionaries();
            expect(refreshSpy).toHaveBeenCalled();
        });
        it('should display SUCCESSFUL_DELETE_ALL_MESSAGE when the reset is successful', async () => {
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            const spy = spyOn(component, 'openErrorDialog' as any);
            await component.handleResetDictionaries();
            expect(component.successMessage).toEqual(SUCCESSFUL_DELETE_ALL_MESSAGE);
            expect(spy).not.toHaveBeenCalled();
        });
        it('should open an error dialog and reset the success message when the reset is NOT successful', async () => {
            component.successMessage = 'yessir !';
            spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            const spy = spyOn(component, 'openErrorDialog' as any);
            await component.handleResetDictionaries();
            expect(spy).toHaveBeenCalled();
            expect(component.successMessage).toEqual('');
        });
    });
});
