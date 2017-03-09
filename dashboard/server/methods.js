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
  getAggr (opts) {
    const searches = _.map(types, type => {
      const oldOpts = opts
      // this filter is needed because the push below for some reason nests the array
      oldOpts.body.query.bool.must = oldOpts.body.query.bool.must.filter(obj => typeof obj.match === 'undefined')

      oldOpts.body.query.bool.must.push({ match: { type } })
      return client.search(oldOpts).then(res => {
        const values = []
        const data = res.aggregations.logs_over_time.buckets

        _.forEach(data, item => values.push({
          x: moment(item.key_as_string, 'DD-MM-YYYY').valueOf(),
          y: item.doc_count
        }))

        return {
          key: type,
          values,
          area: true
        }
      }, err => {
        throw new Meteor.Error(err.message)
      })
    })

    return Promise.all(searches)
      .then(res => res)
      .catch(err => { throw new Meteor.Error(err.message) })

    // return client.search(opts).then(res => {
    //   const took1 = new Date().getTime() - startTime
    //   console.log(`--------------`)
    //   console.log(`Total: ${res.hits.total} items.`)
    //   console.log(`Request took: ${took1} milliseconds.`)
    //   console.log(`ES search execution took: ${res.took} milliseconds.`)
    //
    //   const values = []
    //   const data = res.aggregations.logs_over_time.buckets
    //
    //   _.forEach(data, item => values.push({
    //     x: moment(item.key_as_string, 'DD-MM-YYYY').valueOf(),
    //     y: item.doc_count
    //   }))
    //
    //
    //
    //   return [
    //     {
    //       key: 'MQT connections over time',
    //       values,
    //       color: '#ff7f0e',
    //       area: true
    //     }
    //   ]
    // }, err => {
    //   throw new Meteor.Error(err.message)
    // })
  }
})
