const axios = require('axios');
require = require('esm')({ module, mode: 'all' });
const httpToCurl = require('../src/main').default;
// httpToCurl(/post/); //valid
httpToCurl([/post/, /xxx/]); //valid
// httpToCurl(/xxx/); //invalid

const options = {
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  method: 'get'
};

axios(options)
  .then(function(response) {
    console.log('done');
  })
  .catch(function(error) {
    console.log(error);
  });
