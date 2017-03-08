import { Meteor } from 'meteor/meteor'
import ES from 'elasticsearch'
import _ from 'lodash'
import moment from 'moment'
import config from '../../config'

const client = new ES.Client({
  host: config.host
})

Meteor.methods({
  getAggr (opts) {
    const startTime = new Date().getTime()

    return client.search(opts).then(res => {
      const took1 = new Date().getTime() - startTime
      console.log(`--------------`)
      console.log(`Total: ${res.hits.total} items.`)
      console.log(`Request took: ${took1} milliseconds.`)
      console.log(`ES search execution took: ${res.took} milliseconds.`)

      const values = []
      const data = res.aggregations.by_day.buckets

      _.forEach(data, item => values.push({ x: moment(item.key_as_string, 'DD-MM-YYYY').valueOf(), y: item.doc_count }))

      return [
        {
          key: 'MQT connections over time',
          values
        }
      ]
    }, err => {
      throw new Meteor.Error(err.message)
    })
  }
})
