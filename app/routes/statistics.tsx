import { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { promises as fs } from "fs";
import path from "path";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

type Goal = {
  id: number;
  title: string;
  status: string;
};

type LoaderData = {
  goals: Goal[];
};

const dbPath = path.resolve("data/db.json");

export const loader: LoaderFunction = async () => {
  const data = await fs.readFile(dbPath, "utf-8");
  const parsedData = JSON.parse(data);

  return { goals: parsedData.goals };
};

export default function Statistics() {
  const { goals } = useLoaderData<LoaderData>();
  const total = goals.length;

  const completed = goals.filter((goal) => goal.status === "completed").length;
  const inProgress = goals.filter(
    (goal) => goal.status === "inProgress",
  ).length;
  const canceled = goals.filter((goal) => goal.status === "canceled").length;
  const notStarted = goals.filter(
    (goal) => goal.status === "notStarted",
  ).length;

  const chartData = {
    labels: ["Завершено", "В работе", "Отменено", "Не начато"],
    datasets: [
      {
        data: [completed, inProgress, canceled, notStarted],
        backgroundColor: ["#4caf50", "#ffeb3b", "#f44336", "#9e9e9e"],
        hoverBackgroundColor: ["#45a049", "#f7e267", "#e53935", "#757575"],
      },
    ],
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Статистика по целям
      </h2>

      <div style={{ width: "100%", height: "400px" }}>
        <Pie data={chartData} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>Общее количество целей:</strong> {total}
        </p>
        <p>
          <strong>Завершено:</strong> {completed}
        </p>
        <p>
          <strong>В работе:</strong> {inProgress}
        </p>
        <p>
          <strong>Отменено:</strong> {canceled}
        </p>
        <p>
          <strong>Не начато:</strong> {notStarted}
        </p>
      </div>

      <Link
        to="/"
        style={{ fontSize: "18px", textDecoration: "none", color: "#4caf50" }}
      >
        🏠 На главную
      </Link>
    </div>
  );
}
