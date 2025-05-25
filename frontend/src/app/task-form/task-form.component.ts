import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  @Output() taskAdded = new EventEmitter<void>();
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.taskForm.enable();
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const newTask = {
        title: this.taskForm.get('title')?.value,
        completed: false
      };

      this.taskService.addTask(newTask).subscribe({
        next: () => {
          this.taskForm.reset();
          this.taskAdded.emit();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la tâche:', error);
        }
      });
    }
  }

  get title() {
    return this.taskForm.get('title');
  }
}
