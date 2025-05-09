// src/app/features/task/components/task-managment/task-managment.component.ts

import { Component } from '@angular/core';
import { Task, TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { AddTaskComponent } from '../add-task/add-task.component';

@Component({
  selector: 'app-task-managment',
  templateUrl: './task-managment.component.html',
  standalone: true,
  imports: [CommonModule, AddTaskComponent],
})
export class TaskManagmentComponent {
  tasks: Task[] = [];
  selectedTask: Task | null = null;
  isFormVisible = false;

  constructor(private taskService: TaskService) {
    this.tasks = this.taskService.getAll();
  }

  openAddForm() {
    this.selectedTask = null;
    this.isFormVisible = true;
  }

  openEditForm(task: Task) {
    this.selectedTask = task;
    this.isFormVisible = true;
  }

  saveTask(task: Task) {
    if (task.id) {
      this.taskService.update(task);
    } else {
      this.taskService.add(task);
    }
    this.tasks = this.taskService.getAll();
    this.isFormVisible = false;
  }

  closeForm() {
    this.isFormVisible = false;
  }
}
