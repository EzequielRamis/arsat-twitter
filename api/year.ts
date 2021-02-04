import { NowRequest, NowResponse } from "@vercel/node";
import get from "axios";
import { getYear, subYears } from "date-fns";
import { Price, ARSAT, prices, fixed, tokens, satoshis, phrase } from "./utils";

export default async (req: NowRequest, res: NowResponse) => {
  const now = Date.now();
  const year = getYear(now);
  let access = tokens(req.query);
  if (access.valid) {
    const t = access.twitter;

    const f = subYears(now, 1).getTime();
    const usd: Price[] = await get(`${ARSAT}/prices/usdars`)
      .then((res) => prices(res))
      .catch((err) => {
        res.status(500).send(err);
        return [];
      });
    const btc: Price[] = await get(`${ARSAT}/prices/btcars?from=${f}`)
      .then((res) => prices(res))
      .catch((err) => {
        res.status(500).send(err);
        return [];
      });
    const from = btc[0].value;
    const to = btc[btc.length - 1].value;
    const text = phrase(from, to);
    const tweet = `Para finalizar el ${
      year - 1
    }, con un #DólarBlue 💸 llegando a $${fixed(
      usd[0].value
    )}, el #Bitcoin ${text} desde principios del mismo año, cerrando en estas últimas horas a $${fixed(
      to
    )}.\n\n${satoshis(to)}\n\n¡Feliz ${year} a todos! 🥳🎉`;

    t.tweets
      .statusesUpdate({ status: tweet })
      .then((v) => {
        res.status(200).send(`${new Date(v.created_at).getTime()}: ${v.text}`);
      })
      .catch((err) => res.status(500).send(err));
  } else res.status(500).end();
};
