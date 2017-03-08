// Script to generate sample analytics data for elasticsearch

// import moment from 'moment'
// import es from 'elasticsearch'
// import uuid from 'node-uuid'
// import _ from 'lodash'
// import config from '/config'
//
// const client = new es.Client({
//   host: config.host
// })
//
// const dateStart = moment(new Date('April 7, 2017 10:10:00'))
// const dateNow = moment(new Date('September 5, 2017 10:10:00'))
//
// const diff = dateNow.diff(dateStart, 'days')
//
// const types = [
//   'on_client_connected',
//   'on_client_disconnected',
//   'on_client_subscribe',
//   'on_client_unsubscribe',
//   'on_session_created',
//   'on_session_subscribed',
//   'on_session_unsubscribed',
//   'on_session_terminated',
//   'on_message_publish',
//   'on_message_delivered',
//   'on_message_acked'
// ]
//
// console.log('started..')
// for (let i = 0; i < diff; i++) {
//   const logDate = dateStart.add(1, 'days')
//   const amount = Math.floor(Math.random() * 10) + 20
//   for (let j = 0; j < amount; j++) {
//     const randomType = _.sample(types)
//
//     const log = {
//       index: 'mqt',
//       type: 'analytics',
//       id: uuid.v4(),
//       body: {
//         date: logDate.toDate(),
//         type: randomType,
//         username: 'admin'
//       }
//     }
//
//     if (randomType === 'on_client_subscribe') {
//       log.body.topic_table = {
//         '/Hello': {
//           qos: 0
//         }
//       }
//     }
//
//     if (randomType === 'on_session_subscribed') {
//       log.body.topic_and_opts = {
//         opts: {
//           qos: 0
//         },
//         topic: '/Hello'
//       }
//     }
//
//     if (randomType === 'on_session_terminated') {
//       log.body.reason = 'normal'
//     }
//
//     if ((randomType === 'on_message_publish') || (randomType === 'on_message_delivered')) {
//       log.body.message = {
//         dup: false,
//         from: 'admin',
//         qos: 0,
//         retain: false,
//         topic: '/Hello'
//       }
//     }
//
//     client.create(log, (err, res) => {
//       if (err) console.error(err);
//       // console.log(res);
//     })
//     // console.log(logDate);
//   }
// }
// console.log('done!')
