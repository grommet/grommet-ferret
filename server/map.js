// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import { getAssociations, getResource } from './data';

const REDUCE_LIMIT = 20;

function addResource(uri, result, associationContext) {
  let resource = getResource(uri);
  if (! result.categories.hasOwnProperty(resource.category)) {
    result.categories[resource.category] = [];
  }
  // don't add if we already have it
  const exists = result.categories[resource.category].some(item => {
    return (item.uri === uri);
  });
  if (! exists) {
    result.categories[resource.category].push({
      uri: uri,
      status: resource.status,
      name: resource.name,
      // associationContext is added to make reduce easier.
      // It will be removed before responding.
      associationContext: associationContext
    });
  }
}

function add(name, uri, result, associations, callback) {
  if (associations.hasOwnProperty(name)) {
    associations[name].children.forEach(childUri => {
      result.links.push({parentUri: uri, childUri: childUri});
      addResource(childUri, result, {name: name, parentUri: uri});
      callback(childUri, result);
    });
  }
}

function addChildren(uri, result) {
  let associations = getAssociations(uri);
  for (let name in associations) {
    if (associations.hasOwnProperty(name)) {
      add(name, uri, result, associations, addChildren);
    }
  }
}

function addParents(uri, result) {
  let associations = getAssociations(uri);
  for (let name in associations) {
    if (associations.hasOwnProperty(name)) {
      add(name, uri, result, associations, addParents);
    }
  }
}

function reduce(result) {
  for (let name in result.categories) {
    if (result.categories.hasOwnProperty(name)) {
      let items = result.categories[name];
      if (items.length > REDUCE_LIMIT) {

        let reducedItems = [];
        // group by parentUri
        let reducedItemsMap = {}; // parentUri: data

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          let reducedItem;

          if (item.associationContext.parentUri) {
            reducedItem = reducedItemsMap[item.associationContext.parentUri];
            if (! reducedItem) {
              reducedItem = {
                association: {
                  parentUri: item.associationContext.parentUri,
                  name: item.associationContext.name
                },
                total: 0,
                uri: '/summary/' + name + item.associationContext.parentUri,
                status: {}
              };
              reducedItems.push(reducedItem);
              reducedItemsMap[item.associationContext.parentUri] = reducedItem;
            }

            // adjust counters
            reducedItem.total += 1;
            if (! reducedItem.status[item.status]) {
              reducedItem.status[item.status] = 0;
            }
            reducedItem.status[item.status] += 1;

            // adjust links
            for (let j = 0; j < result.links.length; j++) {
              var link = result.links[j];
              if (link.parentUri === item.uri) {
                link.parentUri = reducedItem.uri;
              }
              if (link.childUri === item.uri) {
                link.childUri = reducedItem.uri;
              }
            }
          } else {
            reducedItems.push(item);
          }
        }

        result.categories[name] = reducedItems;
      }
    }
  }
}

export function buildMap (uri) {
  let result = { links: [], categories: {}, rootUri: uri };
  addResource(uri, result);
  addParents(uri, result);
  addChildren(uri, result);
  reduce(result);
  return result;
}
