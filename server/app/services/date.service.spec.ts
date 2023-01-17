/* eslint-disable @typescript-eslint/no-magic-numbers */ // we need it for the tests
import { expect } from 'chai';
import { describe } from 'mocha';
import { DateService } from './date.service';
describe('DateService', () => {
    let dateService: DateService;

    beforeEach(async () => {
        dateService = new DateService();
    });
    it('should not return an empty date', () => {
        expect(dateService.getCurrentDate()).not.to.equal(undefined);
    });
    it('should return the difference between two dates', () => {
        const startDate = new Date();
        startDate.setFullYear(2022);
        startDate.setMonth(4);
        startDate.setDate(9);
        startDate.setHours(20);
        startDate.setMinutes(30);
        startDate.setSeconds(45);
        const endDate = new Date();
        endDate.setFullYear(2022);
        endDate.setMonth(4);
        endDate.setDate(9);
        endDate.setHours(21);
        endDate.setMinutes(5);
        endDate.setSeconds(20);
        const res = dateService.convertToString(dateService.getGamePeriod(startDate, endDate));
        expect(res).to.equal('34mn 35s');
    });
});
