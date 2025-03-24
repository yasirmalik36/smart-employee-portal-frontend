
export interface AttendanceRequest {
    [key: string]: any; // Allows dynamic key access
  dateRange: string;
  employeeId?: number;
  departmentId?: number;
  designationId?: number;
  status?: string;
  shiftId?: number;
  fromDate?: string |null;
  toDate?: string |null;
  pageNumber: number;
  pageSize: number;
}
export interface AttendanceResponse {
    resp: Response;
    attendanceData: AttendanceRecord[];
  }
  
  export interface Response {
    code: string;
    message: string;
    description: string;
    totalRecords: string;
  }
  
  export interface AttendanceRecord {
    Sr: number;
    AttendanceID: number;
    EmployeeID: number;
    Employee_Name: string;
    DepartmentName: string;
    DesignationName: string;
    AttendanceDate: string; // ISO date string
    CheckInTime: string; // ISO time string
    CheckOutTime: string; // ISO time string
    WorkHours: number;
    Status: string;
    ShiftName: string;
  }
  