export interface User {
  uid: string;
  email: string;
  dni?:number;
  phone?: string;
  photoURL?: string;
  realName?: string;
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