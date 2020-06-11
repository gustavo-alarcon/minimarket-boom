export interface User {
  uid: string;
  email: string;
  phone?: string;
  photoURL?: string;
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
    number: number;
  },
}