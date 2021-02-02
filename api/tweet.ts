import { NowRequest, NowResponse } from "@vercel/node";
import { TwitterClient } from "twitter-api-client";
import get, { AxiosResponse } from "axios";
import { subHours } from "date-fns";

const ARSAT = "https://arsat.vercel.app/api";

interface Price {
  date: Date;
  value: number;
}

function prices(res: AxiosResponse<any>): Price[] {
  return res.data.map((p: any) => {
    const price: Price = {
      date: new Date(p.date),
      value: p.v,
    };
    return price;
  });
}

function fixed(n: number): String {
  return n.toLocaleString("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async (req: NowRequest, res: NowResponse) => {
  const { ats, at, aks, ak } = req.query;
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
    const t = new TwitterClient({
      apiKey: ak,
      apiSecret: aks,
      accessToken: at,
      accessTokenSecret: ats,
    });

    let lastHour = subHours(Date.now(), 1);
    const btc: Price[] = await get(
      `${ARSAT}/prices/btcars?from=${lastHour.getTime()}`
    )
      .then((res) => prices(res))
      .catch((err) => {
        res.status(500).send(err);
        return [];
      });
    const price = btc[btc.length - 1].value;
    const arsat = 1 / (price / Math.pow(10, 8));
    const tweet = `El #Bitcoin está a $${fixed(
      Math.abs(price)
    )}.\nEs decir, un peso equivale a ${arsat} satoshis.`;

    t.tweets
      .statusesUpdate({ status: tweet })
      .then((v) => {
        res.status(200).send(`${v.created_at}: ${v.text}`);
      })
      .catch((err) => res.status(500).send(err));
  } else res.status(500).end();
};
