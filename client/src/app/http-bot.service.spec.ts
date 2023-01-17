import { HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpService } from './http.service';
import { Bot } from './interfaces/bot';

describe('HttpService tests', () => {
    let httpMock: HttpTestingController;
    let service: HttpService;
    let baseUrl: string;
    let updatedBot: Bot;
    let fakeBot: Bot;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClientTestingModule],
        });
        service = TestBed.inject(HttpService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
        fakeBot = { name: 'BOTA', gameType: 'expert' };
        updatedBot = { name: 'BOTR', gameType: 'expert' };
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('deleteBot tests', () => {
        it('The ressource should not be cached', () => {
            service.deleteBot('BOTE').subscribe();
            const req = httpMock.expectOne(`${baseUrl}/bots/BOTE`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush({} as Bot);
        });
        it('should handle httpClientError safely', () => {
            service.deleteBot('BOT').subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/bots/BOT`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.deleteBot('BOTE').subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/bots/BOTE`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
        it('should encode the name of the bot to delete', () => {
            const name = 'BOTD';
            service.deleteBot(name).subscribe();
            const req = httpMock.expectOne(`${baseUrl}/bots/${encodeURIComponent(name)}`);
            req.flush(fakeBot);
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
    describe('deleteAllBots tests', () => {
        it('The ressource should not be cached', () => {
            service.deleteAllBots().subscribe();
            const req = httpMock.expectOne(`${baseUrl}/bots`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush([] as Bot[]);
        });
        it('should handle httpClientError safely', () => {
            service.deleteAllBots().subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/bots`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.deleteAllBots().subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/bots`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });
    describe('updateBot tests', () => {
        it('The ressource should not be cached', () => {
            service.updateBot(fakeBot.name, updatedBot).subscribe();
            const req = httpMock.expectOne(`${baseUrl}/bots/${fakeBot.name}`);
            const headers: HttpHeaders = req.request.headers;
            expect(headers.has('Cache-Control')).toBeTrue();
            expect(headers.get('Cache-Control')).toEqual('no-cache');
            expect(headers.get('Expires')).toEqual('0');
            req.flush(fakeBot);
        });
        it('should handle httpClientError safely', () => {
            service.updateBot(fakeBot.name, updatedBot).subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/bots/${fakeBot.name}`);
            req.error(new ErrorEvent('Random error occurred'));
        });
        it('should handle http server error safely', () => {
            service.updateBot(fakeBot.name, updatedBot).subscribe((response) => {
                expect(response).toBeUndefined();
            }, fail);
            const req = httpMock.expectOne(`${baseUrl}/bots/${fakeBot.name}`);
            req.flush(updatedBot, { status: 500, statusText: 'Internal Server Error' });
        });
        it('should encode the name of the bot to update', () => {
            const name = 'BOTD';
            service.updateBot(name, updatedBot).subscribe();
            const req = httpMock.expectOne(`${baseUrl}/bots/${encodeURIComponent(name)}`);
            req.flush(fakeBot);
        });
    });
});
