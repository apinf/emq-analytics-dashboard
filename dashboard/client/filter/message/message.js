import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import $ from 'jquery'

Template.filterMessageType.events({
  'change #filter-message-type': function (event, instance) {
    const type = $('#filter-message-type').val()

    FlowRouter.setQueryParams({ type })
  }
})
