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
  const payload = {
    type: transactionData.type,
    amount: parseFloat(transactionData.amount),
    category: transactionData.category,
    description: transactionData.description || ''
  };

  if (transactionData.date) {
    payload.created_at = new Date(`${transactionData.date}T12:00:00`).toISOString();
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([payload])
    .select();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
  return data[0];
};

export const getTransactionById = async (id) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
  return data;
};

export const updateTransaction = async (id, transactionData) => {
  const payload = {
    type: transactionData.type,
    amount: parseFloat(transactionData.amount),
    category: transactionData.category,
    description: transactionData.description || ''
  };

  if (transactionData.date) {
    payload.created_at = new Date(`${transactionData.date}T12:00:00`).toISOString();
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
  return data[0];
};

export const deleteTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
  return true;
};

export const deleteAllTransactions = async () => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .not('id', 'is', null);

  if (error) {
    console.error('Error deleting all transactions:', error);
    throw error;
  }
  return true;
};
