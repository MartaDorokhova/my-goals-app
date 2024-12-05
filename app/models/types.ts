export interface Goal {
  id: number;
  title: string;
  completed: boolean;
  inProgress: boolean;
  canceled: boolean;
}

export interface GoalFormData {
  title: string;
  completed: boolean;
  inProgress: boolean;
  canceled: boolean;
}
