export interface CashOpening {
    id?: string;
    openedBy: string;
    openedByUid: string;
    closedBy: string;
    closedByUid: string;
    openingDate: number;
    closureDate: number;
    openingBalance: number;
    closureBalance: number;
    importAdded: number;
    importWithdrawn: number;
    cashCount: number;
    reOpenedBy: string;
    reOpenedByUid: string;
    reOpenedDate: number;
    //currentCash: CurrentCash;
    totalImport?: number;
    totalTickets?: number;
    totalDepartures?: number;
}