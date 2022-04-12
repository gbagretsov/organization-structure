import {Component, OnInit} from '@angular/core';
import {IOrganizationCell} from './model/organization-cell';
import {Color} from './model/color';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  organizationCells: IOrganizationCell[][] = [];

  ngOnInit() {
    this.organizationCells = AppComponent.getInitialOrganizationCells();
  }

  private static getInitialOrganizationCells(): IOrganizationCell[][] {
    const headCell: IOrganizationCell = {
      name: 'Руководитель',
      color: Color.VIOLET,
      children: [],
    };
    const buildingDpt: IOrganizationCell = {
      name: 'Управление строительства',
      color: Color.LIGHT_BLUE,
      children: [],
    };
    const financesDpt: IOrganizationCell = {
      name: 'Финансовое управление',
      color: Color.LIGHT_BLUE,
      children: [],
    };
    headCell.children = [buildingDpt, financesDpt];
    return [
      [headCell],
      [buildingDpt, financesDpt],
    ];
  }
}
