import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateP'
})
export class DatePPipe implements PipeTransform {

  transform(time:number): string {
    let date = new Date(time)

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
    let number = ("00" + (date.getDate())).slice(-2)

    let completeDate =  number + '-' + months[date.getMonth()] +'-'+ date.getFullYear()
    return completeDate
  }

}
