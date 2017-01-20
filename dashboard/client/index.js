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

    const dataWithNormalizedDate = instance.normalizeDate(data)

    const grouppedByDate = instance.groupBy(dataWithNormalizedDate, 'day')

    const dataForNV = instance.buildDataForNV(grouppedByDate)

    const sortedByDate = instance.sortByDate(dataForNV);

    return {
      data: [
        {
          key: 'MQT connections over time',
          values: sortedByDate
        }
      ]
    }
  }

  instance.buildDataForNV = (data) => {
    let dataForNV = [];
    for (key in data) {
      dataForNV.push({ x: moment(key, 'DD-MM-YYYY').valueOf(), y: data[key].length })
    }
    return dataForNV;
  }

  instance.groupBy = (data, key) => {
    if (key === 'day') {
      return _.groupBy(data, 'day');
    }
  }

  instance.normalizeDate = (data) => {
    return _.map(data, item => {
      item.day = moment(item.date).format('DD-MM-YYYY');
      return item;
    })
  }

  instance.sortByDate = (data) => _.sortBy(data, (dataItem) => dataItem.x)

  instance.render = (chartData) => {

    const data = instance.parseEsData(chartData);

    const dataForNV = instance.parseDataForNV(data);

    if (dataForNV.data) {
      nv.addGraph(function() {
        var chart = nv.models.lineWithFocusChart();

        var tickMultiFormat = d3.time.format.multi([
          ["%b %-d", function(d) { return d.getDate() != 1; }], // not the first of the month
          ["%b %-d", function(d) { return d.getMonth(); }], // not Jan 1st
          ["%Y", function() { return true; }]
        ]);

        chart.xAxis
          .tickFormat((d) => tickMultiFormat(new Date(d)));

        chart.x2Axis
          .tickFormat((d) => tickMultiFormat(new Date(d)));

        chart.yAxis
        .tickFormat(d3.format(',.2'));

        chart.y2Axis
        .tickFormat(d3.format(',.2'));

        d3.select('#chart svg')
          .attr('height', 500)
          .datum(dataForNV.data)
          .transition().duration(500)
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });

    }
  }
});

Template.dashboard.onRendered(function(){
  const instance = this;

  const opts = {
    size: 1000,
    body: {
      sort: [
        {
          date: {
            order: 'desc',
          },
        },
      ],
    },
  };

  instance.autorun(() => {
    instance.getChartData({size: 1000})
      .then((items) => {
        instance.render(items)
      })
      .catch(err => console.error(err));
  });
});
