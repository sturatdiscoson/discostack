export type BankrollAdjustment = {
  id: string;
  date: string;
  amount: number;
  type: "deposit" | "withdrawal";
  note: string | null;
  created_at: string;
};
