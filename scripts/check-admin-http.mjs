import http from "node:http";

function fetch(path, headers = {}) {
  return new Promise((resolve, reject) => {
    http
      .get(
        {
          hostname: "127.0.0.1",
          port: 3000,
          path,
          headers: { Accept: "text/html,*/*", ...headers },
        },
        (res) => {
          let b = "";
          res.setEncoding("utf8");
          res.on("data", (c) => (b += c));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              loc: res.headers.location || "",
              type: res.headers["content-type"] || "",
              len: b.length,
              body: b,
            }),
          );
        },
      )
      .on("error", reject);
  });
}

const OLD = ["審査待ち案件", "公開中案件", "交渉数", "成約件数", "成約金額合計"];
const NEW = [
  "商品",
  "交渉",
  "手数料",
  "売上",
  "審査待ち商品",
  "公開中商品",
  "data-admin-dashboard",
  "ops-v2",
  "表示区分：商品 / 交渉 / 手数料 / 売上",
];

const cases = [
  ["html-noauth", "/admin", { Accept: "text/html" }],
  [
    "html-probe",
    "/admin",
    { Accept: "text/html", "x-bb-admin-ui-probe": "1" },
  ],
  [
    "html-probe-qs",
    "/admin?bb_ui_probe=1",
    { Accept: "text/html" },
  ],
];

for (const [label, path, headers] of cases) {
  const r = await fetch(path, headers);
  const oldHits = OLD.filter((s) => r.body.includes(s));
  if (r.body.includes("手数料合計") && !r.body.includes("仲介手数料合計")) {
    oldHits.push("手数料合計");
  }
  const newHits = NEW.filter((s) => r.body.includes(s));
  console.log(
    `=== ${label} status=${r.status} loc=${r.loc || "-"} type=${r.type} len=${r.len}`,
  );
  console.log("OLD:", oldHits.length ? oldHits.join(" | ") : "(none)");
  console.log("NEW:", newHits.length ? newHits.join(" | ") : "(none)");
  console.log("");
}
