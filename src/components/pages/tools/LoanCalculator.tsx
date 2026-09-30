"use client";
import { useMemo, useState } from "react";
import ToolCard from "@/components/tools/ToolCard";
import { NumberField } from "@/components/tools/fields";
import { Stat, StatGrid } from "@/components/tools/stats";

const money = (n: number, digits = 2) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : "—";

type YearRow = { year: number; principal: number; interest: number; balance: number };

function amortize(principal: number, annualRate: number, months: number, extra: number) {
  const r = annualRate / 100 / 12;
  const payment = r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
  const years: YearRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let month = 0;
  while (balance > 0.005 && month < months) {
    const interest = balance * r;
    const paid = Math.min(balance, payment + extra - interest);
    balance -= paid;
    totalInterest += interest;
    const year = Math.floor(month / 12);
    years[year] ??= { year: year + 1, principal: 0, interest: 0, balance: 0 };
    years[year].principal += paid;
    years[year].interest += interest;
    years[year].balance = Math.max(0, balance);
    month++;
  }
  return { payment, totalInterest, months: month, years };
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState("300000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [extra, setExtra] = useState("0");

  const principal = Number(amount);
  const months = Math.round(Number(years) * 12);
  const valid = principal > 0 && months > 0 && Number(rate) >= 0;

  const result = useMemo(
    () => (valid ? amortize(principal, Number(rate), months, Number(extra) || 0) : null),
    [valid, principal, rate, months, extra],
  );

  const totalPaid = result ? principal + result.totalInterest : 0;
  const interestShare = result ? (result.totalInterest / totalPaid) * 100 : 0;

  return (
    <ToolCard className="max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Loan amount" value={amount} onChange={setAmount} min={0} />
        <NumberField label="Interest rate" value={rate} onChange={setRate} suffix="% per year" min={0} step={0.01} />
        <NumberField label="Loan term" value={years} onChange={setYears} suffix="years" min={0} />
        <NumberField label="Extra payment" value={extra} onChange={setExtra} suffix="per month" min={0} hint="Optional. Paying extra saves interest." />
      </div>

      {result && (
        <>
          <StatGrid>
            <Stat label="Monthly payment" value={money(result.payment + (Number(extra) || 0))} className="border-primary bg-primary/10" />
            <Stat label="Total interest" value={money(result.totalInterest, 0)} />
            <Stat label="Total paid" value={money(totalPaid, 0)} />
            <Stat
              label="Paid off in"
              value={`${Math.floor(result.months / 12)}y ${result.months % 12}m`}
            />
          </StatGrid>

          <div className="space-y-1">
            <div className="flex h-3 overflow-hidden rounded-full">
              <div className="bg-primary" style={{ width: `${100 - interestShare}%` }} />
              <div className="bg-orange-400" style={{ width: `${interestShare}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Principal {Math.round(100 - interestShare)}%</span>
              <span>Interest {Math.round(interestShare)}%</span>
            </div>
          </div>

          <div className="max-h-96 overflow-auto rounded-lg border">
            <table className="w-full text-sm tabular-nums">
              <thead className="sticky top-0 bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2 text-right">Principal</th>
                  <th className="px-3 py-2 text-right">Interest</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.years.map((row) => (
                  <tr key={row.year}>
                    <td className="px-3 py-1.5">{row.year}</td>
                    <td className="px-3 py-1.5 text-right">{money(row.principal, 0)}</td>
                    <td className="px-3 py-1.5 text-right">{money(row.interest, 0)}</td>
                    <td className="px-3 py-1.5 text-right">{money(row.balance, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ToolCard>
  );
}
