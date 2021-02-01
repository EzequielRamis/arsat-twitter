import { NowRequest, NowResponse } from "@vercel/node";
// import { TwitterClient } from "twitter-api-client";

export default (req: NowRequest, res: NowResponse) => {
  const { ats, at, b, aks, ak } = req.query;
  const {
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN,
    BEARER,
    API_KEY_SECRET,
    API_KEY,
  } = process.env;
  const str = `${ats} ${ACCESS_TOKEN_SECRET} \n ${at} ${ACCESS_TOKEN} \n ${b} ${BEARER} \n ${aks} ${API_KEY_SECRET} \n ${ak} ${API_KEY}`;
  res.send(str);
};
