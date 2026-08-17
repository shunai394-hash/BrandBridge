/**
 * Manual X tweet delete for smoke tests. Not part of Marketing Agent production flow.
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

const oauth = new OAuth({
  consumer: {
    key: get("X_API_KEY"),
    secret: get("X_API_SECRET"),
  },
  signature_method: "HMAC-SHA1",
  hash_function(baseString, key) {
    return crypto.createHmac("sha1", key).update(baseString).digest("base64");
  },
});

const url = "https://api.x.com/2/tweets/2089118052738826297";

const auth = oauth.authorize(
  { url, method: "DELETE" },
  {
    key: get("X_ACCESS_TOKEN"),
    secret: get("X_ACCESS_TOKEN_SECRET"),
  },
);

const response = await fetch(url, {
  method: "DELETE",
  headers: oauth.toHeader(auth),
});

console.log("HTTP:", response.status);
console.log(await response.text());
