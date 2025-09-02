export type Tier = {  
  name: string;
  price: number;
  features: string[];
};

export type UserTier = {
  tierId: string;
  tier: Tier;
  payment: {
    method: "credit_card" | "paypal";
    status: "paid" | "pending" | "failed";
  };
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
};
