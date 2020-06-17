import { User } from 'src/app/core/models/user.model';
import { Product } from './product.model';
export class saleStatusOptions {
  requested: 'Solicitado';
  attended: 'Atendido';
  confirmedRequest: 'Solicitud Confirmada';        //can be confirmed only when voucher is valid
  confirmedDocument: 'Número de Comprobante Confirmado';
  confirmedDelivery: 'Delivery Confirmado';
  driverAssigned: 'Conductor Asignado';
  finished: 'Entregado';
  cancelled: 'Anulado'
}

type FilterFlags<Base, Condition, Data> = 
    Base extends Condition ? Data : never
;

export interface Sale {
  id: string;
  correlative: string;
  payType?:string,
  document?:string,             //tipo de comprobante
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

  requestedProducts: {
    product: Product;       
    quantity: number;
  };

  deliveryPrice: number;

  voucher: {
    voucherPhoto:string,
    voucherPath:string
  }[]

  requestDate: Date,            //Fecha deseada por cliente
  
  voucherChecked: boolean,      //done by admin. needed to confirmedDelivery


  attendedData?: {             //Can go only when Atendido or more
    attendedBy: User,
    attendedAt: Date,
  }

  confirmedRequestData?: {        //only when confirmedRequest or more
    assignedDate: Date,           //Fecha asignada por admin
    observation: string

    confirmedBy: User,
    confirmedAt: Date,
  }

  confirmedDocumentData?: {    //This refers to when we give
    documentNumber: string,   //the n° comprobante
    
    confirmedBy: User,
    confirmedAt: Date,
  }

  confirmedDeliveryData?: {           //To confirme delivery data we need
    deliveryType: "Biker" | "Moto",   //to have the vouchers checked
    deliveryBusiness: any,

    confirmedBy: User,
    confirmedAt: Date
  }

  driverAssignedData?: {
    assignedAt: Date,
    assignedBy: User,
    observation: string,

    assignedDriver: any,
  }

  finishedData?: {
    finishedAt: Date,
    finishedBy: User,
    observation: string
  }

  cancelledData?: {
    cancelledAt: Date,
    cancelledBy: User,
  }

  createdAt: Date,
  createdBy: User,

  editedAt?: Date,
  editedBy?: User
}