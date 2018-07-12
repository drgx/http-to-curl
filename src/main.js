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
      headerParam += `-H "${val}: ${headers[val].replace(/(\\|")/g, '\\$1')}" `;
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
  const { protocol = 'http:', hostname = 'localhost', pathname = '/' } = options;
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
  console.log(`${chalk.black.bgYellow.bold(' http-to-curl ')}
  ${result}
  `);
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
export function requestPatch(regex, request, options, cb, customCallback) {
  const bodyData = [];
  const clientReq = request(options, cb);

  monkeypatch(clientReq, 'write', (original, chunk, encoding, cb) => {
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

    customCallback(curlGenerator(options, body, regex));
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
function monkeyPatchHttp(httpObject, options = { filter: '', customCallback: () => {} }) {
  monkeypatch(httpObject, 'request', (request, requestOptions, cb) => {
    const { filter, customCallback } = options;
    return requestPatch(filter, request, requestOptions, cb, customCallback);
  });
}

export default httpToCurl;
