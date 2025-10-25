import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, BarChart3, History } from "lucide-react";
import LevelUpEffect from "./components/LevelUpEffect";
import phrases from "./data/phrases";
import "./index.css";

export default function App() {
  // ─────────────────────────────────────────────────────────────
  // Puntos / estado UI
  const [dailyPoints, setDailyPoints] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [recentGain, setRecentGain] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const [motivation, setMotivation] = useState("");

  // ─────────────────────────────────────────────────────────────
  // Actividades
  const activities = [
    { label: "Entrené", pts: 10 },
    { label: "Caminé 30 min", pts: 5 },
    { label: "Comí saludable", pts: 5 },
    { label: "Dormí 7h+", pts: 5 },
    { label: "Sin pantallas", pts: 5 },
    { label: "Reflexioné", pts: 5 },
    { label: "Tarea laboral", pts: 10 },
    { label: "Aprendí algo", pts: 5 },
    // 9° casillero: si querés, podés duplicar "Entrené" o agregar “Mejoré proceso +10”
  ];

  // ─────────────────────────────────────────────────────────────
  // Viaje del héroe mensual (niveles cada ~5 días)
  const stagePercents = [0.8, 0.9, 1.0, 1.1, 1.2, 1.0]; // objetivos relativos
  const colorsByStage = ["#27D17C", "#18B7FF", "#FFD447", "#FF7A2F", "#FF4D88", "#A45DFF"];
  const levelBackgrounds = {
    1: "/assets/bg_forest.png",
    2: "/assets/bg_village.png",
    3: "/assets/bg_ruins.png",
    4: "/assets/bg_cave.png",
    5: "/assets/bg_peak.png",
    6: "/assets/bg_temple.png",
  };
  const levelNames = [
    "El llamado a la aventura",
    "Primeros pasos",
    "El camino de las pruebas",
    "Frente al abismo",
    "Salto de fe",
    "La gloria eterna",
  ];

  // Determinar etapa mensual en base al día del mes
  const { stageIndex, daysInMonth, day } = useMemo(() => {
    const now = new Date();
    const d = now.getDate();
    const mDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    // dividir el mes en 6 tramos lo más parejos posible
    const size = Math.ceil(mDays / 6);
    const idx = Math.min(5, Math.floor((d - 1) / size)); // 0..5
    return { stageIndex: idx, daysInMonth: mDays, day: d };
  }, []);

  const baseDailyTarget = 50; // suma máxima de puntos diarios si haces todo (10+5+5+5+5+5+10+5)
  const levelTarget = Math.max(10, Math.round(baseDailyTarget * stagePercents[stageIndex]));
  const levelColor = colorsByStage[stageIndex];
  const levelName = levelNames[stageIndex];
  const bgImage = levelBackgrounds[stageIndex + 1];

  // Calcular progreso de barra (0..100)
  const expPct = Math.min(100, Math.round((dailyPoints / levelTarget) * 100));

  // ─────────────────────────────────────────────────────────────
  // LocalStorage (persistencia)
  useEffect(() => {
    const todayKey = new Date().toLocaleDateString();
    const saved = JSON.parse(localStorage.getItem("diego_plus_v3") || "{}");
    if (saved.todayKey !== todayKey) {
      // nuevo día: reseteo solo diario
      setDailyPoints(0);
      const updated = { ...saved, todayKey };
      localStorage.setItem("diego_plus_v3", JSON.stringify(updated));
    } else {
      if (typeof saved.dailyPoints === "number") setDailyPoints(saved.dailyPoints);
      if (typeof saved.weeklyPoints === "number") setWeeklyPoints(saved.weeklyPoints);
    }
  }, []);

  useEffect(() => {
    const todayKey = new Date().toLocaleDateString();
    const saved = JSON.parse(localStorage.getItem("diego_plus_v3") || "{}");
    const updated = { ...saved, dailyPoints, weeklyPoints, todayKey };
    localStorage.setItem("diego_plus_v3", JSON.stringify(updated));
  }, [dailyPoints, weeklyPoints]);

  // Frase motivacional (al abrir y al subir de nivel)
  useEffect(() => {
    setMotivation(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Acciones
  const addPoints = (pts) => {
    const newDaily = dailyPoints + pts;
    setDailyPoints(newDaily);
    setWeeklyPoints((p) => p + pts);
    setRecentGain(`+${pts}`);
    setTimeout(() => setRecentGain(null), 900);

    // Level up visual si cruza objetivo
    if (newDaily >= levelTarget) {
      setShowLevelUp(true);
      setMotivation(phrases[Math.floor(Math.random() * phrases.length)]);
      setTimeout(() => setShowLevelUp(false), 1800);
    }
  };

  const gridActivities = useMemo(() => {
    // 3 columnas × 3 filas
    const nine = [...activities];
    if (nine.length < 9) {
      // completar con placeholders si faltan
      while (nine.length < 9) nine.push({ label: "—", pts: 0, disabled: true });
    } else if (nine.length > 9) {
      nine.length = 9;
    }
    return nine;
  }, [activities]);

  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Header: nivel y día */}
      <div className="top-info">
        <div className="level-title">
          Nivel {stageIndex + 1}: {levelName}
        </div>
        <div className="day-label">
          Día {day} / {daysInMonth}
        </div>
      </div>

      {/* Héroe */}
      <div className="hero-wrap">
        {/* usa spritesheet si tenés /hero_idle.png, si no podés cambiar a /hero_idle.gif */}
        <div className="hero-sprite" />
      </div>

      {/* Marcadores */}
      <div className="scores">
        <div className="score-row">
          <span className="score-number">{dailyPoints}</span>
          <span className="score-label">puntos</span>
          <span className="score-sub">Hoy</span>
        </div>

        {/* Barra de experiencia */}
        <div className="exp-bar">
          <div
            className="exp-fill"
            style={{ width: `${expPct}%`, backgroundColor: levelColor }}
          />
        </div>

        <div className="week-score">{weeklyPoints} puntos en la semana</div>
        <div className="quote">{motivation}</div>

        {/* pop +XX al sumar */}
        <AnimatePresence>
          {recentGain && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -10 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="recent-gain"
            >
              {recentGain}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actividades: grilla 3×3 */}
      <div className="activities">
        {gridActivities.map((a, i) => (
          <button
            key={i}
            className={`activity-btn ${a.disabled ? "is-disabled" : ""}`}
            onClick={() => !a.disabled && addPoints(a.pts)}
            disabled={a.disabled}
          >
            <div className="a-label">{a.label}</div>
            {!a.disabled && <div className="a-points">+{a.pts}</div>}
          </button>
        ))}
      </div>

      {/* Footer: ajustes / gráficos / historial */}
      <div className="footer-icons">
        <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Ajustes">
          <Settings size={26} />
        </button>
        <button className="icon-btn" onClick={() => setShowProgress(true)} aria-label="Gráficos">
          <BarChart3 size={26} />
        </button>
        <button className="icon-btn" onClick={() => setShowHistory(true)} aria-label="Historial">
          <History size={26} />
        </button>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {showSettings && (
          <Modal onClose={() => setShowSettings(false)} title="⚙️ Ajustes">
            <ul className="modal-list">
              <li>Modo oscuro: On</li>
              <li>Guardado automático: On</li>
              <li>Recompensa actual: editable en próxima sección</li>
            </ul>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProgress && (
          <Modal onClose={() => setShowProgress(false)} title="📈 Evolución">
            <p className="modal-note">
              Acá vamos a renderizar el gráfico real (últimos 7 días / mensual).  
              El “Balance general” mensual se calcula con tus totales guardados en localStorage.
            </p>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <Modal onClose={() => setShowHistory(false)} title="🕓 Historial">
            <p className="modal-note">
              Próxima iteración: listado de días con totales + exportación.
            </p>
          </Modal>
        )}
      </AnimatePresence>

      {/* Efecto épico de Level Up */}
      <LevelUpEffect visible={showLevelUp} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UI genérica de modal
function Modal({ title, onClose, children }) {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-card"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>Cerrar</button>
        </div>
        <div className="modal-content">{children}</div>
      </motion.div>
    </motion.div>
  );
}
