export const generateFinancialPrompt = (transactions) => {
  // Resumir transacciones
  const incomes = transactions.filter(t => t.type === 'ingreso');
  const expenses = transactions.filter(t => t.type === 'gasto');

  const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

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
    const typeStr = t.type === 'ingreso' ? 'Ingreso' : 'Gasto';
    const desc = t.description ? ` (${t.description})` : '';
    return `- [${date}] ${typeStr} | ${t.category}: $${t.amount}${desc}`;
  }).join('\n');

  const prompt = `Eres mi asesor financiero personal experto y analítico. 
A continuación, te presento el detalle de mis finanzas de este mes:

**RESUMEN GENERAL**
Ingresos Totales: $${totalIncome}
Gastos Totales: $${totalExpense}

**INGRESOS POR CATEGORÍA**
${Object.keys(incomesByCategory).length > 0 ? Object.entries(incomesByCategory).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n') : 'Sin ingresos'}

**GASTOS POR CATEGORÍA**
${Object.keys(expensesByCategory).length > 0 ? Object.entries(expensesByCategory).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n') : 'Sin gastos'}

**HISTORIAL DETALLADO DE TRANSACCIONES**
${transactionsList}

Basado en todos estos datos, por favor bríndame:
1. Una evaluación general de mi mes financiero.
2. ¿En qué categorías o gastos específicos (revisando el historial detallado) consideras que estoy gastando de más o podría optimizar?
3. Consejos prácticos, motivadores y directos para ahorrar o mejorar mi salud financiera el próximo mes.

Mantenlo directo, profesional y fácil de leer con viñetas.`;

  return prompt;
};
