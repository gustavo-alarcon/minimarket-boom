export interface User {
  uid: string;
  email: string;
  dni?:number;
  phone?: string;
  photoURL?: string;
  name?: string;
  lastName1?: string;
  lastName2?: string;
  displayName?: string;
  token?: string;
  lastLogin?: Date;
  contact?: {
    address: string;
    coord: {
      lat: number;
      long: number;
    };
    reference: string;
    phone: number;
  },
  salesCount?:number
}