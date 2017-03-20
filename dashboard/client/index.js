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
          must: []
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

  instance.getChartData = opts => new Promise((resolve, reject) => {
    Meteor.call('getChartData', opts, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })

  instance.render = data => {
    if (data) {
      nv.addGraph(() => {
        const chart = nv.models.lineWithFocusChart()

        const tickMultiFormat = d3.time.format.multi([
          ['%-d %b %y', d => d.getDate()],
          ['%b %-d', d => d.getMonth()],
          ['%Y', () => true]
        ])

        chart.interpolate('basis')

        chart.xAxis
          .tickFormat(d => tickMultiFormat(new Date(d)))
          .axisLabel('Time')

        chart.x2Axis
          .tickFormat(d => tickMultiFormat(new Date(d)))
          .axisLabel('Overview chart')

        chart.yAxis
          .tickFormat(d3.format(',.2'))
          .axisLabel('Calls')

        chart.y2Axis
          .tickFormat(d3.format(',.2'))

        chart.margin({ left: 70, right: 40 })

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
    instance.getChartData(opts)
      .then(items => {
        instance.render(items)
      })
      .catch(err => console.error(err))
  }

  instance.updateQuery = () => {
    const from = FlowRouter.getQueryParam('from') || moment().subtract(1, 'month').format('YYYY-MM-DD')
    const to = FlowRouter.getQueryParam('to') || moment().format('YYYY-MM-DD')
    const granularity = FlowRouter.getQueryParam('granularity') || 'day'
    const type = FlowRouter.getQueryParam('type') || ''

    const mustQuery = instance.opts.body.query.bool.must

    // Find & remove "range" query object from array
    const range = _.find(mustQuery, obj => typeof obj.range !== 'undefined')
    if (range) {
      _.remove(mustQuery, _.find(mustQuery, obj => typeof obj.range !== 'undefined'))
    }

    // Find & remove "match" query object from array
    const match = _.find(mustQuery, obj => typeof obj.match !== 'undefined')
    if (match) {
      _.remove(mustQuery, _.find(mustQuery, obj => typeof obj.match !== 'undefined'))
    }

    if (type) {
      mustQuery.push({ match: { type } })
    }

    mustQuery.push({
      range: {
        date: {
          gte: from,
          lte: to,
          format: 'yyyy-MM-dd'
        }
      }
    })

    instance.opts.body.query.bool.must = mustQuery
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
