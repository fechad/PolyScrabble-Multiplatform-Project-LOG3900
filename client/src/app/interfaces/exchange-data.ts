// eslint-disable-next-line @typescript-eslint/no-empty-interface -- We need an empty interface for polymorphism
export interface Data {}
export interface ExchangeData extends Data {
    word: string;
}
