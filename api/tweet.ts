import { NowRequest, NowResponse } from "@vercel/node";
import { TwitterClient } from "twitter-api-client";

export default (req: NowRequest, res: NowResponse) => {
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
    t.tweets
      .statusesUpdate({ status: "hello from twitter api" })
      .then((v) => {
        res.status(200).send(`${v.created_at}: ${v.text}`);
      })
      .catch((err) => res.status(500).send(err));
  }
  res.end();
};
