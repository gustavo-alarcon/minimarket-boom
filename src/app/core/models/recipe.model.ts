import { Product } from './product.model';
import { User } from './user.model';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  inputsId: string[];
  inputs: {
    product: Product;
    quantity: number;
  }[];
  // inputs: string[];
  videoURL: string;
  createdBy: User;
  createdAt: Date;
  editedBy: User;
  editedAt: Date;
}