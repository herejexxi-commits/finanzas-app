import React, { useEffect, useState } from 'react';
import { getTransactions } from '../services/transactionService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialBalance, setInitialBalance] = useState(0);

  useEffect(() => {
    // Load initial balance from settings
    const savedBalance = localStorage.getItem('initialBalance');
    if (savedBalance) {
      setInitialBalance(parseFloat(savedBalance));
    }

    const fetchTransactions = async () => {
      try {
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

  if (isLoading) {
    return <div className="loading-screen">Calculando balance...</div>;
  }

  // Calculate Unified Balance (All time)
  const totalTransactionsBalance = transactions.reduce((acc, tx) => {
    return tx.type === 'ingreso' ? acc + tx.amount : acc - tx.amount;
  }, 0);
  const unifiedBalance = initialBalance + totalTransactionsBalance;

  // Filter transactions for the CURRENT MONTH
  const currentDate = new Date();
  const currentMonthTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at);
    return txDate.getMonth() === currentDate.getMonth() && txDate.getFullYear() === currentDate.getFullYear();
  });

  // Group Expenses for Chart (Current Month)
  const expenses = currentMonthTransactions.filter(tx => tx.type === 'gasto');
  const expensesByCategory = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const expensesChartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  // Group Income for Chart (Current Month)
  const incomes = currentMonthTransactions.filter(tx => tx.type === 'ingreso');
  const incomesByCategory = incomes.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const incomesChartData = Object.keys(incomesByCategory).map(key => ({
    name: key,
    value: incomesByCategory[key]
  }));

  const currentMonthExpense = expenses.reduce((a, b) => a + b.amount, 0);
  const currentMonthIncome = incomes.reduce((a, b) => a + b.amount, 0);
  const currentMonthNet = currentMonthIncome - currentMonthExpense;

  const COLORS_EXPENSES = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];
  const COLORS_INCOMES = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#64748b'];

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--text-main)', margin: 0 }}>{`${payload[0].name} : $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '20px' }}>Dashboard</h1>
      
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Saldo Total Unificado</p>
          <h2 style={{ fontSize: '2.5rem', color: unifiedBalance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
            ${unifiedBalance.toFixed(2)}
          </h2>
        </div>
        {/* Breakdown removed as per user request to avoid confusion */}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>Resumen del Mes Actual</h2>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '8px' }}>Ganancia Neta del Mes:</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: currentMonthNet >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
            {currentMonthNet >= 0 ? '+' : ''}${currentMonthNet.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Gráfico de Gastos */}
        <div className="glass-panel" style={{ padding: '20px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Gastos ({currentDate.toLocaleString('default', { month: 'long' })})</h3>
          <p style={{ color: 'var(--accent-danger)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
            ${currentMonthExpense.toFixed(2)}
          </p>
          {expensesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expensesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_EXPENSES[index % COLORS_EXPENSES.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <p style={{ color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>No hay gastos en este mes</p>
          )}
        </div>

        {/* Gráfico de Ingresos */}
        <div className="glass-panel" style={{ padding: '20px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Ingresos ({currentDate.toLocaleString('default', { month: 'long' })})</h3>
          <p style={{ color: 'var(--accent-success)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
             ${currentMonthIncome.toFixed(2)}
          </p>
          {incomesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomesChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {incomesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_INCOMES[index % COLORS_INCOMES.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <p style={{ color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>No hay ingresos en este mes</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
