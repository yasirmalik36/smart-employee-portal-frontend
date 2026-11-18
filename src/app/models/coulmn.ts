export interface Column {
  columnDef: string;
  header: string;
   width: string; // Default width
  cell?: (row: any) => string;
  hide?: boolean;
  }
  