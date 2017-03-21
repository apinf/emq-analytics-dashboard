import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import $ from 'jquery'

Template.filterMessageType.onRendered(function(){

  $('#filter-message-type').selectpicker()
})

Template.filterMessageType.events({
  'change #filter-message-type': function (event, instance) {
    const type = $('#filter-message-type').val() || null

    FlowRouter.setQueryParams({ type })
  }
})
