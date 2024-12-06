export type GoalStatus = 'completed' | 'inProgress' | 'canceled' | 'notStarted';

export interface Goal {
  id: number;
  title: string;
  status: GoalStatus;
}

export interface GoalFormData {
  title: string;
  status: GoalStatus;
}
