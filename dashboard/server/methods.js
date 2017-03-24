import { Meteor } from 'meteor/meteor'
import ES from 'elasticsearch'
import _ from 'lodash'

import parseDataForNvd from './lib/parse'
import config from '../../config'

const client = new ES.Client({
  host: config.host
})

const opts = {
  // Intiial elasticsearch index & type values
  index: 'mqtt',
  type: 'events',

  // Amount of items to return
  // Since aggregated data is returned, regular records are not needed
  size: 0
}

Meteor.methods({
  getChartData (query) {
    // Merge default query with custom
    const esOpts = _.assign(opts, query)

    // Execute search
    return client.search(esOpts).then(
      res => {
        const data = res.aggregations.logs_over_time.buckets
        return parseDataForNvd(data)
      },
      err => new Meteor.Error(err)
    )
  },
  getEventTypes () {
    // Construct custom query
    const query = {
      body: {
        aggs: {
          types: {
            terms: {
              field: 'event'
            }
          }
        }
      }
    }
    // Merge default query with custom
    const esOpts = _.assign(opts, query)

    // Execute search
    return client.search(esOpts).then(
      res => res.aggregations.types.buckets,
      err => new Meteor.Error(err)
    )
  },
  getTopics () {
    // Construct custom query
    const query = {
      body: {
        aggs: {
          topics: {
            terms: {
              field: 'topic'
            }
          }
        }
      }
    }
    // Merge default query with custom
    const esOpts = _.assign(opts, query)

    // Execute search
    return client.search(esOpts).then(
      res => res.aggregations.topics.buckets,
      err => new Meteor.Error(err)
    )
  }
})
