import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService, Task } from '../services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  editingTaskId: number | null = null;
  editForm: FormGroup;
  filterStatus: string = 'all';

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
      }
    });
  }

  applyFilter(): void {
    switch (this.filterStatus) {
      case 'completed':
        this.filteredTasks = this.tasks.filter(task => task.completed);
        break;
      case 'active':
        this.filteredTasks = this.tasks.filter(task => !task.completed);
        break;
      default:
        this.filteredTasks = this.tasks;
    }
  }

  startEditing(task: Task): void {
    this.editingTaskId = task.id;
    this.editForm.setValue({
      title: task.title
    });
  }

  saveEdit(task: Task): void {
    if (this.editForm.valid) {
      const newTitle = this.editForm.get('title')?.value.trim();
      this.taskService.updateTask(task.id, { 
        title: newTitle,
        completed: task.completed 
      }).subscribe({
        next: (updatedTask) => {
          this.tasks = this.tasks.map(t => t.id === task.id ? updatedTask : t);
          this.applyFilter();
          this.editingTaskId = null;
          this.editForm.reset();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.editForm.setValue({ title: task.title });
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editForm.reset();
  }

  toggleTaskStatus(task: Task): void {
    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe({
      next: (updatedTask) => {
        this.tasks = this.tasks.map(t => t.id === task.id ? updatedTask : t);
        this.applyFilter();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.applyFilter();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });
  }

  onTaskAdded(): void {
    this.loadTasks();
  }
}
