import { NowRequest, NowResponse } from "@vercel/node";
import get from "axios";
import { Price, ARSAT, prices, fixed, tokens, satoshis } from "./utils";

export default async (req: NowRequest, res: NowResponse) => {
  let access = tokens(req.query);
  if (access.valid) {
    const t = access.twitter;
    const btc: Price[] = await get(`${ARSAT}/prices/btcars`)
      .then((res) => prices(res))
      .catch((err) => {
        res.status(500).send(err);
        return [];
      });

    const price = btc[0].value;
    const tweet = `El #Bitcoin se encuentra en $${fixed(price)}.\n\n${satoshis(
      price
    )}`;

    t.tweets
      .statusesUpdate({ status: tweet })
      .then((v) => {
        res.status(200).send(`${new Date(v.created_at).getTime()}: ${v.text}`);
      })
      .catch((err) => res.status(500).send(err));
  } else res.status(500).end();
};
