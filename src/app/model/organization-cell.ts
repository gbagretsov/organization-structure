import {Color} from './color';

export interface IOrganizationCell {
  name: string;
  color: Color;
  parents: IOrganizationCell[]
  children: IOrganizationCell[];
}
