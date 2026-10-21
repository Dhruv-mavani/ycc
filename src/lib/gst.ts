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

/**
 * Same as calculateGst, but returns a flat, tax-free breakdown when
 * `exempt` is true — for events (see events.gst_exempt) where fee_paise IS
 * the total charged, with no CGST/SGST/IGST added on top.
 */
export function applyGst(basePaise: number, exempt: boolean): GstBreakdown {
  if (exempt) {
    return { basePaise, cgstPaise: 0, sgstPaise: 0, igstPaise: 0, totalPaise: basePaise };
  }
  return calculateGst(basePaise);
}
