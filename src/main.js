import monkeypatch from 'monkeypatch';
import http from 'http';
import https from 'https';
import buffer from 'buffer';
import chalk from 'chalk';
/**
 *
 *
 * @export
 * @param {any} options
 * @returns {string}
 */
export function generateMethod(options) {
  const method = options.method;
  if (!method) return '';
  const type = {
    GET: '-X GET',
    POST: '-X POST',
    PUT: '-X PUT',
    PATCH: '-X PATCH',
    DELETE: '-X DELETE',
  };
  const methodParam = type[method.toUpperCase()];
  return methodParam ? methodParam : '';
}

/**
 *
 *
 * @export
 * @param {any} options
 * @returns {string}
 */
export function generateHeader(options) {
  const headers = options.headers;
  let isEncode = false;
  if (!headers) return '';
  let headerParam = '';
  Object.keys(headers).map((val, key) => {
    if (val.toLocaleLowerCase() !== 'content-length') {
      // contents of headers[val] is a <Buffer>, so we need to convert that back to a string
      headerParam += `-H "${val}: ${headers[val].toString('utf8').replace(/(\\|")/g, '\\$1')}" `;
    }
    if (val.toLocaleLowerCase() === 'accept-encoding') {
      isEncode = true;
    }
  });
  return {
    params: headerParam.trim(),
    isEncode,
  };
}

/**
 *
 *
 * @export
 * @param {any} [options={}]
 * @returns {string}
 */
export function generateUrl(options = {}) {
  if (!options) return '';
  var { protocol, hostname, pathname, uri } = options;
  protocol = protocol || uri && uri.protocol || 'http:';
  hostname = hostname || uri && uri.hostname || 'localhost';
  pathname = pathname || uri && uri.pathname || '/';
  return `"${protocol}//${hostname}${pathname}"`;
}

/**
 *
 *
 * @export
 * @param {Object} body
 * @returns {string}
 */
export function generateBody(body) {
  if (!body) return '';
  return `--data-binary ${JSON.stringify(body)}`;
}

/**
 *
 *
 * @export
 * @param {boolean} isEncode
 * @return {string}
 */
export function generateCompress(isEncode) {
  return isEncode ? '--compressed' : '';
}

/**
 *
 *
 * @export
 * @param {any} options
 * @param {string} [body='']
 * @param {any} regex
 */
export function curlGenerator(options, body = '', regex) {
  let result = 'curl ';
  const headers = generateHeader(options);
  const url = generateUrl(options);
  if (regex) {
    let matchTemp = regex;
    if (!Array.isArray(regex)) {
      matchTemp = [regex];
    }
    const isMatchFilter = matchTemp.filter(value => {
      return url.match(value);
    });
    if (isMatchFilter.length === 0) {
      return '';
    }
  }

  result += url + ' ';
  result += generateMethod(options) + ' ';
  result += headers.params + ' ';
  result += generateBody(body) + ' ';
  result += generateCompress(headers.isEncode);
  return result;
}

/**
 *
 *
 * @export
 * @param {any} regex
 * @param {any} request
 * @param {any} options
 * @param {any} cb
 * @returns
 */
export function requestPatch(regex, request, options, cb, customCallback, showOutput) {
  // Note that options may be <Object> | <string> | <URL>
  // https://nodejs.org/api/https.html#https_https_request_url_options_callback
  // How `https` handles the params: https://github.com/nodejs/node/blob/v12.x/lib/https.js#L281

  const bodyData = [];
  const clientReq = request(options, cb);

  monkeypatch(clientReq, 'write', (original, chunk, encoding, cb) => {
    // `chunk` is expected to be <string> | <Buffer>
    // Convert <string> into <Buffer>, because bodyData should be an array of <Buffer>
    // https://nodejs.org/api/http.html#http_request_write_chunk_encoding_callback
    if (typeof chunk === 'string' || chunk instanceof String) {
        chunk = Buffer.from(chunk, 'utf8');
    }
    bodyData.push(chunk);
    return original(chunk, encoding, cb);
  });

  monkeypatch(clientReq, 'end', (original, data, encoding, cb) => {
    let body = '';
    if (data) {
      bodyData.push(data);
    }
    if (bodyData.length > 0) {
      body = Buffer.concat(bodyData).toString();
    }

    const command = curlGenerator(options, body, regex);

    if (showOutput){
      console.log(`${chalk.black.bgYellow.bold(' http-to-curl ')}\n    ${command}\n`);
    }

    customCallback(command);
    return original(data, encoding, cb);
  });
  return clientReq;
}

/**
 *
 *
 * @param {*} options
 */
function httpToCurl(options) {
  monkeyPatchHttp(http, options);
  monkeyPatchHttp(https, options);
}

/**
 *
 *
 * @param {*} httpObject
 * @param {*} { filter = '', customCallback = () => {} }
 */
function monkeyPatchHttp(httpObject, options = {}) {
  monkeypatch(httpObject, 'request', (request, requestOptions, cb) => {
    const { filter = '', customCallback = () => {}, showOutput = true } = options;
    return requestPatch(filter, request, requestOptions, cb, customCallback, showOutput);
  });
}

export default httpToCurl;
