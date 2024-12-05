import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      flexDirection: "column",
      backgroundColor: "#f0f4f8",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <h1 style={{
        fontSize: "32px",
        color: "#4caf50",
        marginBottom: "20px"
      }}>
        Добро пожаловать!
      </h1>
      <p style={{
        fontSize: "18px",
        color: "#555",
        marginBottom: "40px"
      }}>
        Выберите, куда хотите перейти:
      </p>
      <nav>
        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: 0
        }}>
          <li style={{
            marginBottom: "20px"
          }}>
            <Link to="/goals" style={{
              fontSize: "18px",
              color: "#4caf50",
              textDecoration: "none",
              padding: "10px 20px",
              backgroundColor: "#e8f5e9",
              borderRadius: "5px",
              transition: "background-color 0.3s ease",
            }}>
              📋 Список целей
            </Link>
          </li>
          <li>
            <Link to="/statistics" style={{
              fontSize: "18px",
              color: "#4caf50",
              textDecoration: "none",
              padding: "10px 20px",
              backgroundColor: "#e8f5e9",
              borderRadius: "5px",
              transition: "background-color 0.3s ease",
            }}>
              📊 Статистика
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
