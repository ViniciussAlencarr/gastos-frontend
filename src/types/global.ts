export interface Gasto {
    _id?: string;
    value: number;
    description: string;
    status: string;
    category: string;
    userId?: string;
    date: Date;
}

export interface GastoAcumulado {
    _id: {
        ano: number;
        mes: number;
    };
    total: number;
}