import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import $ from 'jquery'

Template.filterDateRange.onRendered(() => {
  const from = FlowRouter.getQueryParam('from')
  const to = FlowRouter.getQueryParam('to')

  if (from) {
    $('#analytics-date-from').val(from)
  }

  if (to) {
    $('#analytics-date-to').val(to)
  }
})

Template.filterDateRange.events({
  'change #analytics-date-from': event => {
    const from = $(event.currentTarget).val()
    FlowRouter.setQueryParams({ from })
  },
  'change #analytics-date-to': event => {
    const to = $(event.currentTarget).val()
    FlowRouter.setQueryParams({ to })
  }
})
