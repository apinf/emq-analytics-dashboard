import { Meteor } from 'meteor/meteor'
import ES from 'elasticsearch'

import parseDataForNvd from './lib/parse'
import config from '../../config'

const client = new ES.Client({
  host: config.host
})

Meteor.methods({
  getChartData (opts) {
    return client.search(opts).then(
      res => {
        const data = res.aggregations.logs_over_time.buckets
        return parseDataForNvd(data)
      },
      err => new Meteor.Error(err.message)
    )
  }
})
