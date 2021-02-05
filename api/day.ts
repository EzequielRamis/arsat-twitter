import { NowRequest, NowResponse } from "@vercel/node";
import get from "axios";
import { subDays } from "date-fns";
import { Price, ARSAT, prices, fixed, tokens, satoshis, phrase } from "./utils";

export default async (req: NowRequest, res: NowResponse) => {
  const now = new Date();
  if (now.getUTCDate() !== 1) {
    let access = tokens(req.query);
    if (access.valid) {
      const t = access.twitter;

      const f = subDays(now, 1).getTime();
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
      const tweet = `Con un #DólarBlue 💸 a $${fixed(
        usd[0].value
      )}, el #Bitcoin ${text}, cerrando el día a $${fixed(to)}.\n\n${satoshis(
        to
      )}`;

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
        `${now.getTime()}: Es el primer día del mes, por lo que no se devuelve el tweet diario.`
      );
};
