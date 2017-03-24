import { Meteor } from 'meteor/meteor'
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import $ from 'jquery'

Template.filterEvent.onCreated(function () {
  const instance = this

  // Init instance varialbe that keeps list of event types
  instance.eventTypes = new ReactiveVar([])

  // Init promise-based instance method to fetch event types
  instance.getEventTypes = () => new Promise((resolve, reject) => {
    Meteor.call('getEventTypes', (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })

  // Execute data fetch function
  instance.getEventTypes()
    .then(eventTypes => instance.eventTypes.set(eventTypes))
    .catch(err => console.error(err))
})

Template.filterEvent.onRendered(() => {
  $('#filter-event').selectpicker()
})

Template.filterEvent.events({
  'change #filter-event': function (event, instance) {
    const emqEvent = $('#filter-event').val() || null

    FlowRouter.setQueryParams({ event: emqEvent })
  }
})
