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

export interface UserRef {
  id: number;
  name: string;
  avatar: string | null;
  email: string | null;
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

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export async function getCurrentUserId(supabase: SupabaseClient): Promise<number | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("users").select("id").eq("auth_id", user.id).single();
  return data?.id ?? null;
}

export async function getUsersByIds(supabase: SupabaseClient, ids: number[]): Promise<Map<number, UserRef>> {
  const map = new Map<number, UserRef>();
  if (ids.length === 0) return map;
  const { data } = await supabase
    .from("users")
    .select("id, full_name, username, email, avatar_url")
    .in("id", ids);
  for (const row of data ?? []) {
    map.set(row.id, {
      id: row.id,
      name: row.full_name || row.username || (row.email ? row.email.split("@")[0] : "User"),
      avatar: row.avatar_url,
      email: row.email,
    });
  }
  return map;
}

export async function isGroupMember(supabase: SupabaseClient, groupId: number, userId: number): Promise<boolean> {
  const { data } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function getGroupMemberIds(supabase: SupabaseClient, groupId: number): Promise<number[]> {
  const { data } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId);
  return (data ?? []).map((r) => r.user_id).filter((id): id is number => id != null);
}

export async function getGroupMembersWithInfo(supabase: SupabaseClient, groupId: number) {
  const ids = await getGroupMemberIds(supabase, groupId);
  const users = await getUsersByIds(supabase, ids);
  return ids.map((id) => users.get(id)).filter((u): u is UserRef => !!u);
}

export async function fetchGroupExpenses(supabase: SupabaseClient, groupId: number) {
  const { data } = await supabase
    .from("expenses")
    .select(`
      id,
      group_id,
      description,
      value_amout,
      category,
      img_url,
      created_at,
      created_by,
      paid_by ( user_id, tot_paid ),
      expense_split ( user_id, amount_owed )
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchGroupSettlements(supabase: SupabaseClient, groupId: number) {
  const { data } = await supabase
    .from("settlements")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchSettlementsBetween(supabase: SupabaseClient, a: number, b: number) {
  const { data } = await supabase
    .from("settlements")
    .select("*")
    .or(`and(payer_id.eq.${a},payee_id.eq.${b}),and(payer_id.eq.${b},payee_id.eq.${a})`)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// balance(group) for a single user: (paid) - (owed) + sent - received
export async function computeUserGroupBalance(supabase: SupabaseClient, userId: number, groupId: number): Promise<number> {
  const expenses = await fetchGroupExpenses(supabase, groupId);
  const settlements = await fetchGroupSettlements(supabase, groupId);
  let balance = 0;
  for (const e of expenses) {
    for (const p of e.paid_by ?? []) if (p.user_id === userId) balance += Number(p.tot_paid) || 0;
    for (const s of e.expense_split ?? []) if (s.user_id === userId) balance -= Number(s.amount_owed) || 0;
  }
  for (const s of settlements) {
    if (s.payer_id === userId) balance += Number(s.amount) || 0;
    if (s.payee_id === userId) balance -= Number(s.amount) || 0;
  }
  return Math.round(balance * 100) / 100;
}

export async function computeGroupBalances(supabase: SupabaseClient, groupId: number): Promise<Map<number, number>> {
  const expenses = await fetchGroupExpenses(supabase, groupId);
  const settlements = await fetchGroupSettlements(supabase, groupId);
  const balances = new Map<number, number>();
  const add = (id: number, v: number) => balances.set(id, Math.round(((balances.get(id) ?? 0) + v) * 100) / 100);
  for (const e of expenses) {
    for (const p of e.paid_by ?? []) add(p.user_id, Number(p.tot_paid) || 0);
    for (const s of e.expense_split ?? []) add(s.user_id, -(Number(s.amount_owed) || 0));
  }
  for (const s of settlements) {
    add(s.payer_id, Number(s.amount) || 0);
    add(s.payee_id, -(Number(s.amount) || 0));
  }
  return balances;
}

// net balance between two users: positive means `other` owes `me`
export function computePairwiseFromData(
  expenses: any[],
  settlements: any[],
  me: number,
  other: number
): number {
  let friendOwesMe = 0;
  let iOweFriend = 0;
  for (const e of expenses) {
    const paidBy = (e.paid_by ?? [])[0];
    const splits = e.expense_split ?? [];
    if (paidBy?.user_id === me) {
      const theirs = splits.find((s: any) => s.user_id === other);
      if (theirs) friendOwesMe += Number(theirs.amount_owed) || 0;
    } else if (paidBy?.user_id === other) {
      const mine = splits.find((s: any) => s.user_id === me);
      if (mine) iOweFriend += Number(mine.amount_owed) || 0;
    }
  }

  let received = 0;
  let sent = 0;
  for (const s of settlements) {
    if ((s.payer_id === me && s.payee_id === other) || (s.payer_id === other && s.payee_id === me)) {
      if (s.payee_id === me) received += Number(s.amount) || 0;
      if (s.payer_id === me) sent += Number(s.amount) || 0;
    }
  }

  return Math.round((friendOwesMe - iOweFriend - received + sent) * 100) / 100;
}

export async function computePairwiseBalance(
  supabase: SupabaseClient,
  me: number,
  other: number,
  groupId?: number | null
): Promise<number> {
  let expenses: any[] = [];
  if (groupId) {
    expenses = await fetchGroupExpenses(supabase, groupId);
  } else {
    const groupIds = await getUserGroupIds(supabase, me);
    if (groupIds.length > 0) {
      const { data } = await supabase
        .from("expenses")
        .select("group_id, paid_by ( user_id, tot_paid ), expense_split ( user_id, amount_owed )")
        .in("group_id", groupIds);
      expenses = data ?? [];
    }
  }

  let between: any[] = [];
  if (groupId) {
    between = (await fetchGroupSettlements(supabase, groupId)).filter(
      (s: any) => (s.payer_id === me && s.payee_id === other) || (s.payer_id === other && s.payee_id === me)
    );
  } else {
    between = await fetchSettlementsBetween(supabase, me, other);
  }

  return computePairwiseFromData(expenses, between, me, other);
}

export async function getUserGroupIds(supabase: SupabaseClient, userId: number): Promise<number[]> {
  const { data } = await supabase.from("group_members").select("group_id").eq("user_id", userId);
  return (data ?? []).map((r) => r.group_id).filter((id): id is number => id != null);
}

// find a private 2-person group shared by the two users, if one exists
export async function findDirectGroup(supabase: SupabaseClient, me: number, friendId: number): Promise<number | null> {
  const myGroupIds = await getUserGroupIds(supabase, me);
  for (const gid of myGroupIds) {
    const ids = await getGroupMemberIds(supabase, gid);
    if (ids.length === 2 && ids.includes(friendId) && ids.includes(me)) return gid;
  }
  return null;
}

export async function getUserName(supabase: SupabaseClient, userId: number): Promise<string> {
  const { data } = await supabase
    .from("users")
    .select("full_name, username, email")
    .eq("id", userId)
    .single();
  if (!data) return "User";
  return data.full_name || data.username || (data.email ? data.email.split("@")[0] : "User");
}

// log an event to activity_log as the given actor
export async function logActivity(
  supabase: SupabaseClient,
  actorId: number,
  eventType: string,
  groupId: number | null,
  payload: Record<string, unknown> = {}
) {
  await supabase.from("activity_log").insert({
    actor_id: actorId,
    event_type: eventType,
    group_id: groupId,
    payload,
  });
}
