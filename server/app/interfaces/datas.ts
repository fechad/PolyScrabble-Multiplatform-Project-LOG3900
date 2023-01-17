// eslint-disable-next-line @typescript-eslint/no-empty-interface -- An empty interface is necessary for polymorphism
export interface Data {}

export interface ExchangeData extends Data {
    word: string;
}
