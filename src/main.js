import monkeypatch from 'monkeypatch';
import http from 'http';
import buffer from 'buffer';

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
    GET: '-XGET',
    POST: '-XPOST',
    PUT: '-XPUT',
    PATCH: '-XPATCH',
    DELETE: '-XDELETE'
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
      headerParam += `-H "${val}: ${headers[val]}" `;
    }
    if (val.toLocaleLowerCase() === 'accept-encoding') {
      isEncode = true;
    }
  });
  return {
    params: headerParam.trim(),
    isEncode
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
  const {
    protocol = 'http:',
    hostname = 'localhost',
    pathname = '/'
  } = options;
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
 */
export function curlGenerator(options, body = '') {
  let result = 'curl ';
  const headers = generateHeader(options);
  result += generateUrl(options) + ' ';
  result += generateMethod(options) + ' ';
  result += headers.params + ' ';
  result += generateBody(body) + ' ';
  result += generateCompress(headers.isEncode);
  console.log(result);
}

/**
 *
 *
 * @export
 * @param {any} request
 * @param {any} options
 * @param {any} cb
 * @returns
 */
export function requestPatch(request, options, cb) {
  const bodyData = [];
  const clientReq = request(options, cb);

  monkeypatch(clientReq, 'write', (original, chunk, encoding, cb) => {
    bodyData.push(chunk);
    return original(chunk, encoding, cb);
  });

  monkeypatch(clientReq, 'end', (original, data, encoding, cb) => {
    let body = '';
    if(bodyData.length > 0) {
      body = Buffer.concat(bodyData).toString();
    }

    curlGenerator(options, body);
    return original(data, encoding, cb);
  });
  return clientReq;
}
/**
 *
 *
 * @param {string} [urlRegex='']
 */
function httpToCurl(urlRegex = '') {
  monkeypatch(http, 'request', requestPatch);
}

export default httpToCurl;
