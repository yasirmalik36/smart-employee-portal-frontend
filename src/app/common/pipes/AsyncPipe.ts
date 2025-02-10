import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Pipe({
name: 'AsyncPipe'
})
export class AsyncPipe implements PipeTransform {

transform<T>(obs: Observable<T>): Observable<T | null> {
return obs.pipe(
catchError(() => of(null)) // Handle errors and return a null value instead
);
}

}