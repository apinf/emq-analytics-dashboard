import { Meteor } from 'meteor/meteor';
import ES from 'elasticsearch';
import config from '/config';

Meteor.methods({
  getEsData (opts) {

    const client = new ES.Client({
      host: config.host
    });

    return client.search(opts).then((res) => {
        return res;
      }, (err) => {
        throw new Meteor.Error(err.message);
      });
  }
})
