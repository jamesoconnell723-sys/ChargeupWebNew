import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterstatus',
  standalone: false
})
export class FilterstatusPipe implements PipeTransform {

   transform(items: any[], status: string): any[] {
    if (!items) return [];
    if (!status || status === 'All') return items; // show all if no filter
    return items.filter(item => item.status === status);
  }


}
