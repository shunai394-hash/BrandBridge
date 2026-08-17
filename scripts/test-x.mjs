/**
 * Manual X auth check (GET /2/users/me). Not part of Marketing Agent production flow.
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

for (const [name, value] of Object.entries({
  X_API_KEY: apiKey,
  X_API_SECRET: apiSecret,
  X_ACCESS_TOKEN: accessToken,
  X_ACCESS_TOKEN_SECRET: accessTokenSecret,
})) {
  console.log(`${name}: ${value ? "SET" : "MISSING"}`);
}

if ([apiKey, apiSecret, accessToken, accessTokenSecret].some((v) => !v)) {
  process.exit(1);
}

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

const url = "https://api.x.com/2/users/me";

const auth = oauth.authorize(
  { url, method: "GET" },
  {
    key: accessToken,
    secret: accessTokenSecret,
  },
);

const response = await fetch(url, {
  headers: oauth.toHeader(auth),
});

console.log("HTTP:", response.status);
console.log(await response.text());
