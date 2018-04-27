import { curlGenerator } from "../src/main";

test("Basic GET", () => {
  const getOptions = {
    pathname: '/api/xrp_idr/ticker',
    hostname: "vip.bitcoin.co.id",
    port: null,
    auth: undefined,
    agent: undefined,
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "axios/0.18.0"
    },
    method: "get",
    protocol: "https:"
  };

  expect(curlGenerator(getOptions)).toEqual(3);
});
