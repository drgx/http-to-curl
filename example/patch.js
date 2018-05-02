const axios = require('axios');
require = require('esm')({ module, mode: 'all' });
const httpToCurl = require('../src/main').default;
httpToCurl();

const options = {
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  method: 'PATCH',
  data: JSON.stringify({
    title: 'foo'
  }),
  headers: {
    'Content-type': 'application/json; charset=UTF-8'
  }
};

axios(options)
  .then(function(response) {
    console.log('done');
  })
  .catch(function(error) {
    console.log(error);
  });
