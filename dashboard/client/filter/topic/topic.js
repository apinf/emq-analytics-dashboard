import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import $ from 'jquery';
import _ from 'lodash';

Template.filterTopic.onCreated(function () {
  const instance = this;

  // Init instance varialbe that keeps list of event types
  instance.topics = new ReactiveVar([]);

  // Init promise-based instance method to fetch event types
  instance.getTopics = () => {
    return new Promise((resolve, reject) => {
      Meteor.call('getTopics', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  };

  // Execute data fetch function
  instance.getTopics()
    .then((topics) => { return instance.topics.set(topics); })
    .catch((err) => { return console.error(err); });
});

Template.filterTopic.onRendered(function () {
  const instance = this;

  const preSelectedTopic = FlowRouter.getQueryParam('topic') || null;

  $('#filter-topic').selectpicker();

  instance.autorun(() => {
    const topics = instance.topics.get();
    if (topics.length > 0) {
      // Dymanically fill selectpicker with this "hacky" way
      // since appoaches from "bootstrap-select" does not work
      _.forEach(topics, (t) => {
        $('#filter-topic').append($('<option>', {
          value: t.key,
          text: t.key,
        }));
      });

      // Update "select" is required to initialize bootstrap-select
      // with fresh data
      $('#filter-topic').selectpicker('refresh');

      // Update UI selection with value (if one exists)
      // that came from URL params after all options are loaded & renderd
      if (preSelectedTopic) {
        $('#filter-topic').selectpicker('val', preSelectedTopic);
      }
    }
  });
});

Template.filterTopic.events({
  'change #filter-topic': function (event, instance) {
    const topic = $('#filter-topic').val() || null;

    FlowRouter.setQueryParams({ topic });
  },
});
