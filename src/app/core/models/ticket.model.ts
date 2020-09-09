import { Product } from './product.model';

export interface Ticket {
    index: number;
    productList: Array<{
        product: Product;
        quantity: number;
    }>;
    total: number;
}