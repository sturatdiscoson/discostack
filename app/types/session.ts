export type Session = {
  id: string;

  played_on: string;

  venue: string;

  stakes: string;

  buy_in: number;

  cash_out: number;

  profit?: number | null;

  hours: number;

  notes: string | null;

  created_at: string;
};

export type SessionFormData = {
  played_on: string;

  venue: string;

  stakes: string;

  buy_in: number;

  cash_out: number;

  hours: number;

  notes: string;
};