import {Component, OnInit} from '@angular/core';
import {IOrganizationCell} from './model/organization-cell';
import {Color} from './model/color';
import StyleConstants from './constants/style-constants';
import styleConstants from './constants/style-constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  organizationCells: (IOrganizationCell | null)[][] = [];

  private linkModeActive: boolean = false;
  private parentOrganizationCellToLink: IOrganizationCell | null = null;
  private colIndexToLink: number = 0;
  private rowIndexToLink: number = 0;

  private draggedCell: IOrganizationCell | null = null;
  private mouseStartPositionX: number = 0;


  ngOnInit() {
    this.organizationCells = AppComponent.getInitialOrganizationCells();
  }

  private static getInitialOrganizationCells(): (IOrganizationCell | null)[][] {
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

    this.addChild(headCell, buildingDptCell);
    this.addChild(headCell, financesDptCell);

    return [
      [headCell, null],
      [buildingDptCell, financesDptCell],
    ];
  }

  private static addChild(parentCell: IOrganizationCell, childCell: IOrganizationCell): void {
    parentCell.children.push(childCell);
    childCell.parents.push(parentCell);
  }

  private static removeChild(parentCell: IOrganizationCell, childCell: IOrganizationCell): void {
    parentCell.children.splice(parentCell.children.indexOf(childCell), 1);
    childCell.parents.splice(childCell.parents.indexOf(parentCell), 1);
  }

  /**
   * Returns style object for linking line element.
   *
   * Style object contains values for left and width properties.
   *
   * It is assumed that given cell contains children, and that children are exactly in the next row.
   *
   * @param cell parent cell for which linking line is shown
   * @param rowIndex row index of parent cell
   * @param colIndex column index of parent cell
   */
  getLinkingLineStyleAttributes(cell: IOrganizationCell, rowIndex: number, colIndex: number) {
    const possibleChildren = this.organizationCells[rowIndex + 1];

    let firstChildColIndex = possibleChildren.length;
    cell.children.forEach(child => {
      const childColIndex = possibleChildren.indexOf(child);
      if (childColIndex < firstChildColIndex) {
        firstChildColIndex = childColIndex;
      }
    });

    let lastChildColIndex = -1;
    cell.children.forEach(child => {
      const childColIndex = possibleChildren.indexOf(child);
      if (childColIndex > lastChildColIndex) {
        lastChildColIndex = childColIndex;
      }
    });

    const cellWidth = StyleConstants.cellWidth;
    const gapBetweenCells = StyleConstants.gapBetweenCells;
    const linkingLineWidth = StyleConstants.linkingLineWidth;

    const left = (cellWidth - linkingLineWidth) / 2 - (cellWidth + gapBetweenCells) * Math.max(0, colIndex - firstChildColIndex);
    const width = (cellWidth + gapBetweenCells) * (Math.max(lastChildColIndex, colIndex) - Math.min(firstChildColIndex, colIndex)) + linkingLineWidth;
    return {
      left: `${left}px`,
      width: `${width}px`,
    }
  }

  addLevel() {
    this.organizationCells.push(new Array(this.organizationCells[0].length));
  }

  addStructures() {
    this.organizationCells.forEach(level => level.push(null));
  }

  addOrganizationCell(rowIndex: number, colIndex: number) {
    const name = prompt('Введите название структуры') as string;
    this.organizationCells[rowIndex][colIndex] = {
      name,
      color: Color.LIGHT_BLUE,
      parents: [],
      children: [],
    };
  }

  handleOrganizationCellPointerDown(cell: IOrganizationCell, rowIndex: number, colIndex: number, event: MouseEvent) {
    this.draggedCell = cell;
    this.mouseStartPositionX = event.pageX;
    const cellHtmlElement = AppComponent.getOrganizationCellElementFromEventTarget(event.target as HTMLElement);
    cellHtmlElement.style.zIndex = '1';
  }

  handleOrganizationCellPointerMove(cell: IOrganizationCell, rowIndex: number, colIndex: number, event: PointerEvent) {
    if (cell === this.draggedCell) {
      const cellHtmlElement = AppComponent.getOrganizationCellElementFromEventTarget(event.target as HTMLElement);
      cellHtmlElement.style.left = `${event.pageX - this.mouseStartPositionX}px`;
    }
  }

  handleOrganizationCellPointerUp(cell: IOrganizationCell, rowIndex: number, colIndex: number, event: PointerEvent) {
    const mouseMovementDiff = event.pageX - this.mouseStartPositionX;
    const colIndexDiff = Math.round(mouseMovementDiff / (styleConstants.cellWidth + styleConstants.gapBetweenCells));
    const newColIndex = colIndex + colIndexDiff;
    if (newColIndex < this.organizationCells[rowIndex].length && newColIndex >= 0) {
      this.organizationCells[rowIndex][colIndex] = this.organizationCells[rowIndex][newColIndex];
      this.organizationCells[rowIndex][newColIndex] = cell;
    }

    this.draggedCell = null;
    const cellHtmlElement = AppComponent.getOrganizationCellElementFromEventTarget(event.target as HTMLElement);
    cellHtmlElement.style.left = '';
    cellHtmlElement.style.zIndex = '';
  }

  private static getOrganizationCellElementFromEventTarget(target: HTMLElement): HTMLElement {
    return target.classList.contains('organization-unit') ? target : target.parentElement as HTMLElement;
  }

  handleOrganizationCellRightClick(cell: IOrganizationCell, rowIndex: number, colIndex: number, event: MouseEvent) {
    event.preventDefault();
    if (this.linkModeActive) {
      if (this.parentOrganizationCellToLink?.children.indexOf(cell) !== -1) {
        AppComponent.removeChild(this.parentOrganizationCellToLink as IOrganizationCell, cell);
      } else if (rowIndex === this.rowIndexToLink + 1) {
        AppComponent.addChild(this.parentOrganizationCellToLink as IOrganizationCell, cell);
      }

      this.linkModeActive = false;
      this.parentOrganizationCellToLink = null;
    } else {
      this.linkModeActive = true;
      this.parentOrganizationCellToLink = cell;
      this.rowIndexToLink = rowIndex;
      this.colIndexToLink = colIndex;
    }
  }
}
