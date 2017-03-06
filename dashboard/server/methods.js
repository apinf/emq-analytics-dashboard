import { Meteor } from 'meteor/meteor'
import ES from 'elasticsearch'
import _ from 'lodash'
import moment from 'moment'
import config from '../../config'

Meteor.methods({
  getAggr (opts) {
    const client = new ES.Client({
      host: config.host
    })

    return client.search(opts).then(res => {
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
