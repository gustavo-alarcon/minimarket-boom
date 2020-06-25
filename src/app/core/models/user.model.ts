export interface User {
  uid: string;
  email: string;
  dni?: number;
  phone?: string;
  photoURL?: string;
  name?: string;
  lastName1?: string;
  lastName2?: string;
  completeName?: string;
  displayName?: string;
  token?: string;
  admin?: boolean;
  
  lastLogin?: Date;
  contact?: {
    address: string;
    district: {
      delivery: number;
      name: string;
    };
    coord: {
      lat: number;
      long: number;
    };
    reference: string;
    phone: number;
  },
  salesCount?: number
}