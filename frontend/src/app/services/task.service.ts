import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Interface définissant la structure d'une tâche
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // URL de base de l'API
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient) { }

  /**
   * Gestionnaire d'erreurs centralisé
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 0) {
      // Erreur de connexion au serveur
      errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier que le serveur est démarré.';
      console.error('Erreur de connexion:', error);
    } else if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
      console.error('Erreur client:', error.error);
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = error.error.error || 'Données invalides';
          break;
        case 404:
          errorMessage = error.error.error || 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = error.error.error || 'Erreur serveur';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
      console.error('Erreur serveur:', error);
    }
    
    // Afficher l'alerte à l'utilisateur
    alert(errorMessage);
    
    // Retourner l'erreur pour le traitement par le composant
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Récupère toutes les tâches
   * @returns Observable contenant un tableau de tâches
   */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError.bind(this)) // Important: bind(this) pour préserver le contexte
      );
  }

  /**
   * Ajoute une nouvelle tâche
   * @param task La tâche à ajouter (sans l'id qui sera généré par le serveur)
   * @returns Observable contenant la tâche créée
   */
  addTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Met à jour une tâche
   * @param id L'identifiant de la tâche à mettre à jour
   * @param updates Les champs à mettre à jour (title et/ou completed)
   * @returns Observable contenant la tâche mise à jour
   */
  updateTask(id: number, updates: Partial<Omit<Task, 'id'>>): Observable<Task> {
    // S'assurer que les données sont correctement formatées
    const updateData = {
      title: updates.title,
      completed: updates.completed
    };
    
    console.log('Envoi de la mise à jour:', { id, updateData });
    
    return this.http.put<Task>(`${this.apiUrl}/${id}`, updateData)
      .pipe(
        tap(response => {
          console.log('Réponse du serveur:', response);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Supprime une tâche
   * @param id L'identifiant de la tâche à supprimer
   * @returns Observable vide
   */
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }
}
