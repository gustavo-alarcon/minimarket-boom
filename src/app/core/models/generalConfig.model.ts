import { Unit } from './unit.model';

export interface GeneralConfig{
  categories: string[];
  units: Unit[];
  salesRCounter: number;
  buysCounter: number;
}