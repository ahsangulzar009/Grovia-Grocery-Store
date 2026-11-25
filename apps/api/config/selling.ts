

export const SELL_BY = ["unit", "weight"] as const
export type SellBy = (typeof SELL_BY)[number]

export const WEIGHT_STEPS = [100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000, 10000, 20000] as const
export const MAX_WEIGHT_GRAMS = 20000

export const BASE_WEIGHTS = [100, 200, 250, 400, 500, 750, 1000, 2000, 5000] as const
export const DEFAULT_BASE_WEIGHT = 1000
export const DEFAULT_WEIGHT_OPTIONS = [250, 500, 1000, 2000] as const

export interface SellingFormat {
  sellBy: SellBy;
  baseWeightGrams: number;
  weightOptions: number[];
  sizeOptions: string[];
}

export const DEFAULT_SELLING: SellingFormat = {
  sellBy: "unit",
  baseWeightGrams: DEFAULT_BASE_WEIGHT,
  weightOptions: [],
  sizeOptions: []
}

export function isSellBy(value: unknown): value is SellBy {
  return typeof value === 'string' && (SELL_BY as readonly string[]).includes(value)
}

export function formatGrams(grams: number): string {
  if (!Number.isFinite(grams) || grams <= 0) return ""
  if (grams === 500) return "1/2 kg";
  if (grams < 1000) return `${grams} g`
  const kg = grams / 1000
  return `${Number.isInteger(kg) ? kg : kg.toFixed(kg * 10 === Math.round(kg * 10) ? 1 : 2)} kg`
}

const round2 = (n: number): number => Math.round(n * 100) / 100

export function optionPrice(price: number, baseWeightGrams: number, grams: number): number {
  if (!baseWeightGrams || baseWeightGrams <= 0) return round2(price)
  return round2((price * grams) / baseWeightGrams);
}

export function stockUnitsFor(grams: number, baseWeightGrams: number): number {
  if (!baseWeightGrams || baseWeightGrams <= 0) return 1;
  return Math.round((grams / baseWeightGrams) * 10000) / 10000
}

function gramsList(value: unknown): number[] {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(",") : []
  const grams = raw
    .map((v) => Math.round(Number(v)))
    .filter((g) => Number.isFinite(g) && g > 0 && g <= MAX_WEIGHT_GRAMS)
  return [...new Set(grams)].sort((a, b) => a - b)
}

function labelList(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : typeof value === 'string' ? value.split(",") : []
  const labels = raw.map((v) => String(v ?? "").trim().slice(0, 30)).filter(Boolean)
  return [... new Set(labels)].slice(0, 12)
}

export type SellingParse = {ok: true; format: SellingFormat; unit: string} | {ok: false, message: string}

export function sellingForm(
  body: Record<string, unknown>,
  current: SellingFormat & {unit?: string} = DEFAULT_SELLING
): SellingParse{
  const sellBy  = isSellBy(body.sellBy) ? body.sellBy : current.sellBy

  if(sellBy==='weight'){
    const rawBase = body.baseWeightGrams === undefined ? current.baseWeightGrams: Math.round(Number(body.baseWeightGrams))
    const baseWeightGrams = (BASE_WEIGHTS as readonly number[]).includes(rawBase) ? rawBase: DEFAULT_BASE_WEIGHT
    const requested = body.weightOptions === undefined ? current.weightOptions : gramsList(body.weightOptions)
    const weightOptions = requested.filter((g)=>(WEIGHT_STEPS as readonly number[]).includes(g))
    const options = weightOptions.length > 0 ? weightOptions : [...DEFAULT_WEIGHT_OPTIONS]
    if(body.weightOptions !==undefined && requested.length > 0 && weightOptions.length === 0){
      return {ok: false, message: `Weight options must be one of ${WEIGHT_STEPS.map(formatGrams).join(", ")}`}
    }

     return {
      ok: true,
      format: {sellBy, baseWeightGrams, weightOptions: options, sizeOptions:[]},
      unit: `per ${formatGrams(baseWeightGrams)}`
    }
  }

  const sizeOptions = body.sizeOptions === undefined ? current.sizeOptions : labelList(body.sizeOptions)
  const unit = typeof body.unit === 'string' ? body.unit.trim().slice(0, 60) : (current.unit ?? 'kg')

  return {
    ok: true,
    format: {sellBy: "unit", baseWeightGrams: DEFAULT_BASE_WEIGHT, weightOptions: [], sizeOptions},
    unit
  }

}


export function offersWeight(format: Pick<SellingFormat, "sellBy" | "weightOptions">, grams: number){
  return format.sellBy === 'weight' && format.weightOptions.includes(grams)
}


export function inferSellingFormat(aisle: string, unit: string): SellingFormat & { unit: string } {
  const fresh = /^(fruits?|vegetables?)$/i.test(aisle.trim());

  const packed = /pack|tray|box|net|bunch|punnet|bag|pouch|bulb|melon|each|jar|bottle|d\+s*x*/i.test(aisle); 
  
  if (!fresh || packed) {
    return { ...DEFAULT_SELLING, sizeOptions: [], unit };
  }
 
  const match = unit
    .replace(/^per\s+/i, "")
    .replace(/^%s*kg/i, "500 g")
    .match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/); 
    
  let base = DEFAULT_BASE_WEIGHT;
  
  if (match) {
    const grams = Math.round(Number(match[1]) * (match[2].toLowerCase() === "kg" ? 1000 : 1));
    if ((BASE_WEIGHTS as readonly number[]).includes(grams)) base = grams;
  }

  return {
    sellBy: "weight",
    baseWeightGrams: base,
    weightOptions: [...DEFAULT_WEIGHT_OPTIONS],
    sizeOptions: [],
    unit: `per ${formatGrams(base)}`,
  };
}

