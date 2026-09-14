import React, { useEffect, useState } from 'react';
import { getTransactions } from '../services/transactionService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialBalance, setInitialBalance] = useState(0);

  useEffect(() => {
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

  const tiendaCategories = ['Operativo Tienda', 'Marketing y Publicidad Tienda', 'Tienda Virtual'];
  const tiendaTransactions = currentMonthTransactions.filter(tx => tiendaCategories.includes(tx.category));
  const personalTransactions = currentMonthTransactions.filter(tx => !tiendaCategories.includes(tx.category));

  const processChartData = (txList) => {
    const exp = txList.filter(tx => tx.type === 'gasto');
    const inc = txList.filter(tx => tx.type === 'ingreso');
    
    const expByCategory = exp.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
    const incByCategory = inc.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    const totalExp = exp.reduce((a, b) => a + b.amount, 0);
    const totalInc = inc.reduce((a, b) => a + b.amount, 0);

    return {
      expensesChartData: Object.keys(expByCategory).map(k => ({name: k, value: expByCategory[k]})),
      incomesChartData: Object.keys(incByCategory).map(k => ({name: k, value: incByCategory[k]})),
      totalExp,
      totalInc,
      net: totalInc - totalExp
    };
  };

  const tiendaData = processChartData(tiendaTransactions);
  const personalData = processChartData(personalTransactions);

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

  const renderDashboardSection = (title, data) => (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>{title} ({currentDate.toLocaleString('default', { month: 'long' })})</h2>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '8px' }}>Ganancia Neta:</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: data.net >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
            {data.net >= 0 ? '+' : ''}${data.net.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="glass-panel" style={{ padding: '20px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Gastos</h3>
          <p style={{ color: 'var(--accent-danger)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
            ${data.totalExp.toFixed(2)}
          </p>
          {data.expensesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.expensesChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {data.expensesChartData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS_EXPENSES[i % COLORS_EXPENSES.length]} />)}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>No hay gastos</p>}
        </div>

        <div className="glass-panel" style={{ padding: '20px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Ingresos</h3>
          <p style={{ color: 'var(--accent-success)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
             ${data.totalInc.toFixed(2)}
          </p>
          {data.incomesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.incomesChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {data.incomesChartData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS_INCOMES[i % COLORS_INCOMES.length]} />)}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>No hay ingresos</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '20px' }}>Dashboard</h1>
      
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Saldo Total Unificado</p>
          <h2 style={{ fontSize: '2.5rem', color: unifiedBalance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
            ${unifiedBalance.toFixed(2)}
          </h2>
        </div>
      </div>

      {renderDashboardSection("Personal y Tatuajes", personalData)}
      {renderDashboardSection("Tienda Virtual", tiendaData)}
    </div>
  );
};

export default Dashboard;
