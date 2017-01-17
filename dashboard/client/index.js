import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import nvd3 from 'nvd3';
import d3 from 'd3';

import moment from 'moment';
import _ from 'lodash';
import $ from 'jquery';

Template.dashboard.onCreated(function(){
  const instance = this;

  instance.getChartData = (opts) => {
    return new Promise((resolve, reject) => {
      Meteor.call('getEsData', opts, (err, res) => {
        if (err) reject(err);
        resolve(res.hits.hits);
      });
    });
  }

  instance.parseEsData = esData => _.map(esData, item => item._source);

  instance.parseDataForNV = data => {

    let arr = [];
    let ticks = [];

    const a = _.map(data, item => {
      item.date = moment(item.date).format('DD-MM-YYYY');
      return item;
    })

    const b = _.groupBy(a, 'date');

    for (key in b) {
      arr.push([moment(key, 'DD-MM-YYYY').valueOf(), b[key].length])
      ticks.push(moment(key, 'DD-MM-YYYY').valueOf())
    }

    return {
      data: [
        {
          key: 'Series 1',
          values: arr
        }
      ],
      ticks
    }
  }

  instance.render = (chartData) => {

    const data = instance.parseEsData(chartData);

    const dataForNV = instance.parseDataForNV(data);

    console.log(dataForNV);

    if (dataForNV.data) {
      nv.addGraph(function() {
        var chart = nv.models.cumulativeLineChart()
        .x(function(d) { return d[0] })
        .y(function(d) { return d[1]/100 }) //adjusting, 100% is 1.00, not 100 as it is in the data
        .color(d3.scale.category10().range())
        .useInteractiveGuideline(true)
        ;

        chart.xAxis
        .tickValues(dataForNV.ticks)
        .tickFormat(function(d) {
          return d3.time.format('%x')(new Date(d))
        });

        chart.yAxis
        .tickFormat(d3.format(',.1%'));

        d3.select('#chart svg')
        .attr('height', 500)
        .datum(dataForNV.data)
        .call(chart);

        //TODO: Figure out a good way to do this automatically
        nv.utils.windowResize(chart.update);

        return chart;
      });
    }
  }
});

Template.dashboard.onRendered(function(){
  const instance = this;

  instance.autorun(() => {
    instance.getChartData({size: 1000})
      .then((items) => {
        instance.render(items)
      })
      .catch(err => console.error(err));
  });
});
