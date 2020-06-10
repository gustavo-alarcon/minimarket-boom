
export const buysCollRef = `db/distoProductos/buys`

export interface Buys {
  id: string;
  correlative: number;      //Should start with F
  requestedProductsId: string[];    //We will contain only the id

  totalAmount: number;
  totalPrice: number;     //From where am I going to get this?
   
  validated: boolean;       //True only when all products are validated
  validatedDate: Date;

  requestedDate: Date;
  requestedBy: string;   
}

export const buysProductsCollRef = `db/distoProductos/buys/`+`buyId`+`/requetedProducts/`
//We should include this on small documents
export interface BuyRequestedProduct {               //How many products should there be
  id: string;             //Should be same as product id
  buyId: string;          //Indicates the id of the buy request
  quantity: number;
  desiredDate: Date;
  validated: boolean;     
  validationData: {       //null when it is not validated
    mermaStock:  number;  //realStock = quantity - mermaStock - returned
    returned: number;
    observations: string;
  }
  validatedBy: string;
  validatedDate: Date;
  unitPrice: number; 
}