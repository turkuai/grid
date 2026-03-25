export type Rates = {
    [key: string]: number;
};

export type ApiResponse = {
    base: string;
    rates: Rates;
}
