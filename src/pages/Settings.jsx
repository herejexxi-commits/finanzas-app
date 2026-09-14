import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const Settings = () => {
  const [initialBalance, setInitialBalance] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const result = [];
    const headers = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const rowArr = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        let val = rowArr[j] ? rowArr[j].trim() : '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
        if (headers[j]) {
          obj[headers[j].trim()] = val;
        }
      }
      result.push(obj);
    }
    return result;
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const data = parseCSV(text);
      
      const transactions = data.map(row => {
        if (!row.tipo || !row.valor) return null;
        
        const type = row.tipo === 'INGRESO' ? 'ingreso' : 'gasto';
        let category = '';
        
        if (type === 'ingreso') {
          if (row.categoria === 'Tatuaje' || row.categoria === 'Tatuajes') category = 'Tatuajes';
          else if (row.categoria === 'Piercing' || row.categoria === 'Piercings') category = 'Piercings';
          else category = 'Otros Ingresos';
        } else {
          const c = row.categoria;
          if (c === 'Casa') category = 'Vivienda y Servicios';
          else if (c === 'Comida' || c === 'Comoda') category = 'Supermercado y Despensa';
          else if (c === 'Negocio') category = 'Operativo Tatuajes';
          else if (c === 'Moto') category = 'Movilidad';
          else if (c === 'Amor') category = 'Ocio y Salidas';
          else if (c === 'Personal' || c === 'Gym' || c === 'Salud') category = 'Salud y Bienestar';
          else category = 'Ocio y Salidas'; 
        }

        let dateObj = new Date();
        if (row.Fecha) {
          const parts = row.Fecha.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            dateObj = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
          }
        }

        return {
          type,
          amount: parseFloat(row.valor),
          category,
          description: row.notas || '',
          created_at: dateObj.toISOString()
        };
      }).filter(Boolean);

      try {
        const { error } = await supabase.from('transactions').insert(transactions);
        if (error) throw error;
        alert(`¡Importación exitosa de ${transactions.length} transacciones! Ve al Historial para verlas.`);
      } catch (err) {
        alert("Error al importar: " + err.message);
      } finally {
        setIsImporting(false);
        e.target.value = null; // Reset input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Configuración</h1>
      
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Saldo Inicial</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Ingresa el saldo base con el que empiezas (la suma de tus cuentas bancarias y efectivo). 
          Este valor se sumará a tus ingresos y restará a tus gastos para calcular el saldo unificado.
        </p>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Importar Historial (Google Sheets)</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Selecciona tu archivo .csv exportado para migrar tus transacciones antiguas a las nuevas categorías.
        </p>
        
        <input 
          type="file" 
          accept=".csv"
          onChange={handleImport}
          disabled={isImporting}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            background: 'rgba(0,0,0,0.2)',
            border: '1px dashed var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            cursor: isImporting ? 'not-allowed' : 'pointer'
          }}
        />
        {isImporting && <p style={{ marginTop: '10px', color: 'var(--accent-primary)' }}>Importando datos, por favor espera...</p>}
      </div>
    </div>
  );
};

export default Settings;
