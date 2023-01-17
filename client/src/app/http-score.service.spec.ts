/* eslint-disable dot-notation */ // We want to spy private methods and use private attributes for some tests
import { HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Score } from '@app/classes/score';
import { HttpService } from './http.service';

describe('HttpService tests', () => {
    let httpMock: HttpTestingController;
    let service: HttpService;
    let baseUrl: string;
    const isoDate = '2022-03-16T14:26:51.458Z';
    const expectedScores: Score[] = [{ points: 60, gameType: 'classic', author: 'Aymen', dictionary: 'français', date: isoDate }];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClientTestingModule],
        });
        service = TestBed.inject(HttpService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('fetchAllScores() tests', () => {
        it('should return an Observable<Score[]>', () => {
            service.fetchAllScores().subscribe((scores) => {
                expect(scores.length).toBe(scores.length);
                expect(scores).toEqual(expectedScores);
            });
            const req = httpMock.expectOne(`${baseUrl}/scores`);
            expect(req.request.method).toBe('GET');
            req.flush(expectedScores);
        });
        it('should handle http error safely', () => {
            service.fetchAllScores().subscribe((response: Score[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores`);
            expect(req.request.method).toBe('GET');
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle httpClientError safely', () => {
            service.fetchAllScores().subscribe((response: Score[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.fetchAllScores().subscribe((response: Score[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('getNScoresByCategory(gameType, quantity) tests', () => {
        it('Request should be GET and the endpoint should include the quantity query and gameType param when the quantity is specified', () => {
            service.getNScoresByCategory('classic', 1).subscribe((scores) => {
                expect(scores.length).toBe(scores.length);
                expect(scores).toEqual(expectedScores);
            });
            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic?quantity=1`);
            expect(req.request.method).toBe('GET');
            req.flush(expectedScores);
        });
        it('The ressource should not be cached with a quantity param', () => {
            service.getNScoresByCategory('classic', 1).subscribe();
            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic?quantity=1`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush({} as Score);
        });
        it('calling getBestScoresByGameTypeshould with quantity handle http error safely', () => {
            service.getNScoresByCategory('classic', 1).subscribe((response: Score[]) => {
                expect(response).toBeUndefined();
            }, fail);

            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic?quantity=1`);
            expect(req.request.method).toBe('GET');
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle httpClientError safely', () => {
            service.getNScoresByCategory('classic', 1).subscribe((response: Score[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic?quantity=1`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.getNScoresByCategory('classic', 1).subscribe((response: Score[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic?quantity=1`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('getAllScoresByGameType(gameType) tests', () => {
        it('When a quantity is NOT specified endpoint should only include gameType param', () => {
            service.getAllScoresByCategory('classic').subscribe((scores) => {
                expect(scores.length).toBe(scores.length);
                expect(scores).toEqual(expectedScores);
            });
            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic`);
            expect(req.request.method).toBe('GET');
            req.flush(expectedScores);
        });
        it('The ressource should not be cached with a quantity param', () => {
            service.getAllScoresByCategory('classic').subscribe();
            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush({} as Score);
        });
        it('should handle httpClientError safely', () => {
            service.getAllScoresByCategory('classic').subscribe((response: Score[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.getAllScoresByCategory('classic').subscribe((response: Score[]) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores/game-type/classic`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });

    it('should handle http server error safely', () => {
        service.deleteAllDictionariesExceptDefault().subscribe((response) => {
            expect(response).toBeUndefined();
        }, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionaries`);
        req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });
    describe('getErrorMessage() tests', () => {
        it('should return the value of the attribute errorMessage', () => {
            // The attribute errorMessage is private and I need to set it to test the getter
            // eslint-disable-next-line dot-notation
            service['errorMessage'] = 'Some error';
            expect(service.getErrorMessage()).toEqual('Some error');
        });
    });

    describe('reinitializeScores tests', () => {
        it('should clear the error message', () => {
            service['errorMessage'] = 'error';
            service.reinitializeScores().subscribe();
            const req = httpMock.expectOne(`${baseUrl}/scores`);
            expect(service['errorMessage']).toEqual('');
            req.flush([] as Score[]);
        });
        it('The ressource should not be cached', () => {
            service.reinitializeScores().subscribe();
            const req = httpMock.expectOne(`${baseUrl}/scores`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush([] as Score[]);
        });
        it('should handle httpClientError safely', () => {
            service.reinitializeScores().subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.reinitializeScores().subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/scores`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });
});
