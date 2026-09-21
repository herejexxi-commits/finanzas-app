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

  const prompt = `Eres mi asesor financiero personal experto y analítico. 
A continuación, te presento el resumen de mis finanzas de este mes:

Ingresos Totales: $${totalIncome}
Gastos Totales: $${totalExpense}

Detalle de gastos por categoría:
${Object.entries(expensesByCategory).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}

Por favor, analiza estos datos y bríndame:
1. Una evaluación general de mi mes financiero.
2. ¿En qué categorías consideras que estoy gastando de más o podría optimizar?
3. Consejos prácticos, motivadores y directos para ahorrar o mejorar mi salud financiera el próximo mes.

Mantenlo directo, profesional y fácil de leer con viñetas.`;

  return prompt;
};
