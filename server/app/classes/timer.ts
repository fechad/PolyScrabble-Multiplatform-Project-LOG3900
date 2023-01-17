export class Timer {
    static async wait(time: number): Promise<boolean> {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(true);
                clearTimeout(timeout);
            }, time);
        });
    }
}
