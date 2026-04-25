"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

import { Input } from "@/components/ui/input";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function amortizationSchedule(totalSpend: number, years: number) {
  const firstAndLastRate = 1 / (2 * years);
  const middleRate = 1 / years;

  return Array.from({ length: years + 1 }).map((_, index) => {
    const taxYear = index + 1;
    const rate = index === 0 || index === years ? firstAndLastRate : middleRate;
    return {
      taxYear,
      deduction: totalSpend * rate,
    };
  });
}

export function ImpactCalculator() {
  const [domesticSpend, setDomesticSpend] = useState(1_200_000);
  const [foreignSpend, setForeignSpend] = useState(350_000);
  const [taxRate, setTaxRate] = useState(0.30);
  const [discountRate, setDiscountRate] = useState(0.09);

  const model = useMemo(() => {
    const domesticSchedule = amortizationSchedule(domesticSpend, 5);
    const foreignSchedule = amortizationSchedule(foreignSpend, 15);
    const projectedHorizon = 8;

    const blendedAmortization = Array.from({ length: projectedHorizon }).map((_, idx) => {
      const year = idx + 1;
      const domestic = domesticSchedule.find((entry) => entry.taxYear === year)?.deduction ?? 0;
      const foreign = foreignSchedule.find((entry) => entry.taxYear === year)?.deduction ?? 0;
      return {
        year,
        amortizationDeduction: domestic + foreign,
      };
    });

    const firstYearAmortization = blendedAmortization[0]?.amortizationDeduction ?? 0;
    const fullExpensingYearOne = domesticSpend + foreignSpend;
    const yearOneDeductionDelta = fullExpensingYearOne - firstYearAmortization;
    const yearOneCashTaxBenefit = yearOneDeductionDelta * taxRate;

    const annualRows = blendedAmortization.map((row) => {
      const immediateDeduction = row.year === 1 ? fullExpensingYearOne : 0;
      const deductionDelta = immediateDeduction - row.amortizationDeduction;
      const cashTaxDelta = deductionDelta * taxRate;
      const discountFactor = 1 / (1 + discountRate) ** row.year;

      return {
        year: row.year,
        amortizationDeduction: row.amortizationDeduction,
        immediateDeduction,
        deductionDelta,
        cashTaxDelta,
        presentValueCashTaxDelta: cashTaxDelta * discountFactor,
      };
    });

    const netPresentValue = annualRows.reduce(
      (sum, row) => sum + row.presentValueCashTaxDelta,
      0,
    );

    return {
      fullExpensingYearOne,
      firstYearAmortization,
      yearOneDeductionDelta,
      yearOneCashTaxBenefit,
      annualRows,
      netPresentValue,
    };
  }, [discountRate, domesticSpend, foreignSpend, taxRate]);

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-emerald-300" />
        <h2 className="text-xl font-semibold text-slate-100">Impact Calculator</h2>
      </div>

      <p className="mb-5 text-sm text-slate-300">
        Model the cash-tax effect of restoring immediate Section 174 expensing versus the current amortization schedule.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/45 p-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">Domestic R&D Spend</span>
          <Input
            type="number"
            min={0}
            step={25000}
            value={domesticSpend}
            onChange={(event) => setDomesticSpend(Number(event.target.value))}
          />
        </label>

        <label className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/45 p-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">Foreign R&D Spend</span>
          <Input
            type="number"
            min={0}
            step={25000}
            value={foreignSpend}
            onChange={(event) => setForeignSpend(Number(event.target.value))}
          />
        </label>

        <label className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/45 p-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">Marginal Tax Rate</span>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={taxRate}
            onChange={(event) => setTaxRate(Number(event.target.value))}
          />
          <p className="text-xs text-slate-400">Current: {percent(taxRate)}</p>
        </label>

        <label className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/45 p-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">Discount Rate</span>
          <Input
            type="number"
            min={0}
            max={0.4}
            step={0.01}
            value={discountRate}
            onChange={(event) => setDiscountRate(Number(event.target.value))}
          />
          <p className="text-xs text-slate-400">Current: {percent(discountRate)}</p>
        </label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-700 bg-slate-950/45 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Immediate Year-1 Deduction</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{currency(model.fullExpensingYearOne)}</p>
        </article>

        <article className="rounded-lg border border-slate-700 bg-slate-950/45 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current-Law Year-1 Deduction</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{currency(model.firstYearAmortization)}</p>
        </article>

        <article className="rounded-lg border border-cyan-900/70 bg-cyan-950/25 p-3">
          <p className="text-xs uppercase tracking-wide text-cyan-200">Year-1 Cash-Tax Benefit if Restored</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-100">{currency(model.yearOneCashTaxBenefit)}</p>
          <p className="mt-1 text-xs text-cyan-200/90">
            Deduction delta: {currency(model.yearOneDeductionDelta)}
          </p>
        </article>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-700/70">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="bg-slate-900/90 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Tax Year</th>
              <th className="px-3 py-2 text-right font-medium">Amortization Deduction</th>
              <th className="px-3 py-2 text-right font-medium">Immediate Expensing</th>
              <th className="px-3 py-2 text-right font-medium">Cash-Tax Delta</th>
            </tr>
          </thead>
          <tbody>
            {model.annualRows.map((row) => (
              <tr key={row.year} className="border-t border-slate-800 text-slate-200">
                <td className="px-3 py-2">Year {row.year}</td>
                <td className="px-3 py-2 text-right">{currency(row.amortizationDeduction)}</td>
                <td className="px-3 py-2 text-right">{currency(row.immediateDeduction)}</td>
                <td className="px-3 py-2 text-right">{currency(row.cashTaxDelta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-slate-300">
        8-year net present value of cash-tax timing difference: <span className="font-semibold text-cyan-200">{currency(model.netPresentValue)}</span>
      </p>
    </section>
  );
}
