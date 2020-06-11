export class saleStatusOptions {
  requested: 'Solicitado';
  attended: 'Atendido';
  confirmed: 'Confirmado';        //can be confirmed only when voucher is valid
  cancelled: 'Anulado'
}

export interface Sale {
  id: string;
  requestedProducts: SaleRequestedProducts[];
  status: saleStatusOptions[keyof saleStatusOptions]
}

export interface SaleRequestedProducts {
  id: string;       //product id
  quantity: number;
                    //price should be given by product price???
                    //va a haber ofertas?
}