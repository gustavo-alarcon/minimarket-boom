
export interface CashBox{
    uid:string;
    cashier:string;
    user?:string;
    password:string;
    lastClosing?:Date;
    lastOpening?:Date;
    open:boolean;
    currentOpening?:string;
    currentCash: null;

}