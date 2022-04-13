import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {IOrganizationCell} from './model/organization-cell';
import {Color} from './model/color';
import StyleConstants from './constants/style-constants';
import styleConstants from './constants/style-constants';
import {MouseButton} from './constants/mouse-button';
import {OrganizationStructureProvider} from './organization-structure-provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  organizationCells: (IOrganizationCell | null)[][] = [];

  initiallySelectedCellForLinkCreation: IOrganizationCell | null = null;
  private initiallySelectedCellRowIndexForLinkCreation: number = 0;
  private initiallySelectedCellColIndexForLinkCreation: number = 0;

  parentCandidateCell: IOrganizationCell | null = null;
  childCandidateCell: IOrganizationCell | null = null;
  @ViewChild('linkCreationLine') linkCreationLine!: ElementRef;

  private draggedCell: IOrganizationCell | null = null;

  private mouseStartPositionX: number = 0;


  ngOnInit() {
    this.organizationCells = OrganizationStructureProvider.getInitialOrganizationCells();
  }

  /**
   * Returns style object for linking line element that connects parent and all its children.
   *
   * Style object contains values for left and width properties.
   *
   * It is assumed that given cell contains children, and that children are exactly in the next row.
   *
   * @param cell parent cell for which linking line is shown
   * @param rowIndex row index of parent cell
   * @param colIndex column index of parent cell
   */
  getLinkingLineStyleAttributesForAllChildren(cell: IOrganizationCell, rowIndex: number, colIndex: number) {
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
    return AppComponent.getLinkingLineStyleAttributes(colIndex, firstChildColIndex, lastChildColIndex);
  }

  private static getLinkingLineStyleAttributes(parentColIndex: number, firstChildColIndex: number, lastChildColIndex: number = firstChildColIndex) {
    const cellWidth = StyleConstants.cellWidth;
    const gapBetweenCells = StyleConstants.gapBetweenCells;
    const linkingLineWidth = StyleConstants.linkingLineWidth;

    const left = (cellWidth - linkingLineWidth) / 2 - (cellWidth + gapBetweenCells) * Math.max(0, parentColIndex - firstChildColIndex);
    const width = (cellWidth + gapBetweenCells) * (Math.max(lastChildColIndex, parentColIndex) - Math.min(firstChildColIndex, parentColIndex)) + linkingLineWidth;
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
    this.mouseStartPositionX = event.pageX;
    if (event.button === MouseButton.LEFT) {
      this.draggedCell = cell;
      const cellHtmlElement = AppComponent.getOrganizationCellElementFromEventTarget(event.target as HTMLElement);
      cellHtmlElement.style.zIndex = '1';
    } else if (event.button === MouseButton.RIGHT) {
      this.initiallySelectedCellForLinkCreation = cell;
      this.initiallySelectedCellRowIndexForLinkCreation = rowIndex;
      this.initiallySelectedCellColIndexForLinkCreation = colIndex;
    }
  }

  handleOrganizationCellPointerMove(cell: IOrganizationCell, rowIndex: number, colIndex: number, event: PointerEvent) {
    if (cell === this.draggedCell) {
      const cellHtmlElement = AppComponent.getOrganizationCellElementFromEventTarget(event.target as HTMLElement);
      cellHtmlElement.style.left = `${event.pageX - this.mouseStartPositionX}px`;
    } else {
      // Cells should be in adjacent rows to be linked
      if (this.initiallySelectedCellForLinkCreation && Math.abs(this.initiallySelectedCellRowIndexForLinkCreation - rowIndex) === 1) {
        let linkCreationLineStyleAttributes: { left: string; width: string };
        if (this.initiallySelectedCellRowIndexForLinkCreation < rowIndex) {
          this.parentCandidateCell = this.initiallySelectedCellForLinkCreation;
          this.childCandidateCell = cell;
          linkCreationLineStyleAttributes = AppComponent.getLinkingLineStyleAttributes(this.initiallySelectedCellColIndexForLinkCreation, colIndex);
        } else {
          this.parentCandidateCell = cell;
          this.childCandidateCell = this.initiallySelectedCellForLinkCreation;
          linkCreationLineStyleAttributes = AppComponent.getLinkingLineStyleAttributes(colIndex, this.initiallySelectedCellColIndexForLinkCreation);
        }
        const linkCreationLineHtmlElement = this.linkCreationLine?.nativeElement as HTMLElement;
        if (linkCreationLineHtmlElement) {
          linkCreationLineHtmlElement.style.left = linkCreationLineStyleAttributes.left;
          linkCreationLineHtmlElement.style.width = linkCreationLineStyleAttributes.width;
        }
      } else {
        this.parentCandidateCell = null;
        this.childCandidateCell = null;
      }
    }
  }

  handleOrganizationCellPointerUp(cell: IOrganizationCell, rowIndex: number, colIndex: number, event: PointerEvent) {
    if (event.button === MouseButton.LEFT) {
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
    } else if (event.button === MouseButton.RIGHT) {
      if (this.parentCandidateCell && this.childCandidateCell) {
        OrganizationStructureProvider.addOrRemoveChild(this.parentCandidateCell as IOrganizationCell, this.childCandidateCell);
      }
      this.initiallySelectedCellForLinkCreation = null;
      this.parentCandidateCell = null;
      this.childCandidateCell = null;
    }
  }

  private static getOrganizationCellElementFromEventTarget(target: HTMLElement): HTMLElement {
    return target.classList.contains('organization-unit') ? target : target.parentElement as HTMLElement;
  }

  handleOrganizationCellRightClick(cell: IOrganizationCell, rowIndex: number, colIndex: number, event: MouseEvent) {
    event.preventDefault();
  }
}
