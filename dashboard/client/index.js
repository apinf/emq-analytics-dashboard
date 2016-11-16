import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import moment from 'moment';
import dc from 'dc';
import d3 from 'd3';
import crossfilter from 'crossfilter';
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

  instance.parseChartData = (items) => {

    // instance.analyticsTickDateFormat = {
    //   d3: {
    //     hour: '%Y-%m-%d-%H',
    //     day: '%Y-%m-%d',
    //     week: '%Y-%m-%W',
    //     month: '%Y-%m',
    //   },
    //   moment: {
    //     hour: 'YYYY-MM-DD-HH',
    //     day: 'YYYY-MM-DD',
    //     week: 'YYYY-MM-ww',
    //     month: 'YYYY-MM',
    //   },
    // };

    const index = new crossfilter(items);
    const dateFormat = d3.time.format('%Y-%m-%d-%H');

    const timeStampDimension = index.dimension((d) => {
      let timeStamp = moment(d._source.date);

      timeStamp = timeStamp.format('YYYY-MM-DD-HH');

      d._source.ymd = dateFormat.parse(timeStamp);

      return d._source.ymd;
    });

    // Create timestamp group
    const timeStampGroup = timeStampDimension.group();
    // Group add dimensions
    const all = index.groupAll();

    // Keep data counters on a dashboard updated
    dc.dataCount('#row-selection')
      .dimension(index)
      .group(all);

    // Get MIN and MAX timestamp values
    const minDate = d3.min(items, (d) => d._source.ymd);
    const maxDate = d3.max(items, (d) => d._source.ymd);

    // Init scales for axis
    const timeScaleForLineChart = d3.time.scale().domain([minDate, maxDate]);
    const timeScaleForRangeChart = d3.time.scale().domain([minDate, maxDate]);

    return {
      timeStampDimension,
      timeStampGroup,
      timeScaleForLineChart,
      timeScaleForRangeChart,
    };
  };

  // Render charts on the page
  instance.renderCharts = (parsedData) => {
    const {
      timeStampDimension,
      timeStampGroup,
      timeScaleForLineChart,
      timeScaleForRangeChart,
    } = parsedData;

    // Init charts
    const requestsOverTime = dc.lineChart('#requestsOverTime-chart');
    const overviewChart = dc.barChart('#overviewChart-chart');

    requestsOverTime
      .height(350)
      .renderArea(true)
      .transitionDuration(300)
      .margins({ top: 10, right: 20, bottom: 25, left: 40 })
      .ordinalColors(['#2fa4e7'])
      .x(timeScaleForLineChart)
      .dimension(timeStampDimension)
      .group(timeStampGroup)
      .rangeChart(overviewChart)
      .brushOn(false)
      .renderHorizontalGridLines(true)
      .renderVerticalGridLines(true)
      .elasticY(true);

    overviewChart
      .height(100)
      .dimension(timeStampDimension)
      .group(timeStampGroup)
      .xUnits(dc.units.fp.precision(50))
      .centerBar(true)
      .gap(1)
      .margins({ top: 10, right: 20, bottom: 25, left: 40 })
      .ordinalColors(['#2fa4e7'])
      .x(timeScaleForRangeChart)
      .alwaysUseRounding(true)
      .elasticY(true)
      .yAxis()
      .ticks(0);

    dc.renderAll(); // Render all charts

  };
});

Template.dashboard.onRendered(function(){
  const instance = this;

  instance.autorun(() => {
    instance.getChartData({size: 1000})
      .then((items) => {
        const parsedData = instance.parseChartData(items);
        instance.renderCharts(parsedData);
      })
      .catch(err => console.error(err));
  });
});
