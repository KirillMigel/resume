import { supabase } from "@/lib/supabase/server";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "canceled" | "refunded";
export type PaymentSystem = "yookassa" | "stripe" | "cloudpayments";

export type Payment = {
  id: string;
  user_id: string;
  resume_id: string;
  amount: number; // в копейках
  currency: string;
  status: PaymentStatus;
  payment_system: PaymentSystem;
  payment_id: string | null;
  payment_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  succeeded_at: string | null;
};

export type CreatePaymentInput = {
  resumeId: string;
  userId: string;
  amount: number;
  paymentSystem: PaymentSystem;
  paymentId: string;
  paymentUrl?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Создает новый платеж
 */
export const createPayment = async (input: CreatePaymentInput): Promise<string> => {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: input.userId,
      resume_id: input.resumeId,
      amount: input.amount,
      currency: "RUB",
      status: "pending",
      payment_system: input.paymentSystem,
      payment_id: input.paymentId,
      payment_url: input.paymentUrl || null,
      metadata: input.metadata || {},
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
};

/**
 * Получает платеж по ID
 */
export const getPayment = async (id: string, userId?: string): Promise<Payment | null> => {
  let query = supabase.from("payments").select("*").eq("id", id);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();
  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as Payment;
};

/**
 * Получает платеж по payment_id (ID в платежной системе)
 */
export const getPaymentByPaymentId = async (
  paymentId: string,
  paymentSystem: PaymentSystem
): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("payment_id", paymentId)
    .eq("payment_system", paymentSystem)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as Payment;
};

/**
 * Получает платеж для резюме
 */
export const getPaymentByResumeId = async (
  resumeId: string,
  userId?: string
): Promise<Payment | null> => {
  let query = supabase
    .from("payments")
    .select("*")
    .eq("resume_id", resumeId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as Payment;
};

/**
 * Обновляет статус платежа
 */
export const updatePaymentStatus = async (
  id: string,
  status: PaymentStatus,
  metadata?: Record<string, unknown>
): Promise<void> => {
  const updateData: {
    status: PaymentStatus;
    succeeded_at?: string;
    metadata?: Record<string, unknown>;
  } = {
    status,
  };

  if (status === "succeeded") {
    updateData.succeeded_at = new Date().toISOString();
  }

  if (metadata) {
    updateData.metadata = metadata;
  }

  const { error } = await supabase.from("payments").update(updateData).eq("id", id);

  if (error) throw error;
};

/**
 * Проверяет, оплачено ли резюме
 */
export const isResumePaid = async (resumeId: string, userId?: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("resumes")
    .select("is_paid")
    .eq("id", resumeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return false; // Not found
    throw error;
  }

  // Дополнительная проверка прав доступа
  if (userId && data && (data as { user_id: string }).user_id !== userId) {
    return false;
  }

  return (data as { is_paid: boolean }).is_paid ?? false;
};

/**
 * Получает все платежи пользователя
 */
export const getUserPayments = async (userId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Payment[]) ?? [];
};

