// src/app/features/task/services/task.service.ts

import { Injectable } from '@angular/core';
// src/app/features/task/models/task.model.ts

export interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [
    {
      id: 1,
      title: 'Design Dashboard',
      description: 'Create the layout for the dashboard',
      assignedTo: 'Ali',
      dueDate: '2025-05-10',
      status: 'In Progress',
    },
  ];

  getAll(): Task[] {
    return this.tasks;
  }

  add(task: Task): void {
    task.id = Date.now();
    this.tasks.push(task);
  }

  update(task: Task): void {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.tasks[index] = task;
    }
  }
}
