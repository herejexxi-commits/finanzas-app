import { supabase } from './supabaseClient';

export const getInitialBalance = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return 0; // Or whatever default is needed

  const { data, error } = await supabase
    .from('settings')
    .select('initial_balance')
    .eq('id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" which is fine if they haven't set it yet
    console.error('Error fetching initial balance:', error);
    return 0;
  }
  
  return data ? parseFloat(data.initial_balance) : 0;
};

export const updateInitialBalance = async (amount) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('settings')
    .upsert([
      { 
        id: session.user.id, 
        initial_balance: parseFloat(amount) 
      }
    ])
    .select();

  if (error) {
    console.error('Error updating initial balance:', error);
    throw error;
  }
  
  return data[0];
};

export const getGeminiApiKey = () => {
  return localStorage.getItem('geminiApiKey') || '';
};

export const saveGeminiApiKey = (key) => {
  localStorage.setItem('geminiApiKey', key);
};
