export const productsCollRef = `db/distoProductos/products`

export interface Product {
  id: string;
  description: string;
  sku: string;
  category: string;   //Categorias???
  cost: number;
  price: number;      //Should this price be with IGV?
  unit: string;       //KG or 1/2 KG
  realStock: number; //Real stock will be amounted here after accepting a product in the log sect
                    //To check the virtual we will use another collection
  mermaStock: number;
  sellMinimum: number;    //The minimum by which, we should top selling to the public
  alertMinimum: number;   //Minimum by which one should get an alert to request more 
  photoURL: string;
  photoPath: string;
  promo: boolean;           //Indicates wheter there is a promo
  promoData?: PromoData;
  published?: boolean;
}

interface PromoData {
  quantity: number;
  promoPrice: number;
}