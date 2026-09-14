import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [initialBalance, setInitialBalance] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Cargar el saldo inicial de localStorage al montar el componente
    const savedBalance = localStorage.getItem('initialBalance');
    if (savedBalance) {
      setInitialBalance(savedBalance);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('initialBalance', initialBalance);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Ocultar mensaje después de 3 segundos
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Configuración</h1>
      
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Saldo Inicial</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Ingresa el saldo base con el que empiezas (la suma de tus cuentas bancarias y efectivo). 
          Este valor se sumará a tus ingresos y restará a tus gastos para calcular el saldo unificado.
        </p>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Monto del Saldo Inicial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monto ($)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="$0.00" 
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '1.5rem', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontFamily: 'inherit'
              }} 
            />
          </div>

          {/* Guardar */}
          <button 
            type="submit" 
            style={{ 
              marginTop: '10px',
              padding: '16px', 
              borderRadius: '8px', 
              background: 'var(--accent-primary)', 
              color: 'white', 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            Guardar Saldo
          </button>
          
          {isSaved && (
            <div style={{ 
              marginTop: '10px', 
              padding: '12px', 
              background: 'rgba(16, 185, 129, 0.2)', 
              border: '1px solid var(--accent-success)', 
              borderRadius: '8px',
              color: 'var(--accent-success)',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              ¡Saldo inicial guardado correctamente!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;
