import { useState, useEffect } from "react";

// Pegá acá el HASH de tu contraseña (no la contraseña en sí).
// Ver instrucciones para generarlo.
const PASSWORD_HASH = "PEGAR_ACA_EL_HASH_GENERADO";

async function hashText(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LoginGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("musse_access") === "true";
    setUnlocked(saved);
    setChecking(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hash = await hashText(password);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem("musse_access", "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  // Evita un parpadeo mientras chequea si ya había una sesión activa
  if (checking) return null;

  if (!unlocked) {
    return (
      <div style={styles.container}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>Acceso restringido</h2>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <button type="submit" style={styles.button}>
            Entrar
          </button>
          {error && <p style={styles.error}>Contraseña incorrecta</p>}
        </form>
      </div>
    );
  }

  return children;
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "32px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "280px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    textAlign: "center",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111827",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    textAlign: "center",
    margin: 0,
  },
};
