import monkeypatch from "monkeypatch";
import http from "http";
import buffer from "buffer";

function generateMethod(options) {
  const method = options.method;
  if (!method) return "";
  const type = {
    GET: "-XGET",
    POST: "-XPOST",
    PUT: "-XPUT",
    PATCH: "-XPATCH",
    DELETE: "-XDELETE"
  };
  const methodParam = type[method.toUpperCase()];
  return methodParam;
}

function generateHeader(options) {
  const headers = options.headers;
  let isEncode = false;
  if (!headers) return "";
  let headerParam = "";
  Object.keys(headers).map((val, key) => {
    if(val.toLocaleLowerCase() !== 'content-length'){
      headerParam += `-H "${val}: ${headers[val]}" `;
    }
    if (val.toLocaleLowerCase() === 'accept-encoding') {
      isEncode = true
    }
  });
  return {
    params: headerParam.trim(),
    isEncode
  }
}

function generateUrl(options) {
  const { protocol = "http:", hostname, pathname = "" } = options;
  return `"${protocol}//${hostname}${pathname}"`;
}

function generateBody(body) {
  if(!body) return '';
  return `--data-binary ${JSON.stringify(body)}`
}

function generateCompress(isEncode) {
  return isEncode ? '--compressed' : ''
}

export function curlGenerator(options, body = '') {
  let result = "curl ";
  const headers = generateHeader(options);
  result += generateUrl(options) + " ";
  result += generateMethod(options) + " ";
  result += headers.params +" ";
  result += generateBody(body) + " ";
  result += generateCompress(headers.isEncode)
  console.log(result);
}

function requestPatch(request, options, cb) {
  const bodyData = [];
  const clientReq = request(options, cb);

  monkeypatch(clientReq, "write", (original, chunk, encoding, cb) => {
    bodyData.push(chunk);
    return original(chunk, encoding, cb);
  });

  monkeypatch(clientReq, "end", (original, data, encoding, cb) => {
    const body = Buffer.concat(bodyData).toString();
    curlGenerator(options, body);
    return original(data, encoding, cb);
  });
  return clientReq;
}

function httpToCurl(urlRegex = "") {
  monkeypatch(http, "request", requestPatch);
}

export default httpToCurl;
