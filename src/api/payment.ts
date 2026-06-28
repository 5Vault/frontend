import { apiPost } from "./client";
import { sessionStore } from "../utils/sessionStore";


const token = () => sessionStore.getUserToken();

export async function createPaymentIntent(
  tierID: string,
  saveCard = false,
): Promise<{ client_secret: string; amount_cents: string }> {
  return apiPost<{ client_secret: string; amount_cents: string }>(
    "/payment/intent",
    { tier_id: tierID, save_card: saveCard },
    { token: token() },
  );
}

export async function saveCardFromIntent(paymentIntentID: string): Promise<void> {
  return apiPost<void>(
    "/payment/save-card-from-intent",
    { payment_intent_id: paymentIntentID },
    { token: token() },
  );
}
