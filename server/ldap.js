// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import ldap from 'ldapjs';

let client;
let timer;

export function search (params, success, error) {

  if (! client) {
    client = ldap.createClient({
      url: 'ldap://' + params.address,
      connectTimeout: 4000,
      timeout: 10000
    });
  }

  let options = {
    scope: 'sub',
    filter: "(cn=*" + params.searchText + "*)",
    attributes: ['cn'],
    sizeLimit: 10
  };

  client.search(params.baseDn, options, (ldapErr, ldapRes) => {
    let entries = [];
    if (ldapErr) {
      console.log('client error:', ldapErr);
      if (client) {
        client.unbind();
        client = null;
      }
      error(ldapErr);
    } else {
      ldapRes.on('searchEntry', (entry) => {
        //console.log('entry: ', JSON.stringify(entry.object));
        entries.push(entry.object);
      });
      ldapRes.on('searchReference', (referral) => {
        //console.log('referral: ', referral.uris.join());
      });
      ldapRes.on('error', (err) => {
        console.log('error:', err.message, ' have ', entries.length);
        success(entries);
      });
      ldapRes.on('end', (result) => {
        console.log('status: ', result.status, ' have ', entries.length);
        success(entries);
      });
    }
  });

  // If we're idle for more than 30 seconds. Clean up and start fresh.
  clearTimeout(timer);
  timer = setTimeout(() => {
    //console.log('client cleanup');
    if (client) {
      client.unbind();
      client = null;
    }
  }, 30000);
}
