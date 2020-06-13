import { User } from './user.model';

export interface Product {
  id: string;
  description: string;
  additionalDescription: string;
  sku: string;
  category: string;   
  price: number;      //Should this price be with IGV?
  unit: "KG" | "1/2 KG";       //KG or 1/2 KG
  realStock: number;  //Real stock will be amounted here after accepting a product in the log sect
                      //To check the virtual we will use another collection
  mermaStock: number;
  sellMinimum: number;    //The minimum by which, we should top selling to the public
  alertMinimum: number;   //Minimum by which one should get an alert to request more 
  photoURL: string;
  photoPath: string;
  promo: boolean;           //Indicates wheter there is a promo
  promoData?: PromoData;
  published?: boolean;
  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
}

interface PromoData {
  quantity: number;
  promoPrice: number;
}