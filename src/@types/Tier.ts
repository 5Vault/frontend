export type TierType = {  
  id: string;
  name: string;
  cost: number;
  description: {
    en: string;
    pt: string;
  };
  included: [{
    en: string;
    pt: string;
  }];
  
};

export type UserTier = {
  tierId: string;
  tier: TierType;
  payment: {
    method: "credit_card" | "paypal";
    status: "paid" | "pending" | "failed";
  };
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
};
