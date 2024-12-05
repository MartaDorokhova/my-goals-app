import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useState } from "react";
import type { Goal } from "~/models/goal";
import * as goalService from "~/services/goals.server";

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

  switch (actionType) {
    case "save": {
      const goals = await goalService.getGoals();
      const updatedGoals = await Promise.all(
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
    case "add": {
      const title = formData.get("title")?.toString() || "Новая цель";
      await goalService.addGoal(title);
      return json({ success: true });
    }
    case "delete": {
      const id = parseInt(formData.get("id")?.toString() || "0", 10);
      await goalService.deleteGoal(id);
      return json({ success: true });
    }
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function Goals() {
  const { goals } = useLoaderData<LoaderData>();
  const [isEdit, setIsEdit] = useState(false);
  const navigation = useNavigation();
  const submit = useSubmit();
  
  const isLoading = navigation.state === "submitting";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Список целей</h2>
        <div className="flex gap-4">
          <Link
            to="/statistics"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            prefetch="intent"
          >
            Статистика
          </Link>
          <button
            onClick={() => setIsEdit(!isEdit)}
            className={`px-4 py-2 text-white rounded transition ${
              isEdit ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={isLoading}
          >
            {isEdit ? "Отменить" : "Редактировать"}
          </button>
        </div>
      </div>

      <Form method="post" className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-4 bg-white rounded-lg shadow-sm flex items-center gap-4"
          >
            {isEdit ? (
              <>
                <input
                  type="text"
                  name={`goal-${goal.id}`}
                  defaultValue={goal.title}
                  className="flex-1 p-2 border rounded"
                />
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={`completed-${goal.id}`}
                      defaultChecked={goal.completed}
                    />
                    Выполнено
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={`inProgress-${goal.id}`}
                      defaultChecked={goal.inProgress}
                    />
                    В процессе
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={`canceled-${goal.id}`}
                      defaultChecked={goal.canceled}
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
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Удалить
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="flex-1">{goal.title}</span>
                <div className="flex gap-2">
                  {goal.completed && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Выполнено
                    </span>
                  )}
                  {goal.inProgress && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      В процессе
                    </span>
                  )}
                  {goal.canceled && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      Отменено
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {isEdit && (
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              name="_action"
              value="save"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              disabled={isLoading}
            >
              {isLoading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        )}
      </Form>

      <Form method="post" className="mt-6">
        <button
          type="submit"
          name="_action"
          value="add"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={isLoading}
        >
          Добавить цель
        </button>
      </Form>
    </div>
  );
}
