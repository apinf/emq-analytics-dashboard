import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import $ from 'jquery'

Template.filterGranularity.onRendered(function () {
  // Get reference to template instance
  const instance = this

  instance.autorun(() => {
    // Get granularity parameters
    const granularityParameter = FlowRouter.getQueryParam('granularity')

    if (granularityParameter) {
      // Set the granularity UI state from URL parameter
      instance.$(`#${granularityParameter}-granularity`).button('toggle')
    } else {
      instance.$(`#day-granularity`).button('toggle')
    }
  })
})

Template.filterGranularity.events({
  'change #date-granularity-selector': function (event) {
    // Modifies the current history entry instead of creating a new one
    FlowRouter.withReplaceState(() => {
      // Set granularity value to URL parameter
      FlowRouter.setQueryParams({ granularity: event.target.value })
    })
  }
})
