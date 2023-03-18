/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Observer {
    abstract handleObservableNotification(data?: any): void;
}
