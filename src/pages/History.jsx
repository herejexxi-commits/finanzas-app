import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions } from '../services/transactionService';
import { formatCurrency } from '../utils/format';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error cargando historial", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at);
    return txDate.getMonth() === parseInt(selectedMonth) && txDate.getFullYear() === parseInt(selectedYear);
  });

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const years = [2024, 2025, 2026, 2027, 2028]; // Can make this dynamic later

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Historial de Movimientos</h1>
      
      {/* Filtros */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Mes</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
          >
            {months.map((m, index) => <option key={index} value={index}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Año</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        {isLoading ? (
          <div className="loading-screen" style={{ height: '200px' }}>Cargando transacciones...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredTransactions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                No hay transacciones registradas para este periodo.
              </p>
            ) : (
              filteredTransactions.map((tx) => {
                const dateObj = new Date(tx.created_at);
                const dayStr = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
                
                return (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.1rem' }}>{tx.category}</p>
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                          {dayStr}
                        </span>
                      </div>
                      {tx.description && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                          "{tx.description}"
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '100px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: tx.type === 'ingreso' ? 'var(--accent-success)' : 'var(--text-main)', textAlign: 'right' }}>
                        {tx.type === 'gasto' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </div>
                      <Link to={`/editar-transaccion/${tx.id}`} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', padding: '4px 8px', border: '1px solid var(--accent-primary)', borderRadius: '4px' }}>
                        Editar
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
