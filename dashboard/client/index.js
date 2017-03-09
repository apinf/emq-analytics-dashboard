import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import nvd3 from 'nvd3'
import d3 from 'd3'
import moment from 'moment'
import _ from 'lodash'

Template.dashboard.onCreated(function () {
  const instance = this

  instance.opts = {
    index: 'mqt',
    size: 0,
    body: {
      query: {
        bool: {
          must: [
            {
              range: {
                date: {
                  gte: '',
                  lte: '',
                  format: 'yyyy-MM-dd'
                }
              }
            }
          ]
        }
      },
      aggs: {
        logs_over_time: {
          date_histogram: {
            field: 'date',
            interval: '',
            format: 'dd-MM-yyyy'
          }
        }
      }
    }
  }

  instance.getAggrData = opts => new Promise((resolve, reject) => {
    Meteor.call('getAggr', opts, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })

  instance.render = data => {
    if (data) {
      nv.addGraph(() => {
        const chart = nv.models.lineWithFocusChart()

        const tickMultiFormat = d3.time.format.multi([
          ['%b %-d', d => d.getDate()],
          ['%b %-d', d => d.getMonth()],
          ['%Y', () => true]
        ])

        chart.interpolate('basis')

        chart.xAxis
          .axisLabel('Time')
          .tickFormat(d => tickMultiFormat(new Date(d)))

        chart.x2Axis
          .axisLabel('Usage')
          .tickFormat(d => tickMultiFormat(new Date(d)))

        chart.yAxis
          .tickFormat(d3.format(',.2'))

        chart.y2Axis
          .tickFormat(d3.format(',.2'))

        d3.select('#chart svg')
          .attr('height', 500)
          .datum(data)
          .transition()
          .duration(500)
          .call(chart)

        nv.utils.windowResize(chart.update)

        return chart
      })
    }
  }

  instance.init = opts => {
    instance.getAggrData(opts)
      .then(items => {
        instance.render(items)
      })
      .catch(err => console.error(err))
  }

  instance.updateQuery = () => {
    let from = FlowRouter.getQueryParam('from')
    let to = FlowRouter.getQueryParam('to')
    let granularity = FlowRouter.getQueryParam('granularity')

    if (!from) {
      // Set last ~30 days by default
      from = moment().subtract(1, 'month').format('YYYY-MM-DD')
    }

    if (!to) {
      // Set current date by default
      to = moment().format('YYYY-MM-DD')
    }

    if (!granularity) {
      // Set 'day' granularity by default
      granularity = 'day'
    }

    // For metics collection
    // const a = moment(from, 'YYYY-MM-DD')
    // const b = moment(to, 'YYYY-MM-DD')
    // console.log(`${b.diff(a, 'days')} days shown.`)

    const q = instance.opts.body.query.bool.must

    const range = _.find(q, obj => typeof obj.range !== 'undefined')

    if (range) {
      _.remove(q, _.find(q, obj => typeof obj.range !== 'undefined'))
    }

    range.range.date.gte = from
    range.range.date.lte = to
    q.push(range)

    instance.opts.body.query.bool.must = q
    instance.opts.body.aggs.logs_over_time.date_histogram.interval = granularity
  }
})

Template.dashboard.onRendered(function () {
  const instance = this

  instance.autorun(() => {
    instance.updateQuery()
    instance.init(instance.opts)
  })
})
