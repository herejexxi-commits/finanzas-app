import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTransaction } from '../services/transactionService';

const NewTransaction = () => {
  const navigate = useNavigate();
  const [type, setType] = [useState('gasto'), (t) => t]; // Fix: we need state for form
  const [formData, setFormData] = useState({
    type: 'gasto',
    amount: '',
    category: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeChange = (newType) => {
    setFormData({ ...formData, type: newType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      alert("Por favor completa el monto y la categoría.");
      return;
    }
    
    setIsLoading(true);
    try {
      await addTransaction(formData);
      navigate('/historial'); // Redirigir al historial después de guardar
    } catch (error) {
      alert("Hubo un error al guardar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Nueva Transacción</h1>
      
      <div className="glass-panel" style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tipo de transacción */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => handleTypeChange('gasto')}
              style={{ 
                flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 'bold',
                background: formData.type === 'gasto' ? 'var(--accent-danger)' : 'var(--bg-card)', 
                color: formData.type === 'gasto' ? 'white' : 'var(--text-main)', 
                border: formData.type === 'gasto' ? 'none' : '1px solid var(--border-color)' 
              }}>
              Gasto
            </button>
            <button 
              type="button" 
              onClick={() => handleTypeChange('ingreso')}
              style={{ 
                flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 'bold',
                background: formData.type === 'ingreso' ? 'var(--accent-success)' : 'var(--bg-card)', 
                color: formData.type === 'ingreso' ? 'white' : 'var(--text-main)', 
                border: formData.type === 'ingreso' ? 'none' : '1px solid var(--border-color)' 
              }}>
              Ingreso
            </button>
          </div>

          {/* Monto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monto</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
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

          {/* Categoría */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Categoría</label>
            <select 
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '14px', 
                fontSize: '1rem', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                appearance: 'none'
              }}
            >
              <option value="">Selecciona una categoría</option>
              {formData.type === 'gasto' ? (
                <>
                  <option value="Negocio Tatuajes">Negocio Tatuajes 💉</option>
                  <option value="Negocio Tienda Virtual">Negocio Tienda Virtual 🛒</option>
                  <option value="Casa">Casa 🏠</option>
                  <option value="Alimentación">Alimentación 🍔</option>
                  <option value="Transporte">Transporte 🚗</option>
                  <option value="Ocio">Ocio 🎬</option>
                  <option value="Otros">Otros 📦</option>
                </>
              ) : (
                <>
                  <option value="Tatuajes">Tatuajes 💉</option>
                  <option value="Piercing">Piercing 💎</option>
                  <option value="Tienda Virtual">Tienda Virtual 🛒</option>
                  <option value="Otros">Otros 📦</option>
                </>
              )}
            </select>
          </div>

          {/* Observación (Descripción) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Observación</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Ej. Agujas, almuerzo, etc." 
              rows="3"
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '1rem', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                resize: 'none'
              }} 
            />
          </div>

          {/* Guardar */}
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              marginTop: '10px',
              padding: '16px', 
              borderRadius: '8px', 
              background: isLoading ? 'var(--text-muted)' : 'var(--accent-primary)', 
              color: 'white', 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: isLoading ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.3)',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Guardando...' : 'Guardar Transacción'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTransaction;
