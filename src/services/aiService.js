export const generateFinancialPrompt = (transactions) => {
  const isInvestment = (cat) => cat && (cat === 'Inversiones' || cat.toLowerCase().includes('inversion') || cat.toLowerCase().includes('inversión') || cat.toLowerCase().includes('broker'));

  // Resumir transacciones
  const incomes = transactions.filter(t => t.type === 'ingreso');
  const investments = transactions.filter(t => isInvestment(t.category));
  const expenses = transactions.filter(t => t.type === 'gasto' && !isInvestment(t.category));

  const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalInvested = investments.reduce((acc, t) => acc + t.amount, 0);
  const operationalNet = totalIncome - totalExpense;

  const expensesByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const incomesByCategory = incomes.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const transactionsList = transactions.map(t => {
    const date = new Date(t.created_at).toLocaleDateString('es-ES');
    const isInv = isInvestment(t.category);
    const typeStr = isInv ? 'Inversión/Broker' : (t.type === 'ingreso' ? 'Ingreso' : 'Gasto Operativo');
    const desc = t.description ? ` (${t.description})` : '';
    return `- [${date}] ${typeStr} | ${t.category}: $${t.amount}${desc}`;
  }).join('\n');

  const prompt = `Eres mi asesor financiero personal experto y analítico. 
A continuación, te presento el detalle de mis finanzas de este mes:

**RESUMEN GENERAL**
- Ingresos Totales del mes: $${totalIncome}
- Gastos Operativos Totales (vida y negocio): $${totalExpense}
- Capital Transferido a Inversiones (Broker / Activos): $${totalInvested}
- Net Yield Operativo (Ingresos - Gastos Operativos): $${operationalNet}

**INGRESOS POR CATEGORÍA**
${Object.keys(incomesByCategory).length > 0 ? Object.entries(incomesByCategory).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n') : 'Sin ingresos'}

**GASTOS OPERATIVOS POR CATEGORÍA**
${Object.keys(expensesByCategory).length > 0 ? Object.entries(expensesByCategory).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n') : 'Sin gastos operativos'}

${totalInvested > 0 ? `**INVERSIONES / BROKER**\n- Capital total movido a inversión: $${totalInvested}\n` : ''}
**HISTORIAL DETALLADO DE TRANSACCIONES**
${transactionsList}

Basado en todos estos datos, por favor bríndame:
1. Una evaluación general de mi mes financiero (ten en cuenta que el dinero en Inversiones NO es un gasto, sino capital de ahorro/inversión).
2. ¿En qué categorías o gastos operativos específicos consideras que estoy gastando de más o podría optimizar?
3. Consejos prácticos, motivadores y directos para seguir aumentando mi capacidad de ahorro e inversión el próximo mes.

Mantenlo directo, profesional y fácil de leer con viñetas.`;

  return prompt;
};
