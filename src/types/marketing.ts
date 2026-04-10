/**
 * BPlen HUB — Marketing & Enrollment Types 🎟️💸
 * Estrutura para cupons de desconto e ofertas estratégicas.
 */

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string; // Ex: BPLEN20
  type: DiscountType;
  value: number; // Porcentagem ou Valor fixo
  
  description?: string;
  
  // Regras de Validação
  active: boolean;
  expiryDate?: string; // ISO String
  usageLimit?: number; // Máximo de usos globais
  usageCount: number;
  
  // Regras de Segmentação
  restrictedToProducts?: string[]; // IDs/Slugs de produtos específicos
  minPurchaseValue?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discountAmount: number;
  finalPrice: number;
  message?: string;
  coupon?: Partial<Coupon>;
}
