import { DEFAULT_ACCOUNT } from '@app/constants/default-user-settings';

export class DefaultAccountGenerator {
    static generate() {
        const result = { ...DEFAULT_ACCOUNT };
        result.username += new Date().getTime();
        return result;
    }
}
