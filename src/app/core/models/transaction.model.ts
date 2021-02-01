import { User } from './user.model';
import { Ticket } from './ticket.model';
export interface Transaction {
    uid:string,
    createdAt: Date,
    description: string,
    import: number,
    responsable: string,
    paymentMethod: PaymentType,
    incomeType: string,
    lastEditBy:string,
    ticket :Ticket,
    approvedBy:User,
    movementType:string,
    type:string;
}

export interface PaymentType {
    account: string;
    name: string;
    photoPath: string;
    photoURL: string;
}
