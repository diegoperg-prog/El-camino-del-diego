import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

export default function App() {
  const [dailyPoints, setDailyPoints] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
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

  // 🖼️ Fondos por nivel (1..6)
  const levelBackgrounds = {
    1: "/assets/backgrounds/bg1_forest.png",
    2: "/assets/backgrounds/bg2_village.png",
    3: "/assets/backgrounds/bg3_mountain.png",
    4: "/assets/backgrounds/bg4_cave.png",
    5: "/assets/backgrounds/bg5_castle.png",
    6: "/assets/backgrounds/bg6_legend.png",
  };

  // ⚡ Pre-carga de fondos
  useEffect(() => {
    Object.values(levelBackgrounds).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 📆 Nivel por día del mes (6 tramos)
  const { level, day, daysInMonth } = useMemo(() => {
    const now = new Date();
    const d = now.getDate();
    const mDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const segment = Math.ceil(mDays / 6);        // tamaño del tramo
    const idx = Math.min(5, Math.floor((d - 1) / segment)); // 0..5
    return { level: idx + 1, day: d, daysInMonth: mDays };
  }, []);

  // 🎯 Objetivo diario por etapa (80%, 90%, 100%, 110%, 120%, 100% del base)
  const stagePercents = [0.8, 0.9, 1.0, 1.1, 1.2, 1.0];
  const baseDailyTarget = 50; // suma “ideal” de hábitos en un día
  const levelTarget = Math.max(
    10,
    Math.round(baseDailyTarget * stagePercents[level - 1])
  );

  // 🧠 Cargar/guardar puntos
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("diego_plus_daily") || "{}");
    const todayKey = new Date().toLocaleDateString();
    if (saved.todayKey === todayKey) {
      if (typeof saved.dailyPoints === "number") setDailyPoints(saved.dailyPoints);
      if (typeof saved.weeklyPoints === "number") setWeeklyPoints(saved.weeklyPoints);
    } else {
      // nuevo día → reset diario, mantengo semanal
      setDailyPoints(0);
      localStorage.setItem(
        "diego_plus_daily",
        JSON.stringify({ todayKey, dailyPoints: 0, weeklyPoints: saved.weeklyPoints || 0 })
      );
    }
  }, []);

  useEffect(() => {
    const todayKey = new Date().toLocaleDateString();
    const saved = JSON.parse(localStorage.getItem("diego_plus_daily") || "{}");
    const updated = { ...saved, todayKey, dailyPoints, weeklyPoints };
    localStorage.setItem("diego_plus_daily", JSON.stringify(updated));
  }, [dailyPoints, weeklyPoints]);

  // 🧪 XP segun objetivo de la etapa (NO cambia el nivel)
  useEffect(() => {
    const pct = Math.min(100, Math.round((dailyPoints / levelTarget) * 100));
    setExpPercent(pct);
  }, [dailyPoints, levelTarget]);

  // ➕ Sumar puntos
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
    <div
      className="game-container"
      style={{ backgroundImage: `url(${levelBackgrounds[level]})` }}
    >
      {/* HUD */}
      <div className="hud">
        <h1 className="title">
          Nivel {level}: {getLevelName()}
        </h1>
        <div className="subtle">{`Día ${day} / ${daysInMonth}`}</div>

        <div className="scoreboard">
          <div className="points">
            <span className="score">{dailyPoints}</span>
            <span className="label">puntos hoy</span>
          </div>
          <div className="weekly">{weeklyPoints} puntos en la semana</div>
        </div>

        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${expPercent}%` }} />
        </div>
        <div className="target-note">Objetivo de hoy: {levelTarget} pts</div>
      </div>

      {/* Personaje */}
      <div className="character-section">
        <img src="/assets/hero.gif" alt="Héroe de Diego" className="hero-sprite" />
      </div>

      {/* Actividades */}
      <div className="buttons-grid">
        {activities.map((a) => (
          <button key={a.label} onClick={() => addPoints(a.pts)} className="activity-btn">
            {a.label}
            <div className="pts">+{a.pts}</div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="footer-buttons">
        <button className="circle-btn" title="Ajustes">⚙️</button>
        <button className="circle-btn" title="Gráficos">📈</button>
        <button className="circle-btn" title="Historial">📜</button>
      </div>
    </div>
  );
}
