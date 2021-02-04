import { VercelRequestQuery } from "@vercel/node";
import { AxiosResponse } from "axios";
import { TwitterClient } from "twitter-api-client";

export const ARSAT = "https://arsat.vercel.app/api";

export interface Price {
  date: Date;
  value: number;
}

export function prices(res: AxiosResponse<any>): Price[] {
  return res.data.map((p: any) => {
    const price: Price = {
      date: new Date(p.date),
      value: p.value,
    };
    return price;
  });
}

export function fixed(n: number): String {
  return n.toLocaleString("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function tokens(query: VercelRequestQuery) {
  const { ats, at, aks, ak } = query;
  const {
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN,
    API_KEY_SECRET,
    API_KEY,
  } = process.env;
  if (
    ats === ACCESS_TOKEN_SECRET &&
    at === ACCESS_TOKEN &&
    aks === API_KEY_SECRET &&
    ak === API_KEY
  ) {
    return {
      twitter: new TwitterClient({
        apiKey: ak,
        apiSecret: aks,
        accessToken: at,
        accessTokenSecret: ats,
      }),
      valid: true,
    };
  } else
    return {
      twitter: new TwitterClient({ apiKey: "", apiSecret: "" }),
      valid: false,
    };
}

export function satoshis(n: number) {
  const arssat = fixed(1 / (n / Math.pow(10, 8)));
  return `Es decir, un Peso equivale ahora a ${arssat} Satoshis.`;
}

export function phrase(from: number, to: number) {
  const percent = ((to - from) / from) * 100;
  const verb = percent < 0 ? "bajó" : "subió";
  return Math.abs(percent) < 0.5
    ? "se mantuvo"
    : `${verb} ${fixed(Math.abs(percent))}%`;
}
