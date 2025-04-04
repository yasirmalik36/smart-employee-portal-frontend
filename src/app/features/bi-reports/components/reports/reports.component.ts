import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common'; // Import TitleCasePipe
import { MaterialModule } from '../../../../shared/material module/material.module';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { v4 as uuidv4 } from 'uuid';
import { Subject, takeUntil } from 'rxjs';

interface GeneratedReport {
    id: string;
    reportType: string;
    startDate: Date;
    endDate: Date;
    department: string;
    employee: string;
}

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, MaterialModule, FormsModule, TitleCasePipe], // Add TitleCasePipe to imports
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit, OnDestroy {
    reportType: string = 'attendance';
    startDate: Date = new Date();
    endDate: Date = new Date();
    department: string = 'all';
    employee: string = 'all';

    reportTypes: string[] = ['attendance', 'leave', 'performance', 'task', 'payroll'];
    departments: string[] = ['all', 'HR', 'Development', 'Marketing'];
    employees: string[] = ['all', 'Yasir Mehmood', 'John Doe', 'Jane Smith'];

    generatedReports: GeneratedReport[] = [];
    isGenerating: boolean = false;
    isLoading: boolean = false;
    errorMessage: string = '';

    private ngUnsubscribe = new Subject<void>();
  titleCasePipe: any;

    constructor(private snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.loadExistingReports();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    loadExistingReports(): void {
        this.isLoading = true;
        // Simulate an API call with a delay
        setTimeout(() => {
            this.isLoading = false;
            this.generatedReports = [
                { id: uuidv4(), reportType: 'attendance', startDate: new Date('2025-03-01'), endDate: new Date('2025-03-31'), department: 'HR', employee: 'all' },
                { id: uuidv4(), reportType: 'leave', startDate: new Date('2025-03-01'), endDate: new Date('2025-03-31'), department: 'Development', employee: 'John Doe' },
                { id: uuidv4(), reportType: 'performance', startDate: new Date('2025-02-01'), endDate: new Date('2025-02-28'), department: 'Marketing', employee: 'Jane Smith' },
            ];
        }, 1500);
    }

    generateReport(): void {
        this.isGenerating = true;
        this.errorMessage = '';

        // Simulate report generation with a delay
        setTimeout(() => {
            this.isGenerating = false;
            const newReport: GeneratedReport = {
                id: uuidv4(),
                reportType: this.reportType,
                startDate: new Date(this.startDate),
                endDate: new Date(this.endDate),
                department: this.department,
                employee: this.employee,
            };
            this.generatedReports = [newReport, ...this.generatedReports];
            this.snackBar.open(`Report "${this.titleCasePipe.transform(newReport.reportType)}" generated successfully!`, 'Dismiss', {
                duration: 3000,
            });
        }, 2000);
    }

    downloadGeneratedReport(reportId: string): void {
        const report = this.generatedReports.find(r => r.id === reportId);
        if (report) {
            this.snackBar.open(`Simulating download of "${this.titleCasePipe.transform(report.reportType)}" report.`, 'Dismiss', {
                duration: 3000,
            });
            // In a real application, trigger a file download API call here
            console.log('Downloading report:', report);
        }
    }

    deleteGeneratedReport(reportId: string): void {
        this.generatedReports = this.generatedReports.filter(report => report.id !== reportId);
        this.snackBar.open('Report deleted successfully!', 'Dismiss', {
            duration: 2000,
        });
        console.log('Deleting report with ID:', reportId);
        // In a real application, you might want to call a delete API endpoint
    }

    getReportIcon(type: string): string {
        switch (type) {
            case 'attendance':
                return 'event';
            case 'leave':
                return 'date_range';
            case 'performance':
                return 'assessment';
            case 'task':
                return 'assignment';
            case 'payroll':
                return 'attach_money';
            default:
                return 'description';
        }
    }
}