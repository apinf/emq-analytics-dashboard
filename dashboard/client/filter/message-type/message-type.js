import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import $ from 'jquery'

Template.filterEvent.onRendered(function(){

  $('#filter-event').selectpicker()
})

Template.filterEvent.events({
  'change #filter-event': function (event, instance) {
    const emqEvent = $('#filter-event').val() || null

    FlowRouter.setQueryParams({ event: emqEvent })
  }
})
