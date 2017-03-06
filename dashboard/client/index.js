import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'

import nvd3 from 'nvd3'
import d3 from 'd3'

import moment from 'moment'
import _ from 'lodash'
import $ from 'jquery'

Template.dashboard.onCreated(function () {
  const instance = this

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
          .tickFormat(d => tickMultiFormat(new Date(d)))

        chart.x2Axis
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
})

Template.dashboard.onRendered(function () {
  const instance = this

  const opts = {
    index: 'mqt',
    size: 0,
    body: {
      aggs: {
        by_day: {
          date_histogram: {
            field: 'date',
            interval: 'day',
            format: 'dd-MM-yyyy'
          }
        }
      }
    }
  }

  instance.autorun(() => {
    instance.getAggrData(opts)
      .then(items => {
        // console.log(items);
        instance.render(items)
      })
      .catch(err => console.error(err))
  })
})
