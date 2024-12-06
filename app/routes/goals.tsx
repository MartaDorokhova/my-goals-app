import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useState } from "react";
import type { Goal, GoalStatus } from "../models/types";
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
    const goalId = parseInt(formData.get("goalId")?.toString() || "0", 10);
    const status = formData.get("status")?.toString() as GoalStatus;
    const title = formData.get("title")?.toString() || "";

    await goalService.updateGoal(goalId, {
      title,
      status,
    });
    
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
              <Form method="post" className="goal-edit-form">
                <input
                  type="text"
                  name="title"
                  defaultValue={goal.title}
                  className="goal-input"
                />
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="completed"
                      defaultChecked={goal.status === 'completed'}
                      className="radio-input"
                    />
                    Выполнено
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="inProgress"
                      defaultChecked={goal.status === 'inProgress'}
                      className="radio-input"
                    />
                    В процессе
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="canceled"
                      defaultChecked={goal.status === 'canceled'}
                      className="radio-input"
                    />
                    Отменено
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="notStarted"
                      defaultChecked={goal.status === 'notStarted'}
                      className="radio-input"
                    />
                    Не начато
                  </label>
                </div>
                <div className="goal-actions">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <button
                    type="submit"
                    name="_action"
                    value="save"
                    className="btn btn-success"
                  >
                    Сохранить
                  </button>
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
              </Form>
            ) : (
              <div className="goal-content">
                <span className="goal-title">{goal.title}</span>
                <div className="goal-status">
                  {goal.status === 'completed' && (
                    <span className="status-tag status-completed">
                      Выполнено
                    </span>
                  )}
                  {goal.status === 'inProgress' && (
                    <span className="status-tag status-in-progress">
                      В процессе
                    </span>
                  )}
                  {goal.status === 'canceled' && (
                    <span className="status-tag status-canceled">
                      Отменено
                    </span>
                  )}
                  {goal.status === 'notStarted' && (
                    <span className="status-tag status-not-started">
                      Не начато
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
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
      <Link to="/" style={{ fontSize: "18px", textDecoration: "none", color: "#4caf50" }}>
        🏠 На главную
      </Link>
    </div>
  );
}
