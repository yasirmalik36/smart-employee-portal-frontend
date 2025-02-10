

// src/app/common/export-functions/customfunctions.ts
export function hasError(form: any, controlName: string, errorName: string): boolean {
    return form.controls[controlName].hasError(errorName);
  }
  
  export function LocalStorageClear():void{
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId'); 
    localStorage.removeItem('activities');
    localStorage.clear();
  }
 