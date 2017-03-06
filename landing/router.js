import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

FlowRouter.route('/', {
  action () {
    BlazeLayout.render('mainLayout', { main: 'landing' })
  }
})
