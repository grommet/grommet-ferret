// (C) Copyright 2015 Hewlett Packard Enterprise Development LP

export default function (result) {
  // convert ISO timestamps to Date objects
  let items = result.items.map((item) => ({
    ...item, created: new Date(item.created), modified: new Date(item.modified)
  }));
  return { ...result, items: items };
}
