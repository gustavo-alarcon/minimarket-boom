
export interface CashBox{
    uid?:string;
    cashier:string;
    user:string;
    password:string;
    state?:string
    lastClosing?:Date;
    lastOpening?:Date;
}