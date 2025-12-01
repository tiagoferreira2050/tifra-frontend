"use client";

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

export default function SignUpPage() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "350px",
          padding: "20px",
          borderRadius: "10px",
          background: "white",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          Criar Conta
        </h2>

        <form style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="text" placeholder="Nome" style={inputStyle} />
          <input type="email" placeholder="Email" style={inputStyle} />
          <input type="password" placeholder="Senha" style={inputStyle} />

          <button
            type="submit"
            style={{
              padding: "12px",
              background: "#7B2CBF",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            Criar Conta
          </button>
        </form>
      </div>
    </div>
  );
}
