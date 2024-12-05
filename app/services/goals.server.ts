import { promises as fs } from "fs";
import path from "path";
import {Goal} from '../models/types.js'

const dbPath = path.resolve("data/db.json");

export async function getGoals(): Promise<Goal[]> {
  const data = await fs.readFile(dbPath, "utf-8");
  const parsedData = JSON.parse(data);
  return parsedData.goals;
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify({ goals }, null, 2), "utf-8");
}

export async function addGoal(title: string): Promise<Goal> {
  const goals = await getGoals();
  const newGoal: Goal = {
    id: goals.length ? goals[goals.length - 1].id + 1 : 1,
    title,
    completed: false,
    inProgress: false,
    canceled: false,
  };
  goals.push(newGoal);
  await saveGoals(goals);
  return newGoal;
}

export async function deleteGoal(id: number): Promise<void> {
  const goals = await getGoals();
  const updatedGoals = goals.filter((goal) => goal.id !== id);
  await saveGoals(updatedGoals);
}

export async function updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
  const goals = await getGoals();
  const goalIndex = goals.findIndex((goal) => goal.id === id);
  if (goalIndex === -1) {
    throw new Error(`Goal with id ${id} not found`);
  }
  
  goals[goalIndex] = { ...goals[goalIndex], ...updates };
  await saveGoals(goals);
  return goals[goalIndex];
}
