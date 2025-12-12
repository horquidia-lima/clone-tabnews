import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  return (
    <>
      <div className="container">
        <h1>🟢 Status</h1>
        <UpdatedAt isLoading={isLoading} data={data} />

        <div className="database">
          <h1>🗄️ Database (PostgreSQL)</h1>
          <DatabaseStatus isLoading={isLoading} data={data} />
        </div>
      </div>

      <style jsx>
        {`
          .container {
            padding: 20px;
            font-family: monospace;
          }
        `}
      </style>
    </>
  );
}

function UpdatedAt({ isLoading, data }) {
  let updatedAtText = "Carregando...";
  let updateIndicator = "⏳";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    updateIndicator = "✓";
  }

  return (
    <>
      <div className="update-box">
        <strong>{updateIndicator} Última atualização:</strong>
        {updatedAtText}
      </div>

      <style jsx>
        {`
          .update-box {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
          }
        `}
      </style>
    </>
  );
}

function DatabaseStatus({ data }) {
  if (!data?.dependencies?.database) {
    return (
      <div style={{ color: "red" }}>❌ Dados do banco não disponíveis</div>
    );
  }

  const db = data.dependencies.database;
  const connectionPercentage = (
    (db.opened_connections / db.max_connections) *
    100
  ).toFixed(1);

  let connectionColor = "#4CAF50";
  if (connectionPercentage > 70) connectionColor = "#FF9800";
  if (connectionPercentage > 90) connectionColor = "#F44336";

  return (
    <>
      <div className="database-card">
        <div className="info-row">
          <div>
            <strong>Versão:</strong> {db.version}
          </div>
        </div>

        <div className="connections-section">
          <div className="connections-header">
            <strong>Conexões:</strong>
            <span>
              {db.opened_connections} / {db.max_connections}
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${connectionPercentage}%`,
                background: connectionColor,
              }}
            >
              {connectionPercentage}%
            </div>
          </div>
        </div>

        <div className="hint">💡 Atualização automática a cada 2 segundos</div>
      </div>

      <style jsx>{`
        .database-card {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        h3 {
          margin-top: 0;
          font-size: 24px;
        }

        .info-row {
          margin-bottom: 15px;
        }

        .connections-section {
          margin-bottom: 10px;
        }

        .connections-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .progress-bar {
          background: #e0e0e0;
          border-radius: 10px;
          height: 20px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition:
            width 0.3s ease,
            background 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
          min-width: 50px;
        }

        .hint {
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }
      `}</style>
    </>
  );
}
