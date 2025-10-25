import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/** =========================
 *  Utilidades de fecha
 *  ========================= */
const fmt = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .slice(0, 10);

const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const weekKeyOf = (d) => `${d.getFullYear()}-W${String(getISOWeek(d)).padStart(2, "0")}`;
const monthKeyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/** =========================
 *  Frases cortas para insights
 *  ========================= */
const advicePool = [
  "Probá sumar 10' sin pantallas después de comer.",
  "Dormir 7h+ hoy te acerca a tu mejor versión.",
  "Pequeño sprint: completá una tarea laboral clave.",
  "Caminata de 30' = foco + creatividad.",
  "Micro-diario: 3 líneas de gratitud hoy.",
  "Si ya entrenaste, hidratate y estirá 5'.",
];

/** =========================
 *  Componente Modal
 *  ========================= */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card animate-in">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>Cerrar</button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

/** =========================
 *  App
 *  ========================= */
export default function App() {
  const [dailyPoints, setDailyPoints] = useState(0);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [history, setHistory] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [reward, setReward] = useState("Recompensa: plan con amigos 🍕");
  const [showSettings, setShowSettings] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showFrequency, setShowFrequency] = useState(false);
  const [confirmReset, setConfirmReset] = useState(null);
  const [floaters, setFloaters] = useState([]);
  const [actionLog, setActionLog] = useState([]);
  let floaterId = useMemo(() => 0, []);

  const activities = [
    { label: "Entrené", pts: 10, icon: "🏋️‍♂️" },
    { label: "Caminé 30 min", pts: 5, icon: "🚶" },
    { label: "Comí saludable", pts: 5, icon: "🥗" },
    { label: "Dormí 7h+", pts: 5, icon: "😴" },
    { label: "Sin pantallas", pts: 5, icon: "📵" },
    { label: "Reflexioné", pts: 5, icon: "📝" },
    { label: "Tarea laboral", pts: 10, icon: "💼" },
    { label: "Aprendí algo", pts: 5, icon: "📚" },
    { label: "Mejoré proceso", pts: 10, icon: "⚙️" },
  ];

  const levelNames = [
    "El llamado a la aventura",
    "Primeros pasos",
    "El camino de las pruebas",
    "Frente al abismo",
    "Salto de fe",
    "La gloria eterna",
  ];

  const { level, day, daysInMonth } = useMemo(() => {
    const now = new Date();
    const d = now.getDate();
    const mDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const seg = Math.ceil(mDays / 6);
    const idx = Math.min(5, Math.floor((d - 1) / seg));
    return { level: idx + 1, day: d, daysInMonth: mDays };
  }, []);

  const levelBackgrounds = {
    1: "/assets/backgrounds/bg1_forest.png",
    2: "/assets/backgrounds/bg2_village.png",
    3: "/assets/backgrounds/bg3_mountain.png",
    4: "/assets/backgrounds/bg4_cave.png",
    5: "/assets/backgrounds/bg5_castle.png",
    6: "/assets/backgrounds/bg6_legend.png",
  };

  const stagePercents = [0.8, 0.9, 1.0, 1.1, 1.2, 1.0];
  const baseDailyTarget = 50;
  const levelTarget = Math.max(10, Math.round(baseDailyTarget * stagePercents[level - 1]));
  const expPercent = Math.min(100, Math.round((dailyPoints / levelTarget) * 100));

  const today = new Date();
  const todayKey = fmt(today);
  const wKey = weekKeyOf(today);
  const mKey = monthKeyOf(today);

  /** ========= Persistencia ========= **/
  useEffect(() => {
    const raw = localStorage.getItem("dp_v3");
    if (raw) {
      try {
        const s = JSON.parse(raw);
        setDailyPoints(s.dailyPoints || 0);
        setWeeklyPoints(s.weeklyPoints || 0);
        setMonthlyPoints(s.monthlyPoints || 0);
        setHistory(s.history || {});
        setCurrentStreak(s.currentStreak || 0);
        setLongestStreak(s.longestStreak || 0);
        setReward(s.reward || "Recompensa: plan con amigos 🍕");
        if (Array.isArray(s.actionLog)) setActionLog(s.actionLog || []);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const s = {
      todayKey,
      weekKey: wKey,
      monthKey: mKey,
      dailyPoints,
      weeklyPoints,
      monthlyPoints,
      history,
      currentStreak,
      longestStreak,
      reward,
      actionLog,
    };
    localStorage.setItem("dp_v3", JSON.stringify(s));
  }, [todayKey, wKey, mKey, dailyPoints, weeklyPoints, monthlyPoints, history, currentStreak, longestStreak, reward, actionLog]);

  /** ========= Acciones ========= **/
  const addPoints = (pts, label) => {
    setDailyPoints((p) => p + pts);
    setWeeklyPoints((p) => p + pts);
    setMonthlyPoints((p) => p + pts);
    setHistory((h) => ({ ...h, [todayKey]: (h[todayKey] || 0) + pts }));
    setActionLog((a) => [...a, { date: todayKey, label, pts }]);

    const id = (floaterId = floaterId + 1);
    setFloaters((arr) => [...arr, { id, text: `+${pts}` }]);
    setTimeout(() => setFloaters((arr) => arr.filter((f) => f.id !== id)), 1200);
  };

  const clearToday = () => {
    const ptsToday = history[todayKey] || 0;
    setDailyPoints(0);
    setWeeklyPoints((p) => Math.max(0, p - ptsToday));
    setMonthlyPoints((p) => Math.max(0, p - ptsToday));
    setHistory((h) => {
      const next = { ...h };
      delete next[todayKey];
      return next;
    });
  };

  /** ========= Frecuencia ========= **/
  const freqStats = useMemo(() => {
    const last7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const last30Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    const byLabel = {};

    for (const a of actionLog) {
      const d = new Date(a.date);
      if (!byLabel[a.label]) byLabel[a.label] = { count7: 0, count30: 0 };
      if (d >= last30Days) byLabel[a.label].count30++;
      if (d >= last7Days) byLabel[a.label].count7++;
    }

    return Object.entries(byLabel)
      .map(([label, counts]) => ({
        label,
        count7: counts.count7,
        count30: counts.count30,
        icon: activities.find((x) => x.label === label)?.icon || "⭐",
      }))
      .sort((a, b) => b.count30 - a.count30);
  }, [actionLog, todayKey]);

  /** ========= Render ========= **/
  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const k = fmt(d);
      out.push({ key: k, label: d.toLocaleDateString("es-AR", { weekday: "short" }), pts: history[k] || 0 });
    }
    return out;
  }, [todayKey, history]);

  const weekTotal = last7.reduce((a, b) => a + b.pts, 0);
  const monthlyDaysKeys = useMemo(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const arr = [];
    for (let d = new Date(first); d <= next; d.setDate(d.getDate() + 1)) arr.push(fmt(d));
    return arr;
  }, [mKey]);

  const monthlyTotalReal = monthlyDaysKeys.reduce((sum, k) => sum + (history[k] || 0), 0);
  const monthlyAvg = monthlyDaysKeys.length ? Math.round(monthlyTotalReal / monthlyDaysKeys.length) : 0;

  const insight = useMemo(() => {
    if (dailyPoints < levelTarget * 0.4) return "Vas bien; sumar una caminata o reflexión te acerca al objetivo.";
    if (dailyPoints >= levelTarget) return "¡Objetivo diario cumplido! Tomate una recompensa breve.";
    return advicePool[Math.floor(Math.random() * advicePool.length)];
  }, [dailyPoints, levelTarget, todayKey]);

  return (
    <div className="game-container" style={{ backgroundImage: `url(${levelBackgrounds[level]})` }}>
      <div className="hud">
        <h1 className="title">Nivel {level}: {levelNames[level - 1]}</h1>
        <div className="subtle">{`Día ${day} / ${daysInMonth}`}</div>

        <div className="scoreboard">
          <div className="points">
            <span className="score">{dailyPoints}</span>
            <span className="label">puntos hoy</span>
          </div>
        </div>

        <div className="xp-bar thick">
          <div className="xp-fill" style={{ width: `${expPercent}%` }} />
        </div>

        <div className="weekly">{weeklyPoints} puntos en la semana</div>

        <div className="floaters-wrap" aria-hidden="true">
          {floaters.map((f) => <div key={f.id} className="floater">{f.text}</div>)}
        </div>

        <div className="insight">{insight}</div>
      </div>

      <div className="character-section">
        <img src="/assets/hero.gif" alt="Héroe de Diego" className="hero-sprite" />
      </div>

      <div className="buttons-grid">
        {activities.map((a) => (
          <button key={a.label} onClick={() => addPoints(a.pts, a.label)} className="activity-btn">
            <span className="ico">{a.icon}</span>
            <span>{a.label}</span>
            <div className="pts">+{a.pts}</div>
          </button>
        ))}
      </div>

      <div className="footer-buttons">
        <button className="circle-btn" onClick={() => setShowSettings(true)} title="Ajustes">⚙️</button>
        <button className="circle-btn" onClick={() => setShowProgress(true)} title="Gráficos">📈</button>
        <button className="circle-btn" onClick={() => setShowBalance(true)} title="Balance mensual">📜</button>
        <button className="circle-btn" onClick={() => setShowFrequency(true)} title="Frecuencia">📊</button>
      </div>

      <div className="clear-today">
        <button className="clear-btn" onClick={clearToday}>Borrar entradas de hoy</button>
      </div>

      {showSettings && (
        <Modal title="⚙️ Ajustes" onClose={() => setShowSettings(false)}>
          <label>Tu recompensa</label>
          <input className="reward-input" value={reward} onChange={(e) => setReward(e.target.value)} />
        </Modal>
      )}

      {showProgress && (
        <Modal title="📈 Evolución semanal" onClose={() => setShowProgress(false)}>
          <div className="bars">
            {last7.map((d) => {
              const pct = Math.min(100, Math.round((d.pts / baseDailyTarget) * 100));
              return (
                <div key={d.key} className="bar-item">
                  <div className="bar">
                    <div className="bar-fill" style={{ height: `${pct}%` }} />
                  </div>
                  <div className="bar-label">{d.label}</div>
                  <div className="bar-value">{d.pts}</div>
                </div>
              );
            })}
          </div>
          <div className="bars-total">Total: {weekTotal} pts</div>
        </Modal>
      )}

      {showBalance && (
        <Modal title="📜 Balance mensual" onClose={() => setShowBalance(false)}>
          <div className="balance-grid">
            <div className="balance-card">
              <div className="bc-title">Total</div>
              <div className="bc-value">{monthlyTotalReal}</div>
            </div>
            <div className="balance-card">
              <div className="bc-title">Promedio diario</div>
              <div className="bc-value">{monthlyAvg}</div>
            </div>
            <div className="balance-card">
              <div className="bc-title">Racha más larga</div>
              <div className="bc-value">{longestStreak} días</div>
            </div>
          </div>
        </Modal>
      )}

      {showFrequency && (
        <Modal title="📊 Frecuencia de hábitos" onClose={() => setShowFrequency(false)}>
          {freqStats.length === 0 ? (
            <p>No hay datos suficientes aún.</p>
          ) : (
            <div className="freq-list">
              {freqStats.map((f) => (
                <div key={f.label} className="freq-item">
                  <div className="freq-icon">{f.icon}</div>
                  <div className="freq-info">
                    <div className="freq-label">{f.label}</div>
                    <div className="freq-bar">
                      <div className="freq-fill" style={{ width: `${Math.min(100, f.count30 * 3)}%` }} />
                    </div>
                    <div className="freq-sub">{f.count7} veces / 7 días • {f.count30} / 30 días</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
