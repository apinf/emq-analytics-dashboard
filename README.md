# emq-analytics-dashboard

> Dashboard for EMQ analytics


### Try it out

1. Clone

  ```
  $ git clone https://github.com/apinf/emq-analytics-dashboard.git
  ```

2. Install deps

  ```
  $ cd emq-analytics-dashboard && npm install
  ```

3. Create config file in `./config/index.js` with contents

  ```js
  export default {
    host: 'http://127.0.0.1:9200/' // elasticsearch host (change to correct one)
  }
  ```

4. Run it

  ```
  $ npm start
  ```
