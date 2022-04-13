import {IOrganizationCell} from './model/organization-cell';
import {Color} from './model/color';

export class OrganizationStructureProvider {
  public static getInitialOrganizationCells(): (IOrganizationCell | null)[][] {
    const headCell: IOrganizationCell = {
      name: 'Руководитель',
      color: Color.VIOLET,
      parents: [],
      children: [],
    };

    const buildingDptCell: IOrganizationCell = {
      name: 'Управление строительства',
      color: Color.LIGHT_BLUE,
      parents: [],
      children: [],
    };

    const financesDptCell: IOrganizationCell = {
      name: 'Финансовое управление',
      color: Color.LIGHT_BLUE,
      parents: [],
      children: [],
    };

    const mechanizationDptCell: IOrganizationCell = {
      name: 'Отдел механизации',
      color: Color.LIGHT_BLUE,
      parents: [],
      children: [],
    };

    const purchaseDptCell: IOrganizationCell = {
      name: 'Отдел снабжения',
      color: Color.LIGHT_BLUE,
      parents: [],
      children: [],
    };

    const financialPlanningDptCell: IOrganizationCell = {
      name: 'Отдел финансового планирования',
      color: Color.LIGHT_BLUE,
      parents: [],
      children: [],
    };

    const settlementDptCell: IOrganizationCell = {
      name: 'Расчетный отдел',
      color: Color.LIGHT_BLUE,
      parents: [],
      children: [],
    };

    this.addChild(headCell, buildingDptCell);
    this.addChild(headCell, financesDptCell);

    this.addChild(buildingDptCell, mechanizationDptCell);
    this.addChild(buildingDptCell, purchaseDptCell);

    this.addChild(financesDptCell, financialPlanningDptCell);
    this.addChild(financesDptCell, settlementDptCell);

    return [
      [headCell, null, null, null],
      [buildingDptCell, null, financesDptCell, null],
      [mechanizationDptCell, purchaseDptCell, financialPlanningDptCell, settlementDptCell],
    ];
  }

  public static addOrRemoveChild(parentCell: IOrganizationCell, childCell: IOrganizationCell) {
    if (parentCell.children.indexOf(childCell) !== -1) {
      OrganizationStructureProvider.removeChild(parentCell as IOrganizationCell, childCell);
    } else {
      OrganizationStructureProvider.addChild(parentCell as IOrganizationCell, childCell);
    }
  }

  private static addChild(parentCell: IOrganizationCell, childCell: IOrganizationCell): void {
    parentCell.children.push(childCell);
    childCell.parents.push(parentCell);
  }

  private static removeChild(parentCell: IOrganizationCell, childCell: IOrganizationCell): void {
    parentCell.children.splice(parentCell.children.indexOf(childCell), 1);
    childCell.parents.splice(childCell.parents.indexOf(parentCell), 1);
  }
}
