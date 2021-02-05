import { NowRequest, NowResponse } from "@vercel/node";
import get from "axios";
import { subMonths } from "date-fns";
import { Price, ARSAT, prices, fixed, tokens, satoshis, phrase } from "./utils";

export default async (req: NowRequest, res: NowResponse) => {
  const now = new Date();
  const month = now.getUTCMonth();
  if (month != 6 && month != 0) {
    let access = tokens(req.query);
    if (access.valid) {
      const t = access.twitter;

      const f = subMonths(now, 1).getTime();
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
      const tweet = `En este último mes, con un #DólarBlue 💸 llegando a $${fixed(
        usd[0].value
      )}, el #Bitcoin ${text}, cerrando a $${fixed(to)}.\n\n${satoshis(to)}`;

      t.tweets
        .statusesUpdate({ status: tweet })
        .then((v) => {
          res
            .status(200)
            .send(`${new Date(v.created_at).getTime()}: ${v.text}`);
        })
        .catch((err) => res.status(500).send(err));
    } else res.status(500).end();
  } else
    res
      .status(200)
      .send(
        `${now.getTime()}: Es el primer día del semestre, por lo que no se devuelve el tweet mensual.`
      );
};
