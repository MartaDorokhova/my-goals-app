import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useNavigation,
  useActionData,
  useSubmit,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import type { Goal } from "../models/types";
import * as goalService from "../services/goals.server";

type LoaderData = {
  goals: Goal[];
};

type ActionData = {
  success?: boolean;
  error?: string;
};

export const loader: LoaderFunction = async () => {
  const goals = await goalService.getGoals();
  return json<LoaderData>(
    { goals },
    {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    },
  );
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json();
  const actionType = data._action;

  try {
    if (actionType === "save") {
      const { goalId, status, title } = data;

      if (!goalId || !status || !title) {
        return json<ActionData>(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      await goalService.updateGoal(goalId, {
        title,
        status,
      });

      return json<ActionData>({ success: true });
    }

    if (actionType === "add") {
      const { title = "Новая цель" } = data;
      await goalService.addGoal(title);
      return json<ActionData>({ success: true });
    }

    if (actionType === "delete") {
      const { id } = data;
      if (!id) {
        return json<ActionData>({ error: "Missing id" }, { status: 400 });
      }
      await goalService.deleteGoal(id);
      return json<ActionData>({ success: true });
    }

    return json<ActionData>({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Action error:", error);
    return json<ActionData>({ error: "An error occurred" }, { status: 500 });
  }
};

export default function Goals() {
  const { goals } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [isEdit, setIsEdit] = useState(false);

  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success && navigation.state === "idle") {
      setIsEdit(false);
    }
  }, [actionData, navigation.state]);

  const handleEditClick = () => {
    setIsEdit(!isEdit);
  };

  const handleSubmit = (actionType: string, data: any) => {
    submit(
      { ...data, _action: actionType },
      { method: "post", encType: "application/json" },
    );
  };

  return (
    <div className="goals-container">
      {actionData?.error && (
        <div className="error-message" role="alert">
          {actionData.error}
        </div>
      )}
      <div className="goals-header">
        <h2 className="goals-title">Список целей</h2>
        <div className="header-buttons">
          <Link to="/statistics" className="btn btn-primary" prefetch="intent">
            Статистика
          </Link>
          <button
            type="button"
            onClick={handleEditClick}
            className={`btn ${isEdit ? "btn-danger" : "btn-success"}`}
            disabled={isLoading}
          >
            {isEdit ? "Отменить" : "Редактировать"}
          </button>
        </div>
      </div>

      <div className="goals-list">
        {goals.map((goal) => (
          <div key={goal.id} className="goal-item">
            {isEdit ? (
              <div className="goal-edit-form">
                <input
                  type="text"
                  defaultValue={goal.title}
                  className="goal-input"
                  onChange={(e) => {
                    const formData = {
                      goalId: goal.id,
                      title: e.target.value,
                      status: goal.status,
                    };
                    handleSubmit("save", formData);
                  }}
                  required
                />
                <div className="radio-group">
                  {(
                    [
                      "completed",
                      "inProgress",
                      "canceled",
                      "notStarted",
                    ] as const
                  ).map((status) => (
                    <label key={status} className="radio-label">
                      <input
                        type="radio"
                        name={`status-${goal.id}`}
                        value={status}
                        checked={goal.status === status}
                        className="radio-input"
                        onChange={() => {
                          const formData = {
                            goalId: goal.id,
                            title: goal.title,
                            status,
                          };
                          handleSubmit("save", formData);
                        }}
                        required
                      />
                      {status === "completed" && "Выполнено"}
                      {status === "inProgress" && "В процессе"}
                      {status === "canceled" && "Отменено"}
                      {status === "notStarted" && "Не начато"}
                    </label>
                  ))}
                </div>
                <div className="goal-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={isLoading}
                    onClick={() => {
                      if (confirm("Вы уверены, что хотите удалить эту цель?")) {
                        handleSubmit("delete", { id: goal.id });
                      }
                    }}
                  >
                    {isLoading ? "Удаление..." : "Удалить"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="goal-content">
                <span className="goal-title">{goal.title}</span>
                <div className="goal-status">
                  {goal.status === "completed" && (
                    <span className="status-tag status-completed">
                      Выполнено
                    </span>
                  )}
                  {goal.status === "inProgress" && (
                    <span className="status-tag status-in-progress">
                      В процессе
                    </span>
                  )}
                  {goal.status === "canceled" && (
                    <span className="status-tag status-canceled">Отменено</span>
                  )}
                  {goal.status === "notStarted" && (
                    <span className="status-tag status-not-started">
                      Не начато
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isEdit && (
        <button
          type="button"
          className="add-goal-button"
          disabled={isLoading}
          onClick={() => handleSubmit("add", {})}
        >
          {isLoading ? "Добавление..." : "Добавить цель"}
        </button>
      )}

      <Link
        to="/"
        style={{ fontSize: "18px", textDecoration: "none", color: "#4caf50" }}
      >
        🏠 На главную
      </Link>
    </div>
  );
}
