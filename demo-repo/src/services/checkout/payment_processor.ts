/**
 * PaymentProcessor — orchestrates checkout payments.
 *
 * Downstream consumer of CurrencyService.
 * NOTE: This file is NOT modified in the feature PR.
 */

import { CurrencyService } from "../currency_service";

export interface CheckoutPayload {
  amount: number;
  currency: string;
  targetCurrency: string;
  customerId: string;
}

export interface PaymentResult {
  success: boolean;
  convertedAmount: number;
  transactionId: string;
}

export class PaymentProcessor {
  private currencyService = new CurrencyService();

  async processCheckout(payload: CheckoutPayload): Promise<PaymentResult> {
    const { amount, currency, targetCurrency, customerId } = payload;

    // Uses string-based getRate — compatible with original CurrencyService signature
    const rateInfo = await this.currencyService.getRate(currency, targetCurrency);
    const convertedAmount = amount * rateInfo.rate;

    return {
      success: true,
      convertedAmount,
      transactionId: `txn_${customerId}_${Date.now()}`,
    };
  }
}
