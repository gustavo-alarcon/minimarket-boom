import { User } from './user.model';
export interface Transaction {
    uid:string,
    regDate: Date,
    description: string,
    import: number,
    responsable: string,
    paymentType: string,
    incomeType: string,
    lastEditBy:string,
    nTicket :string,
    approvedBy:User,
}