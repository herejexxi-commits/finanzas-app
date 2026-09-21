import React, { useState, useEffect } from 'react';
import { getTransactions } from '../services/transactionService';
import { generateFinancialPrompt } from '../services/aiService';
import { Brain, Copy, Check } from 'lucide-react';

const AiAdvisor = () => {
  const [transactions, setTransactions] = useState([]);
  const [promptText, setPromptText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const txs = await getTransactions();
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
  }, []);

  const handleGeneratePrompt = () => {
    const prompt = generateFinancialPrompt(transactions);
    setPromptText(prompt);
    setIsCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Brain size={32} color="var(--accent-primary)" />
        <h1 style={{ margin: 0 }}>Asesor IA</h1>
      </div>

      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Generador de Análisis</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.1rem' }}>
          Este botón recopilará tus {transactions.length} transacciones del mes y creará un texto listo para que lo pegues en ChatGPT, Gemini o Claude.
        </p>
        <button 
          onClick={handleGeneratePrompt}
          disabled={transactions.length === 0}
          style={{ 
            padding: '16px 32px', 
            borderRadius: '8px', 
            background: transactions.length === 0 ? 'var(--bg-card)' : 'var(--accent-primary)', 
            color: transactions.length === 0 ? 'var(--text-muted)' : 'white', 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            boxShadow: transactions.length === 0 ? 'none' : '0 4px 15px rgba(255, 107, 0, 0.3)',
            cursor: transactions.length === 0 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          Generar Texto para IA
        </button>
        {transactions.length === 0 && (
          <p style={{ color: 'var(--accent-danger)', marginTop: '16px', fontSize: '0.9rem' }}>
            No tienes transacciones este mes para analizar.
          </p>
        )}
      </div>

      {promptText && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Texto Generado:</h3>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isCopied ? 'var(--accent-success)' : 'white',
                border: `1px solid ${isCopied ? 'var(--accent-success)' : 'transparent'}`,
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
              {isCopied ? '¡Copiado!' : 'Copiar Texto'}
            </button>
          </div>
          <textarea
            readOnly
            value={promptText}
            rows={10}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              lineHeight: '1.5'
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '16px', textAlign: 'center' }}>
            Copia este texto y pégalo en tu IA favorita para recibir tu asesoría financiera.
          </p>
        </div>
      )}
    </div>
  );
};

export default AiAdvisor;
