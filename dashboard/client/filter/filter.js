import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

Template.filter.onRendered(function () {
  const instance = this

  $('#timeframe-datepickers').datepicker({
    todayHighlight: true,
    endDate: 'today',
    autoclose: true,
    format: 'dd M yyyy'
  })


  $('#analytics-timeframe-start').datepicker()
    .on('changeDate', event => {
      FlowRouter.setQueryParams({ from: event.format('yyyy-mm-dd') })
    })

  $('#analytics-timeframe-end').datepicker()
  .on('changeDate', event => {
    FlowRouter.setQueryParams({ to: event.format('yyyy-mm-dd') })
  })

  const from = FlowRouter.getQueryParam('from')
  const to = FlowRouter.getQueryParam('to')

  if (from) {
    $('#analytics-timeframe-start').datepicker('setDate', new Date(from))
  }

  if (to) {
    $('#analytics-timeframe-end').datepicker('setDate', new Date(to))
  }
})
