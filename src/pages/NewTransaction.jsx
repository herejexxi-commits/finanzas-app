import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addTransaction, getTransactionById, updateTransaction, deleteTransaction } from '../services/transactionService';

const NewTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [formData, setFormData] = useState({
    type: 'gasto',
    amount: '',
    category: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchTx = async () => {
        try {
          const tx = await getTransactionById(id);
          setFormData({
            type: tx.type,
            amount: tx.amount.toString(),
            category: tx.category,
            description: tx.description
          });
        } catch (error) {
          alert("Error cargando la transacción");
          navigate('/historial');
        }
      };
      fetchTx();
    }
  }, [id, isEditing, navigate]);

  const handleTypeChange = (newType) => {
    setFormData({ ...formData, type: newType, category: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      alert("Por favor completa el monto y la categoría.");
      return;
    }
    
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateTransaction(id, formData);
      } else {
        await addTransaction(formData);
      }
      navigate('/historial'); // Redirigir al historial después de guardar
    } catch (error) {
      alert("Hubo un error al guardar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
      setIsDeleting(true);
      try {
        await deleteTransaction(id);
        navigate('/historial');
      } catch (error) {
        alert("Hubo un error al eliminar: " + error.message);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>{isEditing ? 'Editar Transacción' : 'Nueva Transacción'}</h1>
      
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
                  <optgroup label="Personal">
                    <option value="Vivienda y Servicios">Vivienda y Servicios 🏠</option>
                    <option value="Supermercado y Despensa">Supermercado y Despensa 🛒</option>
                    <option value="Ocio y Salidas">Ocio y Salidas 🍔</option>
                    <option value="Movilidad">Movilidad 🚗</option>
                    <option value="Educación y Desarrollo">Educación y Desarrollo 📚</option>
                    <option value="Salud y Bienestar">Salud y Bienestar 🏋️</option>
                    <option value="Inversiones">Inversiones (Broker) 📈</option>
                  </optgroup>
                  <optgroup label="Negocio Tatuajes">
                    <option value="Operativo Tatuajes">Operativo Tatuajes 💉</option>
                    <option value="Marketing y Publicidad Tatuajes">Marketing y Publicidad Tatuajes 📢</option>
                  </optgroup>
                  <optgroup label="Negocio Tienda Virtual">
                    <option value="Operativo Tienda">Operativo Tienda 🛍️</option>
                    <option value="Marketing y Publicidad Tienda">Marketing y Publicidad Tienda 📢</option>
                  </optgroup>
                </>
              ) : (
                <>
                  <option value="Tatuajes">Tatuajes 💉</option>
                  <option value="Piercings">Piercings 💎</option>
                  <option value="Tienda Virtual">Tienda Virtual 🛍️</option>
                  <option value="Otros Ingresos">Otros Ingresos 💰</option>
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
            disabled={isLoading || isDeleting}
            style={{ 
              marginTop: '10px',
              padding: '16px', 
              borderRadius: '8px', 
              background: (isLoading || isDeleting) ? 'var(--text-muted)' : 'var(--accent-primary)', 
              color: 'white', 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: (isLoading || isDeleting) ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.3)',
              cursor: (isLoading || isDeleting) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Guardar Transacción')}
          </button>
          
          {isEditing && (
            <button 
              type="button" 
              disabled={isLoading || isDeleting}
              onClick={handleDelete}
              style={{ 
                padding: '16px', 
                borderRadius: '8px', 
                background: 'transparent', 
                color: 'var(--accent-danger)', 
                border: '1px solid var(--accent-danger)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: (isLoading || isDeleting) ? 'not-allowed' : 'pointer'
              }}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Transacción'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewTransaction;
