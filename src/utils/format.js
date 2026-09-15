export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0';
  
  const num = Math.round(value);
  const isNegative = num < 0;
  const absNumStr = Math.abs(num).toString();
  
  // Agregar puntos para separar miles
  let formatted = absNumStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Si es un millón o más, reemplazar el primer separador (el de los millones) por un apóstrofe
  if (Math.abs(num) >= 1000000) {
    formatted = formatted.replace('.', "'"); 
  }

  return `${isNegative ? '-' : ''}$${formatted}`;
};
