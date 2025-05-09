
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../../services/task.service';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  standalone: true,
  imports: [FormsModule],
})
export class AddTaskComponent {
  @Input() task: Task | null = null;
  @Output() saveTask = new EventEmitter<Task>();
  @Output() close = new EventEmitter<void>();

  newTask: Task = {
    id: 0,
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    status: '',
  };

  ngOnChanges() {
    this.newTask = this.task ? { ...this.task } : {
      id: 0,
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      status: '',
    };
  }

  save() {
    this.saveTask.emit(this.newTask);
  }
}
