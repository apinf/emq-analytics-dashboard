import { Meteor } from 'meteor/meteor'
import ES from 'elasticsearch'
import _ from 'lodash'
import moment from 'moment'
import config from '../../config'

const client = new ES.Client({
  host: config.host
})

const types = [
  'on_client_connected',
  'on_client_disconnected',
  'on_client_subscribe',
  'on_client_unsubscribe',
  'on_session_created',
  'on_session_subscribed',
  'on_session_unsubscribed',
  'on_session_terminated',
  'on_message_publish',
  'on_message_delivered',
  'on_message_acked'
]

Meteor.methods({
  getAggregatedData (opts) {
    return client.search(opts).then(
      res => res.aggregations.logs_over_time.buckets,
      err => new Meteor.Error(err.message)
    )
  },
  parseDataForNvd (data) {
    const values = []

    _.forEach(data, item => values.push({
      x: moment(item.key_as_string, 'DD-MM-YYYY').valueOf(),
      y: item.doc_count
    }))

    return [
      {
        key: 'MQT connections over time',
        values,
        color: '#ff7f0e',
        area: true
      }
    ]
  }
})
