import BigNumber from "bignumber.js";

const delay = (s) => {
  return new Promise((res) => setTimeout(res, s * 1000));
};

import { getTronweb, keyQuery } from "./tronWebService";
import { rentResource } from "./resorceRentService";

const normalizarNumero = (n, s = 6) => {
  return new BigNumber(n).shiftedBy(-s).toNumber();
};

const numberToStringCero = (n, s = 6) => {
  return new BigNumber(n).shiftedBy(s).dp(0).toString(10);
};

export default {
  keyQuery,
  getTronweb,
  delay,
  rentResource,
  normalizarNumero,
  numberToStringCero,
};
