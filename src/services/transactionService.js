import { supabase } from './supabaseClient';

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
  return data;
};

export const addTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        type: transactionData.type,
        amount: parseFloat(transactionData.amount),
        category: transactionData.category,
        description: transactionData.description || ''
      }
    ])
    .select();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
  return data[0];
};
