/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
import { HttpHeaders, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_MESSAGE, FORBIDDEN_MESSAGE, GONE_RESSOURCE_MESSAGE, UNREACHABLE_SERVER_MESSAGE } from './constants/http-constants';
import { HttpService } from './http.service';
import { Dictionary } from './interfaces/dictionary';

describe('HttpService tests', () => {
    let httpMock: HttpTestingController;
    let service: HttpService;
    let baseUrl: string;
    let fakeDictionary: Dictionary;
    let updatedDictionary: Dictionary;
    let expectedDictionaries: Dictionary[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClientTestingModule],
        });
        service = TestBed.inject(HttpService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
        fakeDictionary = { title: 'english', description: 'simply the best' };
        updatedDictionary = { title: 'heyyyy', description: 'hey!' };
        expectedDictionaries = [fakeDictionary];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('handleErrorStatusCode tests', () => {
        it('should set the error message to  UNREACHABLE_SERVER_MESSAGE when receiving code 0', () => {
            service['handleErrorStatusCode'](0);
            expect(service['errorMessage']).toEqual(UNREACHABLE_SERVER_MESSAGE);
        });
        it('should set the error message to  GONE_RESSOURCE_MESSAGE when receiving code 410 (Gone)', () => {
            service['handleErrorStatusCode'](HttpStatusCode.Gone);
            expect(service['errorMessage']).toEqual(GONE_RESSOURCE_MESSAGE);
        });
        it('should set the error message to  FORBIDDEN_MESSAGE when receiving code 403 (Forbidden)', () => {
            service['handleErrorStatusCode'](HttpStatusCode.Forbidden);
            expect(service['errorMessage']).toEqual(FORBIDDEN_MESSAGE);
        });
        it('should set the error message to  DEFAULT_MESSAGE when receiving a random status code', () => {
            service['handleErrorStatusCode'](1);
            expect(service['errorMessage']).toEqual(DEFAULT_MESSAGE);
        });
    });
    describe('getAllDictionaries() tests', () => {
        it('should return an Observable<Dictionary[]>', () => {
            service.getAllDictionaries().subscribe((dictionaries) => {
                expect(dictionaries.length).toBe(dictionaries.length);
                expect(dictionaries).toEqual(expectedDictionaries);
            });
            const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
            expect(req.request.method).toBe('GET');
            req.flush(expectedDictionaries);
        });
        it('should handle http error safely', () => {
            service.getAllDictionaries().subscribe((response: Dictionary[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
            expect(req.request.method).toBe('GET');
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle httpClientError safely', () => {
            service.getAllDictionaries().subscribe((response: Dictionary[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.getAllDictionaries().subscribe((response: Dictionary[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });
    describe('getDictionary tests', () => {
        it('should return an Observable<Dictionary>', () => {
            service.getDictionary(fakeDictionary.title, false).subscribe((response) => {
                expect(response).toEqual(fakeDictionary);
            });
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${encodeURIComponent(fakeDictionary.title)}?includeWords=false`);
            expect(req.request.method).toBe('GET');
            req.flush(fakeDictionary);
        });
        it('should handle http error safely', () => {
            service.getDictionary(fakeDictionary.title, true).subscribe((response: Dictionary) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${encodeURIComponent(fakeDictionary.title)}?includeWords=true`);
            expect(req.request.method).toBe('GET');
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle httpClientError safely', () => {
            service.getDictionary(fakeDictionary.title, false).subscribe((response: Dictionary) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${encodeURIComponent(fakeDictionary.title)}?includeWords=false`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.getDictionary(fakeDictionary.title, false).subscribe((response: Dictionary) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${encodeURIComponent(fakeDictionary.title)}?includeWords=false`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('deleteAllDictionariesExceptDefault tests', () => {
        it('should clear the error message', () => {
            service['errorMessage'] = 'error';
            service.deleteAllDictionariesExceptDefault().subscribe();
            const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
            expect(service['errorMessage']).toEqual('');
            req.flush([] as Dictionary[]);
        });
        it('The ressource should not be cached', () => {
            service.deleteAllDictionariesExceptDefault().subscribe();
            const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush([] as Dictionary[]);
        });
        it('should handle httpClientError safely', () => {
            service.deleteAllDictionariesExceptDefault().subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.deleteAllDictionariesExceptDefault().subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });
    describe('deleteDictionary tests', () => {
        it('The ressource should not be cached', () => {
            service.deleteDictionary('french').subscribe();
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/french`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush({} as Dictionary);
        });
        it('should handle httpClientError safely', () => {
            service.deleteDictionary('french').subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/french`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.deleteDictionary('french').subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/french`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
        it('should encode the title of the dictionary to delete', () => {
            const title = 'la vie';
            service.deleteDictionary(title).subscribe();
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${encodeURIComponent(title)}`);
            req.flush(fakeDictionary);
        });
    });
    describe('getErrorMessage() tests', () => {
        it('should return the value of the attribute errorMessage', () => {
            // The attribute errorMessage is private and I need to set it to test the getter
            // eslint-disable-next-line dot-notation
            service['errorMessage'] = 'Some error';
            expect(service.getErrorMessage()).toEqual('Some error');
        });
    });
    describe('updateDictionary tests', () => {
        it('The ressource should not be cached', () => {
            service.updateDictionary(fakeDictionary.title, updatedDictionary).subscribe();
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${fakeDictionary.title}`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush(fakeDictionary);
        });
        it('should handle httpClientError safely', () => {
            service.updateDictionary(fakeDictionary.title, updatedDictionary).subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${fakeDictionary.title}`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.updateDictionary(fakeDictionary.title, updatedDictionary).subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${fakeDictionary.title}`);
            req.flush(updatedDictionary, { status: 500, statusText: 'Internal Server Error' });
        });
        it('should encode the title of the dictionary to update', () => {
            const title = 'la vie';
            service.updateDictionary(title, updatedDictionary).subscribe();
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${encodeURIComponent(title)}`);
            req.flush(fakeDictionary);
        });
    });
    describe('addDictionary tests', () => {
        it('The ressource should not be cached', () => {
            service.addDictionary(fakeDictionary).subscribe();
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${fakeDictionary.title}`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush(fakeDictionary);
        });
        it('should clear any errors', () => {
            service['errorMessage'] = 'wrong';
            service.addDictionary(fakeDictionary).subscribe(() => {
                expect(service['errorMessage']).toEqual('');
            });
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${encodeURIComponent(fakeDictionary.title)}`);
            req.flush(fakeDictionary);
        });
        it('should handle httpClientError safely', () => {
            service.addDictionary(fakeDictionary).subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${fakeDictionary.title}`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.addDictionary(fakeDictionary).subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/dictionaries/${fakeDictionary.title}`);
            req.flush(updatedDictionary, { status: 500, statusText: 'Internal Server Error' });
        });
    });
});
