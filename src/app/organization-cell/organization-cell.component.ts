import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Color} from '../model/color';

@Component({
  selector: 'app-organization-cell',
  templateUrl: './organization-cell.component.html',
  styleUrls: ['./organization-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationCellComponent {

  @Input() name: string = '';
  @Input() color: Color = Color.LIGHT_BLUE;

}
