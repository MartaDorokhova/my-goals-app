import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useState } from "react";
import type { Goal } from "../models/types";
import * as goalService from "../services/goals.server";

type LoaderData = {
  goals: Goal[];
};

export const loader: LoaderFunction = async () => {
  const goals = await goalService.getGoals();
  return json<LoaderData>(
    { goals },
    {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "save") {
    const goals = await goalService.getGoals();
    await Promise.all(
      goals.map(async (goal) => {
        const updates = {
          title: formData.get(`goal-${goal.id}`)?.toString() || goal.title,
          completed: formData.get(`completed-${goal.id}`) === "on",
          inProgress: formData.get(`inProgress-${goal.id}`) === "on",
          canceled: formData.get(`canceled-${goal.id}`) === "on",
        };
        return goalService.updateGoal(goal.id, updates);
      })
    );
    return json({ success: true });
  }

  if (actionType === "add") {
    const title = formData.get("title")?.toString() || "Новая цель";
    await goalService.addGoal(title);
    return json({ success: true });
  }

  if (actionType === "delete") {
    const id = parseInt(formData.get("id")?.toString() || "0", 10);
    await goalService.deleteGoal(id);
    return json({ success: true });
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function Goals() {
  const { goals } = useLoaderData<LoaderData>();
  const [isEdit, setIsEdit] = useState(false);
  const navigation = useNavigation();
  const submit = useSubmit();
  
  const isLoading = navigation.state === "submitting";

  const handleEditClick = () => {
    console.log('Edit button clicked, current state:', isEdit);
    setIsEdit(!isEdit);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const submitter = (event as any).nativeEvent.submitter;
    
    if (submitter?.name === "_action" && submitter?.value === "save") {
      submit(form, { method: "post" });
      setIsEdit(false);
    } else {
      submit(form, { method: "post" });
    }
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2 className="goals-title">Список целей</h2>
        <div className="header-buttons">
          <Link
            to="/statistics"
            className="btn btn-primary"
            prefetch="intent"
          >
            Статистика
          </Link>
          <button
            type="button"
            onClick={handleEditClick}
            className={`btn ${isEdit ? 'btn-danger' : 'btn-success'}`}
          >
            {isEdit ? "Отменить" : "Редактировать"}
          </button>
        </div>
      </div>

      <Form method="post" className="goals-list" onSubmit={handleSubmit}>
        {goals.map((goal) => (
          <div key={goal.id} className="goal-item">
            {isEdit ? (
              <>
                <input
                  type="text"
                  name={`goal-${goal.id}`}
                  defaultValue={goal.title}
                  className="goal-input"
                />
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name={`completed-${goal.id}`}
                      defaultChecked={goal.completed}
                      className="checkbox-input"
                    />
                    Выполнено
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name={`inProgress-${goal.id}`}
                      defaultChecked={goal.inProgress}
                      className="checkbox-input"
                    />
                    В процессе
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name={`canceled-${goal.id}`}
                      defaultChecked={goal.canceled}
                      className="checkbox-input"
                    />
                    Отменено
                  </label>
                  <button
                    type="submit"
                    name="_action"
                    value="delete"
                    onClick={(e) => {
                      e.preventDefault();
                      const form = new FormData();
                      form.set("_action", "delete");
                      form.set("id", goal.id.toString());
                      submit(form, { method: "post" });
                    }}
                    className="btn btn-danger"
                  >
                    Удалить
                  </button>
                </div>
              </>
            ) : (
              <div className="goal-content">
                <span className="goal-title">{goal.title}</span>
                <div className="goal-status">
                  {goal.completed && (
                    <span className="status-tag status-completed">
                      Выполнено
                    </span>
                  )}
                  {goal.inProgress && (
                    <span className="status-tag status-in-progress">
                      В процессе
                    </span>
                  )}
                  {goal.canceled && (
                    <span className="status-tag status-canceled">
                      Отменено
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isEdit && (
          <div className="header-buttons">
            <button
              type="submit"
              name="_action"
              value="save"
              className="btn btn-success"
              disabled={isLoading}
            >
              {isLoading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        )}
      </Form>

      <Form method="post" onSubmit={handleSubmit}>
        <button
          type="submit"
          name="_action"
          value="add"
          className="add-goal-button"
          disabled={isLoading}
        >
          Добавить цель
        </button>
      </Form>
    </div>
  );
}
