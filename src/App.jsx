import React, { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [dailyPoints, setDailyPoints] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [expPercent, setExpPercent] = useState(0);

  const activities = [
    { label: "Entrené", pts: 10 },
    { label: "Caminé 30 min", pts: 5 },
    { label: "Comí saludable", pts: 5 },
    { label: "Dormí 7h+", pts: 5 },
    { label: "Sin pantallas", pts: 5 },
    { label: "Reflexioné", pts: 5 },
    { label: "Tarea laboral", pts: 10 },
    { label: "Aprendí algo", pts: 5 },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("dailyPoints");
    if (saved) setDailyPoints(parseInt(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("dailyPoints", dailyPoints);
    const maxPoints = 100;
    const percentage = Math.min((dailyPoints / maxPoints) * 100, 100);
    setExpPercent(percentage);
    if (percentage === 100) setLevel((l) => l + 1);
  }, [dailyPoints]);

  const addPoints = (pts) => {
    setDailyPoints((p) => p + pts);
    setWeeklyPoints((p) => p + pts);
  };

  const getLevelName = () => {
    switch (level) {
      case 1: return "El llamado a la aventura";
      case 2: return "Primeros pasos";
      case 3: return "El camino de las pruebas";
      case 4: return "Frente al abismo";
      case 5: return "Salto de fe";
      case 6: return "La gloria eterna";
      default: return "Nuevo ciclo";
    }
  };

  return (
    <div className="game-container">
      <div className="hud">
        <h1 className="title">Nivel {level}: {getLevelName()}</h1>

        <div className="scoreboard">
          <div className="points">
            <span className="score">{dailyPoints}</span>
            <span className="label">puntos hoy</span>
          </div>
          <div className="weekly">{weeklyPoints} puntos en la semana</div>
        </div>

        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${expPercent}%` }}></div>
        </div>
      </div>

      <div className="character-section">
        <img
          src="/assets/hero.gif"
          alt="Héroe de Diego"
          className="hero-sprite"
        />
      </div>

      <div className="buttons-grid">
        {activities.map((a) => (
          <button key={a.label} onClick={() => addPoints(a.pts)} className="activity-btn">
            {a.label}
            <div className="pts">+{a.pts}</div>
          </button>
        ))}
      </div>

      <div className="footer-buttons">
        <button className="circle-btn">⚙️</button>
        <button className="circle-btn">📈</button>
        <button className="circle-btn">📜</button>
      </div>
    </div>
  );
}
