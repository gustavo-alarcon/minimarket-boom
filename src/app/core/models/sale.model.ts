import { User } from 'src/app/core/models/user.model';
import { Product } from './product.model';
export class saleStatusOptions {
  requested: 'Solicitado';
  attended: 'Atendido';
  confirmedRequest: 'Solicitud Confirmada';        //can be confirmed only when voucher is valid
  confirmedVoucher: 'Voucher Confirmado';
  confirmedDelivery: 'Delivery Confirmado';
  cancelled: 'Anulado'
}

export interface Sale {
  id: string;
  correlative: string;
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
  status: saleStatusOptions[keyof saleStatusOptions]
  requestedProducts: SaleRequestedProducts[];
  deliveryDate: Date,
  deliveryFinishedDate?: Date,
  createdAt: Date,
  user:string,
  total: number,
  deliveryPrice: number,
  voucherPhoto?:string[],
  voucherPath?:string[]
}

export interface SaleRequestedProducts {
  product: Product;       
  quantity: number;
}