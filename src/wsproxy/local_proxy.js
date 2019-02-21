const DEBUG = process.env.DEBUG|| false;
const port = process.env.PORT|| 5050;
let web = null;
if(DEBUG) {
  console.log("unpacked");
  web = require('./web'); //your express app
} else {
  console.log("packed");
  web = require('../wsproxy'); //your express app
}
web(port);
