import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import nvd3 from 'nvd3';
import d3 from 'd3';
import moment from 'moment';
import _ from 'lodash';

Template.dashboard.onCreated(function () {
  const instance = this;

  instance.opts = {
    body: {
      query: {
        bool: {
          must: [],
        },
      },
      aggs: {
        logs_over_time: {
          date_histogram: {
            field: 'timestamp',
            interval: '',
            format: 'dd-MM-yyyy',
          },
        },
      },
    },
  };

  instance.getChartData = (opts) => {
    return new Promise((resolve, reject) => {
      Meteor.call('getChartData', opts, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  };

  instance.render = (data) => {
    if (data) {
      nv.addGraph(() => {
        const chart = nv.models.lineWithFocusChart();

        const tickMultiFormat = d3.time.format.multi([
          ['%-d %b %y', (d) => { return d.getDate(); }],
          ['%b %-d', (d) => { return d.getMonth(); }],
          ['%Y', () => { return true; }],
        ]);

        chart.interpolate('basis');

        chart.xAxis
          .tickFormat((d) => { return tickMultiFormat(new Date(d)); })
          .axisLabel('Time');

        chart.x2Axis
          .tickFormat((d) => { return tickMultiFormat(new Date(d)); })
          .axisLabel('Overview chart');

        chart.yAxis
          .tickFormat(d3.format(',.2'))
          .axisLabel('Calls');

        chart.y2Axis
          .tickFormat(d3.format(',.2'));

        chart.margin({ left: 70, right: 40 });

        d3.select('#chart svg')
          .attr('height', 500)
          .datum(data)
          .transition()
          .duration(500)
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });
    }
  };

  instance.init = (opts) => {
    instance.getChartData(opts)
      .then((items) => {
        instance.render(items);
      })
      .catch((err) => { return console.error(err); });
  };

  instance.updateQuery = () => {
    const from = FlowRouter.getQueryParam('from') || moment().subtract(1, 'month').format('YYYY-MM-DD');
    const to = FlowRouter.getQueryParam('to') || moment().format('YYYY-MM-DD');
    const granularity = FlowRouter.getQueryParam('granularity') || 'day';
    const emqEvent = FlowRouter.getQueryParam('event') || '';
    const topic = FlowRouter.getQueryParam('topic') || '';

    const mustQuery = instance.opts.body.query.bool.must;

    // Find & remove "range" query object from array
    // so that we can update query with "fresh" rules
    const range = _.find(mustQuery, (obj) => { return typeof obj.range !== 'undefined'; });
    if (range) {
      _.remove(mustQuery, _.find(mustQuery, (obj) => { return typeof obj.range !== 'undefined'; }));
    }

    // Find & remove "match" query object from array
    // so that we can update query with "fresh" rules
    const match = _.find(mustQuery, (obj) => { return typeof obj.match !== 'undefined'; });
    if (match) {
      _.remove(
        mustQuery,
        (q) => { return typeof q.match === 'object'; }
      );
    }

    // Push "filter-by-event" query
    if (emqEvent) {
      mustQuery.push({ match: { event: emqEvent } });
    }

    // Push "filter-by-topic" query
    if (topic) {
      mustQuery.push({ match: { topic } });
    }

    // Push "filter-by-range" query
    mustQuery.push({
      range: {
        timestamp: {
          gte: from,
          lte: to,
          format: 'yyyy-MM-dd',
        },
      },
    });

    instance.opts.body.query.bool.must = mustQuery;
    instance.opts.body.aggs.logs_over_time.date_histogram.interval = granularity;
  };
});

Template.dashboard.onRendered(function () {
  const instance = this;

  instance.autorun(() => {
    instance.updateQuery();
    instance.init(instance.opts);
  });
});
