import { calculateGst } from "@/lib/gst";
import { Separator } from "@/components/ui/separator";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function GstBreakdown({ basePaise }: { basePaise: number }) {
  const { cgstPaise, sgstPaise, igstPaise, totalPaise } =
    calculateGst(basePaise);

  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Base price</span>
        <span>{formatRupees(basePaise)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">CGST (9%)</span>
        <span>{formatRupees(cgstPaise)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">SGST (9%)</span>
        <span>{formatRupees(sgstPaise)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">IGST (0%)</span>
        <span>{formatRupees(igstPaise)}</span>
      </div>
      <Separator className="my-1" />
      <div className="flex justify-between font-semibold">
        <span>Total payable</span>
        <span>{formatRupees(totalPaise)}</span>
      </div>
    </div>
  );
}
