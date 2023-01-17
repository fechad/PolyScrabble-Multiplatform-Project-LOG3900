/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
/* eslint-disable @typescript-eslint/no-explicit-any */ // We want to spy private methods and use private attributes for some tests
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRefMock } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component.spec';
import { FORBIDDEN_MESSAGE } from '@app/constants/http-constants';
import { HttpService } from '@app/http.service';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryValidatorService } from '@app/services/dictionary-validator.service';
import { of } from 'rxjs';
import { EditDictionaryPopupComponent } from './edit-dictionary-popup.component';

describe('EditDictionaryPopupComponent', () => {
    let component: EditDictionaryPopupComponent;
    let fixture: ComponentFixture<EditDictionaryPopupComponent>;
    let httpService: HttpService;
    let dialogReference: MatDialogRef<EditDictionaryPopupComponent>;
    let dictionaryValidator: DictionaryValidatorService;
    const fakeDictionary: Dictionary = { title: 'english', description: 'simply the best' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [EditDictionaryPopupComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: fakeDictionary },
                { provide: HttpService },
                { provide: FormBuilder },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditDictionaryPopupComponent);
        component = fixture.componentInstance;
        httpService = fixture.debugElement.injector.get(HttpService);
        dialogReference = fixture.debugElement.injector.get(MatDialogRef);
        dictionaryValidator = fixture.debugElement.injector.get(DictionaryValidatorService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('canModifyDictionary tests', () => {
        it('should return false when the new title is empty', () => {
            (component.dictionaryForm.get('title') as FormControl).setValue('');
            expect(component.canModifyDictionary()).toBeFalse();
        });
        it('should return false when the new description is empty', () => {
            (component.dictionaryForm.get('description') as FormControl).setValue('');
            expect(component.canModifyDictionary()).toBeFalse();
        });
        it('should return false when nothing has been modified', () => {
            expect(component.canModifyDictionary()).toBeFalse();
        });
        it('should return true when only the title has been modified', () => {
            (component.dictionaryForm.get('title') as FormControl).setValue('yooo');
            expect(component.canModifyDictionary()).toBeTrue();
        });
        it('should return true when only the description has been modified', () => {
            (component.dictionaryForm.get('description') as FormControl).setValue('yooo');
            expect(component.canModifyDictionary()).toBeTrue();
        });
        it('should return true when the description and the tile have been modified', () => {
            (component.dictionaryForm.get('title') as FormControl).setValue('yooo');
            (component.dictionaryForm.get('description') as FormControl).setValue('yooo');
            expect(component.canModifyDictionary()).toBeTrue();
        });
    });
    describe('modifyDictionary tests', () => {
        it('should call updateDictionary with value of the initial dictionary from the httpService', async () => {
            const spy = spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(true);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            await component.modifyDictionary();
            expect(spy).toHaveBeenCalledWith(fakeDictionary.title, fakeDictionary);
        });
        it('should not modify the error message when the dictionary has been modified successfully', async () => {
            spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(true);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            component.errorMessage = '';
            await component.modifyDictionary();
            expect(component.errorMessage).toEqual('');
        });
        it('should call updateDictionary when the dictionary is valid', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(true);
            const spy = spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            await component.modifyDictionary();
            expect(spy).toHaveBeenCalled();
        });
        it('the error should be the one generated by the validator when the dictionary does not have a valid format', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(false);
            spyOn(dictionaryValidator, 'isDescriptionValid').and.returnValue(false);
            dictionaryValidator.errorMessage = 'error';
            spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            await component.modifyDictionary();
            expect(component.errorMessage).toEqual('error');
        });
        it('the error should NOT be the one generated by the httpService when the dictionary is a duplicate and format is valid', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(true);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            spyOn(httpService, 'getErrorMessage').and.returnValue(FORBIDDEN_MESSAGE);
            httpService['errorMessage'] = 'error';
            spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            await component.modifyDictionary();
            expect(component.errorMessage).not.toEqual('error');
        });
        it('the error should be the one generated by the httpService when the dictionary is a duplicate and format is valid', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(true);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            httpService['errorMessage'] = 'error';
            spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            await component.modifyDictionary();
            expect(component.errorMessage).toEqual('error');
        });
        it('should not call handleSuccessfulModification when the dictionary is a dupliacte', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(true);
            spyOn(dictionaryValidator, 'isDescriptionValid').and.returnValue(true);
            spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            const spy = spyOn(component, 'handleSuccessfulmodification' as any);
            await component.modifyDictionary();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should NOT call http.updateDictionary when the dictionary is invalid', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(false);
            const spy = spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            await component.modifyDictionary();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should close the dialog with the value of the updatedDictionary when the upload was successful', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(true);
            spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            spyOn(httpService, 'anErrorOccurred').and.returnValue(false);
            const spy = spyOn(dialogReference, 'close');
            await component.modifyDictionary();
            expect(spy).toHaveBeenCalledWith(fakeDictionary);
        });
        it('should NOT close the dialog when the uploaded dictionary was NOT in a valid format', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(false);
            const spy = spyOn(dialogReference, 'close');
            await component.modifyDictionary();
            expect(spy).not.toHaveBeenCalled();
        });
        it('should NOT close the dialog when an error from the server occurred', async () => {
            spyOn(component, 'isUpdateDictionaryFormatValid' as any).and.returnValue(true);
            spyOn(httpService, 'anErrorOccurred').and.returnValue(true);
            spyOn(httpService, 'updateDictionary').and.returnValue(of(fakeDictionary));
            const spy = spyOn(dialogReference, 'close');
            await component.modifyDictionary();
            expect(spy).not.toHaveBeenCalled();
        });
    });
});
