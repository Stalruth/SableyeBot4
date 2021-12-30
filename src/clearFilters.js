'use strict';

const admin = require('firebase-admin');
const fetch = require('node-fetch');
admin.initializeApp();

exports.clearFilters = async (context) => {
  const ref = admin.database().ref('filters');
  const query = await ref.orderByChild('info/timestamp').endAt(+(new Date()) - (10 * 60 * 1000)).once('value');
  if(!query.exists()) {
    return;
  }

  const results = [];

  query.forEach((e)=>{
    results.push(e);
  });

  for(const e of results) {
    const info = e.val().info;
    e.ref.remove();
    try {
      const getResponse = await fetch(`https://discord.com/api/v9/webhooks/${info.appId}/${info.token}/messages/@original`);
      const message = await getResponse.json();
      message.components = [];
      const patchResponse = await fetch(`https://discord.com/api/v9/webhooks/${info.appId}/${info.token}/messages/@original`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );
    } catch(e) {
      console.log(e);
    }
  }
};
