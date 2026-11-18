import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material module/material.module';

interface Document {
    id: number;
    name: string;
    type: string;
    size: string;
    uploadDate: Date;
}

@Component({
    selector: 'app-document-repository',
    standalone: true,
    imports: [CommonModule, FormsModule, MaterialModule],
    templateUrl: './document-repository.component.html',
    styleUrl: './document-repository.component.css'
})
export class DocumentRepositoryComponent implements OnInit {
    documents: Document[] = [];
    filteredAndSortedDocuments: Document[] = [];
    selectedFile: File | null = null;
    uploadProgress: number = 0;
    isUploading: boolean = false;
    searchQuery: string = '';
    filterType: string = '';
    sortBy: string = 'name';
    displayedColumns: string[] = ['name', 'type', 'size', 'uploadDate', 'actions'];

    ngOnInit(): void {
        this.loadDocuments();
    }

    loadDocuments(): void {
        this.documents = [
            { id: 1, name: 'My Vacation Photos.pdf', type: 'PDF', size: '2.5 MB', uploadDate: new Date('2024-01-15') },
            { id: 2, name: 'Grocery List.docx', type: 'DOCX', size: '1.8 MB', uploadDate: new Date('2024-02-20') },
            { id: 3, name: 'Recipe for Brownies.pdf', type: 'PDF', size: '800 KB', uploadDate: new Date('2024-03-10') },
            { id: 4, name: 'Ideas for Next Trip.docx', type: 'DOCX', size: '3.2 MB', uploadDate: new Date('2024-03-25') },
            { id: 5, name: 'Project Report Draft.pdf', type: 'PDF', size: '1.5 MB', uploadDate: new Date('2024-04-01') },
        ];
        this.applyFilter();
        this.applySort();
    }

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0];
    }

    uploadFile(): void {
        if (this.selectedFile) {
            this.isUploading = true;
            this.uploadProgress = 0;

            const interval = setInterval(() => {
                this.uploadProgress += 10;
                if (this.uploadProgress >= 100) {
                    clearInterval(interval);
                    this.isUploading = false;
                    alert(`File "${this.selectedFile!.name}" uploaded successfully!`);
                    this.loadDocuments();
                    this.selectedFile = null;
                }
            }, 200);
        } else {
            alert('Please select a file to upload.');
        }
    }

    downloadDocument(documentId: number): void {
        const document = this.documents.find(doc => doc.id === documentId);
        if (document) {
            alert(`Simulating download of "${document.name}"`);
        }
    }

    deleteDocument(documentId: number): void {
        this.documents = this.documents.filter(doc => doc.id !== documentId);
        this.applyFilter();
    }

    applyFilter(): void {
        this.filteredAndSortedDocuments = this.documents.filter(doc => {
            const searchMatch = doc.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            const typeMatch = !this.filterType || doc.type === this.filterType;
            return searchMatch && typeMatch;
        });
        this.applySortInternal();
    }

    applySort(): void {
        this.applySortInternal();
    }

    applySortInternal(): void {
        this.filteredAndSortedDocuments.sort((a, b) => {
            if (this.sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (this.sortBy === 'uploadDate') {
                return b.uploadDate.getTime() - a.uploadDate.getTime(); // Sort by latest first
            } else if (this.sortBy === 'size') {
                // Basic size comparison - you might want to parse the size string for more accurate sorting
                const sizeA = parseFloat(a.size);
                const sizeB = parseFloat(b.size);
                const unitA = a.size.includes('MB') ? 1 : 0.001; // MB vs KB
                const unitB = b.size.includes('MB') ? 1 : 0.001;
                return (sizeB * unitB) - (sizeA * unitA);
            }
            return 0;
        });
    }
}