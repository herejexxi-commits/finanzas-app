import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getTransactions } from '../services/transactionService';
import { generateFinancialAdvice } from '../services/aiService';
import { Brain, Loader2 } from 'lucide-react';

const AiAdvisor = () => {
  const [transactions, setTransactions] = useState([]);
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const txs = await getTransactions();
        // Filtrar solo las del mes actual para el análisis
        const currentDate = new Date();
        const currentMonthTxs = txs.filter(tx => {
          const txDate = new Date(tx.created_at);
          return txDate.getMonth() === currentDate.getMonth() && txDate.getFullYear() === currentDate.getFullYear();
        });
        setTransactions(currentMonthTxs);
      } catch (err) {
        console.error("Error fetching transactions", err);
      }
    };
    fetchTransactions();
    
    // Verificar si hay API key
    if (!localStorage.getItem('geminiApiKey')) {
      setHasApiKey(false);
    }
  }, []);

  const handleGenerateAdvice = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await generateFinancialAdvice(transactions);
      setAdvice(response);
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        setError('No has configurado tu API Key de Gemini. Ve a Ajustes para añadirla.');
        setHasApiKey(false);
      } else {
        setError(err.message || 'Error al generar el análisis');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Brain size={32} color="var(--accent-primary)" />
        <h1 style={{ margin: 0 }}>Asesor IA</h1>
      </div>

      {!hasApiKey ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', border: '1px solid var(--accent-danger)' }}>
          <h2 style={{ color: 'var(--accent-danger)', marginBottom: '16px' }}>Configuración Necesaria</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Para usar el Asesor IA, necesitas configurar tu API Key de Google Gemini. 
            Puedes obtenerla gratis en Google AI Studio y pegarla en la sección de Ajustes.
          </p>
        </div>
      ) : (
        <>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.1rem' }}>
              La Inteligencia Artificial analizará tus {transactions.length} transacciones de este mes y te dará recomendaciones personalizadas.
            </p>
            <button 
              onClick={handleGenerateAdvice}
              disabled={isLoading || transactions.length === 0}
              style={{ 
                padding: '16px 32px', 
                borderRadius: '8px', 
                background: (isLoading || transactions.length === 0) ? 'var(--bg-card)' : 'var(--accent-primary)', 
                color: (isLoading || transactions.length === 0) ? 'var(--text-muted)' : 'white', 
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: (isLoading || transactions.length === 0) ? 'none' : '0 4px 15px rgba(255, 107, 0, 0.3)',
                cursor: (isLoading || transactions.length === 0) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Analizando...
                </>
              ) : (
                'Generar Análisis del Mes'
              )}
            </button>
            {transactions.length === 0 && (
              <p style={{ color: 'var(--accent-danger)', marginTop: '16px', fontSize: '0.9rem' }}>
                No tienes transacciones este mes para analizar.
              </p>
            )}
          </div>

          {error && (
            <div style={{ 
              padding: '16px', 
              background: 'rgba(255, 0, 60, 0.1)', 
              border: '1px solid var(--accent-danger)', 
              borderRadius: '8px',
              color: 'var(--accent-danger)',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          {advice && (
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div className="markdown-content" style={{ 
                lineHeight: '1.6', 
                color: 'var(--text-main)' 
              }}>
                <ReactMarkdown>{advice}</ReactMarkdown>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AiAdvisor;
