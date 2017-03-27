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

4. Run

  ```
  $ npm start
  ```

### Send following acknowledgements to elasticsearch

> **Note:** Update `<es_host>`, `<index>` and `<type>` to yours.

```
PUT <es_host>/<index>/_mapping/<type>

{
  "properties": {
    "timestamp": {
      "type": "date"
    }
  }
}
```

```
PUT <es_host>/<index>/_mapping/<type>

{
  "properties": {
    "event": {
      "type": "text",
      "fielddata": true
    }
  }
}
```

```
PUT <es_host>/<index>/_mapping/<type>

{
  "properties": {
    "topic": {
      "type": "text",
      "fielddata": true
    }
  }
}
```

### License

MIT (See license file)
