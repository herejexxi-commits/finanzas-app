import React, { useEffect, useState } from 'react';
import { getTransactions } from '../services/transactionService';
import { getInitialBalance } from '../services/settingsService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialBalance, setInitialBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsData, balanceData] = await Promise.all([
          getTransactions(),
          getInitialBalance()
        ]);
        setTransactions(transactionsData);
        setInitialBalance(balanceData);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const COLORS_EXPENSES = ['#ff003c', '#ff6b00', '#ffaa00', '#d800ff', '#ff009d', '#555555'];
  const COLORS_INCOMES = ['#00ffd0', '#009dff', '#7b00ff', '#ffaa00', '#555555'];

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px', border: '1px solid var(--accent-primary)', boxShadow: 'var(--neon-glow)' }}>
          <p style={{ color: 'var(--text-main)', margin: 0, fontFamily: 'Rajdhani', fontWeight: 600 }}>{`${payload[0].name} : $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderDashboardSection = (title, data) => (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', margin: 0 }}>{title} <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>({currentDate.toLocaleString('default', { month: 'short' })})</span></h2>
        <div style={{ background: 'var(--bg-card)', padding: '8px 16px', border: '1px solid var(--accent-primary)', boxShadow: '0 0 10px rgba(255, 107, 0, 0.2)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', marginRight: '8px', textTransform: 'uppercase' }}>NET YIELD:</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'Orbitron', color: data.net >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', textShadow: data.net >= 0 ? '0 0 5px var(--accent-success)' : '0 0 5px var(--accent-danger)' }}>
            {data.net >= 0 ? '+' : ''}${data.net.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="glass-panel" style={{ padding: '20px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>GASTOS</h3>
          <p style={{ color: 'var(--accent-danger)', fontWeight: 'bold', fontFamily: 'Orbitron', fontSize: '1.3rem', marginBottom: '10px', textShadow: '0 0 5px var(--accent-danger)' }}>
            ${data.totalExp.toFixed(2)}
          </p>
          {data.expensesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.expensesChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="var(--bg-card)">
                  {data.expensesChartData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS_EXPENSES[i % COLORS_EXPENSES.length]} />)}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend wrapperStyle={{ fontFamily: 'Rajdhani', fontSize: '0.9rem' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>No hay gastos</p>}
        </div>

        <div className="glass-panel" style={{ padding: '20px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>INGRESOS</h3>
          <p style={{ color: 'var(--accent-success)', fontWeight: 'bold', fontFamily: 'Orbitron', fontSize: '1.3rem', marginBottom: '10px', textShadow: '0 0 5px var(--accent-success)' }}>
             ${data.totalInc.toFixed(2)}
          </p>
          {data.incomesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.incomesChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="var(--bg-card)">
                  {data.incomesChartData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS_INCOMES[i % COLORS_INCOMES.length]} />)}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend wrapperStyle={{ fontFamily: 'Rajdhani', fontSize: '0.9rem' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>No hay ingresos</p>}
        </div>

        <div className="glass-panel" style={{ padding: '20px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>SYS.BALANCE</h3>
          <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontFamily: 'Orbitron', fontSize: '1.2rem', marginBottom: '10px' }}>
            VS
          </p>
          {(data.totalInc > 0 || data.totalExp > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Ingresos', value: data.totalInc },
                    { name: 'Gastos', value: data.totalExp }
                  ]} 
                  cx="50%" cy="50%" innerRadius={0} outerRadius={90} paddingAngle={2} dataKey="value" stroke="var(--bg-card)"
                >
                  <Cell fill="var(--accent-success)" />
                  <Cell fill="var(--accent-danger)" />
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend wrapperStyle={{ fontFamily: 'Rajdhani', fontSize: '0.9rem' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>No hay movimientos</p>}
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
