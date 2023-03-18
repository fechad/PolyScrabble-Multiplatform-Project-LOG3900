import { Observer } from './observer';
/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Observable {
    abstract registerObserver(observer: Observer): void;

    abstract removeObserver(observer: Observer): void;

    abstract notifyObservers(data: any): void;
}
