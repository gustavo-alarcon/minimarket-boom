import { User } from './user.model';
import { Unit, PackageUnit } from './unit.model';
import { Product } from './product.model';

export interface Package {
  package: true;      //Variable that will always be true. Used to determine if it is a package
  id: string;
  description: string;
  additionalDescription: string;
  sku: string;
  price: number;      //Should this price be with IGV?
  unit: PackageUnit;       
  photoURL: string;
  photoPath: string;

  promo: boolean;           //Indicates wheter there is a promo
  promoData?: PromoData;
  published?: boolean;

  dateLimit: Date;      //In the case of "indefinido", will be null

  totalItems: number;
  items: PackageItems[] 

  createdAt: Date;
  createdBy: User;
  editedAt: Date;
  editedBy: User;
}

export interface PackageItems {
  productsOptions: Product[]
}

interface PromoData {
  quantity: number;
  promoPrice: number;
}