/**
 * Manual X API smoke test. Not part of Marketing Agent production flow.
 * Do not import from app/ or lib/social/.
 */
import OAuth from "oauth-1.0a";
import crypto from "node:crypto";
import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf8");
const get = (name) => {
  const m = env.match(new RegExp("^" + name + "=(.*)$", "m"));
  return m ? m[1].trim() : "";
};

const apiKey = get("X_API_KEY");
const apiSecret = get("X_API_SECRET");
const accessToken = get("X_ACCESS_TOKEN");
const accessTokenSecret = get("X_ACCESS_TOKEN_SECRET");

const oauth = new OAuth({
  consumer: {
    key: apiKey,
    secret: apiSecret,
  },
  signature_method: "HMAC-SHA1",
  hash_function(baseString, key) {
    return crypto
      .createHmac("sha1", key)
      .update(baseString)
      .digest("base64");
  },
});

const url = "https://api.x.com/2/tweets";

const auth = oauth.authorize(
  { url, method: "POST" },
  {
    key: accessToken,
    secret: accessTokenSecret,
  },
);

const response = await fetch(url, {
  method: "POST",
  headers: {
    ...oauth.toHeader(auth),
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "BrandBridge API connection test.",
  }),
});

console.log("HTTP:", response.status);
console.log(await response.text());
