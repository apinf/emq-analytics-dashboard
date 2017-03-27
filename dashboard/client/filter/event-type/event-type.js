import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import $ from 'jquery';
import _ from 'lodash';

Template.filterEvent.onCreated(function () {
  const instance = this;

  // Init instance varialbe that keeps list of event types
  instance.eventTypes = new ReactiveVar([]);

  // Init promise-based instance method to fetch event types
  instance.getEventTypes = () => {
    return new Promise((resolve, reject) => {
      Meteor.call('getEventTypes', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  };

  // Execute data fetch function
  instance.getEventTypes()
    .then((eventTypes) => { return instance.eventTypes.set(eventTypes); })
    .catch((err) => { return console.error(err); });
});

Template.filterEvent.onRendered(function () {
  const instance = this;

  const preSelectedEventType = FlowRouter.getQueryParam('event') || null;

  $('#filter-event').selectpicker();

  instance.autorun(() => {
    const eventTypes = instance.eventTypes.get();
    if (eventTypes.length > 0) {
      // Dymanically fill selectpicker with this "hacky" way
      // since appoaches from "bootstrap-select" does not work
      _.forEach(eventTypes, (e) => {
        $('#filter-event').append($('<option>', {
          value: e.key,
          text: e.key,
        }));
      });

      // Update "select" is required to initialize bootstrap-select
      // with fresh data
      $('#filter-event').selectpicker('refresh');

      // Update UI selecttion with value (if one exists)
      // that came from URL params after all options are loaded & renderd
      if (preSelectedEventType) {
        $('#filter-event').selectpicker('val', preSelectedEventType);
      }
    }
  });
});

Template.filterEvent.events({
  'change #filter-event': function (event, instance) {
    const emqEvent = $('#filter-event').val() || null;

    FlowRouter.setQueryParams({ event: emqEvent });
  },
});
