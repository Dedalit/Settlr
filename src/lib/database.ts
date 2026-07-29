import type { SupabaseClient } from "@supabase/supabase-js";

interface CreateExpenseParams {
  groupId: number;          
  createdBy: number;        
  description: string;      
  valueAmount: number;      
  imgUrl?: string;          
  paidByUserId: number;     
  paidTotal: number;        
  splitUserId: number;      
  amountOwed: number;       
}

// 1. Funzione master per aggiungere una spesa
export async function createExpenseTransaction(supabase: SupabaseClient, params: CreateExpenseParams) {
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .insert([
      {
        group_id: params.groupId,
        created_by: params.createdBy,
        description: params.description,
        value_amout: params.valueAmount,
        img_url: params.imgUrl || null,
      },
    ])
    .select()
    .single();

  if (expenseError || !expenseData) {
    console.error("Errore inserimento expenses:", expenseError);
    return { success: false, error: expenseError };
  }

  const expenseId = expenseData.id;

  const { error: paidError } = await supabase
    .from("paid_by")
    .insert([
      {
        expense_id: expenseId,
        user_id: params.paidByUserId,
        group_id: params.groupId,
        tot_paid: params.paidTotal,
      },
    ]);

  if (paidError) {
    console.error("Errore inserimento paid_by:", paidError);
    return { success: false, error: paidError };
  }

  const { error: splitError } = await supabase
    .from("expense_split")
    .insert([
      {
        expense_id: expenseId,
        user_id: params.splitUserId,
        amount_owed: params.amountOwed,
      },
    ]);

  if (splitError) {
    console.error("Errore inserimento expense_split:", splitError);
    return { success: false, error: splitError };
  }

  return { success: true, expenseId };
}

// 2. Funzione per le attività recenti
export async function getRecentActivities(supabase: SupabaseClient, groupId?: number) {
  let query = supabase
    .from("expenses")
    .select(`
      id,
      description,
      value_amout,
      created_at,
      groups ( group_name ),
      users:created_by ( full_name )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  if (groupId) {
    query = query.eq("group_id", groupId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Errore recupero attività recenti:", error);
    return [];
  }

  return data;
}

// 3. Funzione per i gruppi utente
export async function getUserGroups(supabase: SupabaseClient, userId: number) {
  const { data, error } = await supabase
    .from("group_members")
    .select(`
      groups (
        id,
        group_name,
        created_at
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Errore recupero gruppi utente:", error);
    return [];
  }

  return data.map((item: any) => item.groups).filter(Boolean);
}