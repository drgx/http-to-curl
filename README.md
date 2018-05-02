# Node js HTTP request to cURL
Tired to manually generate curl from nodejs request for debugging proposes? Need to export nodejs request to REST client (e.g. [Insomnia](https://insomnia.rest/) and [Postman](https://www.getpostman.com/))? http-to-curl come to the rescue!!


## Installation ⚙️
```sh
yarn add http-to-curl
# old way
npm install http-to-curl --save

```

## Usage 📚
```js
import httpToCurl from 'http-to-curl';
httpToCurl();

/*
  import your favorite http client (e.g. axios, isomorphic fetch or even vanilla request) all works well with http-to-curl.

  In this example we using axios
*/
import axios from 'axios'
const options = {
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  method: 'get'
};

//output
cURL "https://jsonplaceholder.typicode.com/posts/1" -XGET -H "Accept: application/json, text/plain, */*" -H "User-Agent: axios/0.18.0"

```
It will listen all your nodejs http request and generate curl for each request. Its support all method (GET, POST, PUT, DELETE & PATCH)

## Filtering ✅
`nodejs-http-to-curl` support filtering url using regex and string. Only match url will be generated.

```js
import httpToCurl from 'http-to-curl';
httpToCurl([/api/v1/, /api/v3/]); << Only generate match url
```


## Contributing
We'd ❤️ to have your helping hand on http-to-curl! Feel free to PR's, add issues or give feedback! Happy Hacking!! 😎