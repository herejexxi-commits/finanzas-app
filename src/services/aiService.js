import { getGeminiApiKey } from './settingsService';

export const generateFinancialAdvice = async (transactions) => {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  // Resumir transacciones para no gastar tantos tokens
  const incomes = transactions.filter(t => t.type === 'ingreso');
  const expenses = transactions.filter(t => t.type === 'gasto');

  const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

  const expensesByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const prompt = `
Eres un asesor financiero experto y analítico. 
A continuación, te presento el resumen de mis finanzas del mes:

Ingresos Totales: $${totalIncome}
Gastos Totales: $${totalExpense}

Detalle de gastos por categoría:
${Object.entries(expensesByCategory).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}

Por favor, analiza estos datos y bríndame:
1. Una evaluación general de mi mes.
2. ¿En qué categorías estoy gastando de más?
3. Consejos prácticos para ahorrar o mejorar mi salud financiera.
Mantenlo directo, profesional, motivador y no demasiado largo. Usa formato Markdown.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al conectar con Gemini');
    }

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Respuesta vacía de Gemini');
    }
  } catch (error) {
    console.error("Error generating advice:", error);
    throw error;
  }
};
