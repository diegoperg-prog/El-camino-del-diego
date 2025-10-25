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

  // 🖼️ Fondos por nivel
  const levelBackgrounds = {
    1: "/assets/backgrounds/bg1_forest.png",
    2: "/assets/backgrounds/bg2_village.png",
    3: "/assets/backgrounds/bg3_mountain.png",
    4: "/assets/backgrounds/bg4_cave.png",
    5: "/assets/backgrounds/bg5_castle.png",
    6: "/assets/backgrounds/bg6_legend.png",
  };

  // ⚡ Pre-carga de fondos para evitar parpadeos
  useEffect(() => {
    Object.values(levelBackgrounds).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 🧠 Cargar puntos guardados
  useEffect(() => {
    const savedDaily = localStorage.getItem("dailyPoints");
    const savedWeekly = localStorage.getItem("weeklyPoints");
    const savedLevel = localStorage.getItem("level");

    if (savedDaily) setDailyPoints(parseInt(savedDaily));
    if (savedWeekly) setWeeklyPoints(parseInt(savedWeekly));
    if (savedLevel) setLevel(parseInt(savedLevel));
  }, []);

  // 💾 Guardar automáticamente y calcular nivel/XP
  useEffect(() => {
    localStorage.setItem("dailyPoints", dailyPoints);
    localStorage.setItem("weeklyPoints", weeklyPoints);
    localStorage.setItem("level", level);

    const maxPoints = 100;
    const percentage = Math.min((dailyPoints / maxPoints) * 100, 100);
    setExpPercent(percentage);

    if (percentage === 100) {
      setLevel((l) => (l < 6 ? l + 1 : 1)); // ciclo de 6 niveles
      setDailyPoints(0);
    }
  }, [dailyPoints, weeklyPoints]);

  // ➕ Sumar puntos
  const addPoints = (pts) => {
    setDailyPoints((p) => p + pts);
    setWeeklyPoints((p) => p + pts);
  };

  // 🏔️ Nombre del nivel actual
  const getLevelName = () => {
    switch (level) {
      case 1:
        return "El llamado a la aventura";
      case 2:
        return "Primeros pasos";
      case 3:
        return "El camino de las pruebas";
      case 4:
        return "Frente al abismo";
      case 5:
        return "Salto de fe";
      case 6:
        return "La gloria eterna";
      default:
        return "Nuevo ciclo";
    }
  };

  return (
    <div
      className="game-container"
      style={{
        backgroundImage: `url(${levelBackgrounds[level]})`,
      }}
    >
      {/* 🧾 Encabezado y barra de experiencia */}
      <div className="hud">
        <h1 className="title">
          Nivel {level}: {getLevelName()}
        </h1>

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

      {/* 🦸‍♂️ Personaje */}
      <div className="character-section">
        <img
          src="/assets/hero.gif"
          alt="Héroe de Diego"
          className="hero-sprite"
        />
      </div>

      {/* 🎯 Botones de actividades */}
      <div className="buttons-grid">
        {activities.map((a) => (
          <button
            key={a.label}
            onClick={() => addPoints(a.pts)}
            className="activity-btn"
          >
            {a.label}
            <div className="pts">+{a.pts}</div>
          </button>
        ))}
      </div>

      {/* ⚙️ Botones inferiores */}
      <div className="footer-buttons">
        <button className="circle-btn">⚙️</button>
        <button className="circle-btn">📈</button>
        <button className="circle-btn">📜</button>
      </div>
    </div>
  );
}
