import { Period } from '@app/interfaces/period';

const SECONDS_IN_MINUTE = 60;
const THOUSAND = 1000;
export class DateService {
    getCurrentDate(): string {
        return new Date().toISOString();
    }
    getGamePeriod(startDate: Date, endDate: Date): Period {
        const diff = Math.floor((endDate.getTime() - startDate.getTime()) / THOUSAND);
        const minutes = Math.floor(diff / SECONDS_IN_MINUTE);
        const seconds = diff % SECONDS_IN_MINUTE;
        const period: Period = { minute: minutes, second: seconds };
        return period;
    }
    convertToString(period: Period): string {
        return '' + period.minute + 'mn' + ' ' + period.second + 's';
    }
}
