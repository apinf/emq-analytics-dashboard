import _ from 'lodash';

export default (data) => {
  const values = [];

  _.forEach(data, (item) => {
    return values.push({
      x: item.key,
      y: item.doc_count,
    });
  });

  return [
    {
      key: 'MQT connections over time',
      values,
      color: '#ff7f0e',
      area: true,
    },
  ];
};
