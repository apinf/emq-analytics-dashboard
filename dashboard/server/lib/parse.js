import _ from 'lodash'
import moment from 'moment'

export default data => {
  const values = []

  _.forEach(data, item => values.push({
    x: moment(item.key_as_string, 'DD-MM-YYYY').valueOf(),
    y: item.doc_count
  }))

  return [
    {
      key: 'MQT connections over time',
      values,
      color: '#ff7f0e',
      area: true
    }
  ]
}
