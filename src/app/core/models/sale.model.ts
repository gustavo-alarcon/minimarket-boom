import { User } from 'src/app/core/models/user.model';
export class saleStatusOptions {
  requested: 'Solicitado';
  attended: 'Atendido';
  confirmed: 'Confirmado';        //can be confirmed only when voucher is valid
  cancelled: 'Anulado'
}

export interface Sale {
  id: string;
  correlative: string;
  requestedProducts: SaleRequestedProducts[];
  status: saleStatusOptions[keyof saleStatusOptions]
  payType?:string,
  document?:string,
  location: {
    address: string,
    district: any,
    coord: {
      lat: number,
      lng: number,
    },
    reference: string,
    phone:number
  },
  deliveryDate: Date,
  deliveryFinishedDate?: Date,
  createdAt: Date,
  user:string,
  total: number,
  deliveryPrice: number,
  voucherPhoto?:string,
  voucherPath?:string
}

export interface SaleRequestedProducts {
  id: string;       //product id
  quantity: number;
                    //price should be given by product price???
                    //va a haber ofertas?
}