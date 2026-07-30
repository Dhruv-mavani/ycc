// GST is applied on top of the listed base price at payment time — the
// prices shown on event listings (₹3000, ₹10, etc.) are base/pre-tax
// amounts. IGST is 0% (intra-state), CGST + SGST are 9% each (18% total).
export const CGST_RATE = 0.09;
export const SGST_RATE = 0.09;
export const IGST_RATE = 0;
export const GST_RATE = CGST_RATE + SGST_RATE + IGST_RATE;

export interface GstBreakdown {
  basePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

/** Computes the GST breakdown for a base (pre-tax) amount in paise, rounded so the parts always sum exactly to the total. */
export function calculateGst(basePaise: number): GstBreakdown {
  const cgstPaise = Math.round(basePaise * CGST_RATE);
  const sgstPaise = Math.round(basePaise * SGST_RATE);
  const igstPaise = Math.round(basePaise * IGST_RATE);
  const totalPaise = basePaise + cgstPaise + sgstPaise + igstPaise;
  return { basePaise, cgstPaise, sgstPaise, igstPaise, totalPaise };
}
