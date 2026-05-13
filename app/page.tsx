"use client";

import { useState } from "react";
import { GradientBackground } from "@/components/gradient-background";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { generatePDF } from "@/components/generatePDF";

type QuotationResult = {
  client_name: string;
  invoice_id: string;
  selling_price_inr: number;
  gross_profit_inr: number;
  message: string;
};

export default function Home() {
  const [clientName, setClientName] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [markupPercentage, setMarkupPercentage] = useState("");
  const [result, setResult] = useState<QuotationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          item_cost_inr: parseFloat(itemCost),
          sales_markup_percentage: parseFloat(markupPercentage),
        }),
      });

      if (!response.ok) throw new Error("Failed to generate quotation");
      const data: QuotationResult = await response.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setClientName("");
    setItemCost("");
    setMarkupPercentage("");
    setResult(null);
    setError("");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 px-4">
      <GradientBackground />
      <div className="absolute inset-0 -z-10 bg-black/20" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-serif text-white text-5xl sm:text-6xl font-normal tracking-tight text-balance leading-tight">
            Quotation Generator
          </h1>
          <p className="text-white/70 mt-3 text-lg">
            Generate professional quotations instantly
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              New Quotation
            </CardTitle>
            <CardDescription className="text-white/60">
              Enter the details below to generate a quotation
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} id="quotation-form">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="client-name" className="text-white/90">
                    Client Name
                  </Label>
                  <Input
                    id="client-name"
                    placeholder="e.g. Tesla"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:border-white/50 focus-visible:ring-white/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="item-cost" className="text-white/90">
                    Item Cost (INR)
                  </Label>
                  <Input
                    id="item-cost"
                    type="number"
                    placeholder="e.g. 1000"
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:border-white/50 focus-visible:ring-white/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="markup" className="text-white/90">
                    Sales Markup (%)
                  </Label>
                  <Input
                    id="markup"
                    type="number"
                    placeholder="e.g. 25"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:border-white/50 focus-visible:ring-white/20"
                  />
                </div>
              </div>
            </form>

            {error && (
              <p className="text-red-300 text-sm mt-4">{error}</p>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              type="submit"
              form="quotation-form"
              disabled={loading}
              className="flex-1 bg-white text-black hover:bg-white/90 font-medium transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Generating...
                </span>
              ) : (
                "Generate Quotation"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="border-white/20 text-black hover:bg-white/10 hover:text-white"
            >
              Reset
            </Button>
          </CardFooter>
        </Card>

        {result && (
          <Card className="mt-6 bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">
                  Quotation Result
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  Generated
                </Badge>
              </div>
              <CardDescription className="text-white/60">
                Invoice: {result.invoice_id}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Client</span>
                  <span className="font-medium">{result.client_name}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Selling Price</span>
                  <span className="font-medium text-lg">
                    ₹{result.selling_price_inr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Gross Profit</span>
                  <span className="font-medium text-emerald-300 text-lg">
                    ₹{result.gross_profit_inr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={() =>
                  generatePDF({
                    client_name: result.client_name,
                    invoice_id: result.invoice_id,
                    item_cost_inr: parseFloat(itemCost),
                    sales_markup_percentage: parseFloat(markupPercentage),
                    selling_price_inr: result.selling_price_inr,
                    gross_profit_inr: result.gross_profit_inr,
                  })
                }
                className="w-full bg-white text-black hover:bg-white/90 font-medium transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Download PDF
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}