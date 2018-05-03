[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
# Node js HTTP request to cURL
Tired to manually generate curl from nodejs request for debugging proposes? Need to export nodejs request to your REST client (e.g. [Insomnia](https://insomnia.rest/) and [Postman](https://www.getpostman.com/))? http-to-curl come to the rescue!!


## Installation ⚙️
```sh
yarn add http-to-curl
# old way
npm install http-to-curl --save

```

## Usage 📚
```js
// import httpToCurl on your server entry point of your project or code (e.g. server.js / index.js)
import httpToCurl from 'http-to-curl';
httpToCurl();
// Traditional way
const httpToCurl = require('http-to-curl').default;
httpToCurl();

//  Use your favorite http client to fetch (e.g. axios, isomorphic fetch or even vanilla request) all works well with http-to-curl.
//  In this example we are using axios.

import axios from 'axios'
const options = {
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  method: 'get'
};

//Output
curl "https://jsonplaceholder.typicode.com/posts/1" -X GET -H "Accept: application/json, text/plain, */*" -H "User-Agent: axios/0.18.0"

```
It will listen all your nodejs http request and generate curl for each request. Its support all method (GET, POST, PUT, DELETE & PATCH)

## Filtering ✅
`nodejs-http-to-curl` support filtering url using regex and string. Only match url will be generated.

```js
import httpToCurl from 'http-to-curl';
//Single url match
httpToCurl(/api/v1/);
//Multiple url match
httpToCurl([/api/v1/, /api/v3/]);
```


## Contributing
We'd ❤️ to have your helping hand on http-to-curl! Feel free to PR's, add issues or give feedback! Happy Hacking!! 😎