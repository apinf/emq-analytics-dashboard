import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import Pikaday from 'pikaday'

Template.filterDateRange.onRendered(() => {
  const from = FlowRouter.getQueryParam('from')
  const to = FlowRouter.getQueryParam('to')

  const dpFrom = new Pikaday({
    field: $('#datepicker-from')[0],
    format: 'D MMM YYYY',
    onSelect () {
      FlowRouter.setQueryParams({
        from: this.getMoment().format('YYYY-MM-DD')
      })
    }
  })

  const dpTo = new Pikaday({
    field: $('#datepicker-to')[0],
    format: 'D MMM YYYY',
    onSelect () {
      FlowRouter.setQueryParams({
        to: this.getMoment().format('YYYY-MM-DD')
      })
    }
  })

  if (from) {
    dpFrom.setDate(from)
  }

  if (to) {
    dpTo.setDate(to)
  }
})
