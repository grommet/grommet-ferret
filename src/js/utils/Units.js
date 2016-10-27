// (C) Copyright 2015 Hewlett Packard Enterprise Development LP

const UNITS = ['MB', 'GB', 'TB', 'PB'];

export default {
  // {value: , units: , max: }
  normalize (options) {
    let result = { ...options };
    while (result.value >= 1000) {
      result.value = Math.round(result.value / 100) / 10;
      if (result.units) {
        let unitsIndex = UNITS.indexOf(result.units);
        if (-1 != unitsIndex) {
          result.units = UNITS[unitsIndex + 1];
        }
      }
      if (result.max) {
        result.max = Math.round(result.max / 1000);
      }
    }
    return result;
  },

  // {value: , units: , }
  convert (options, newUnits) {
    let result = { ...options };
    let oldUnitsIndex = UNITS.indexOf(result.units);
    let newUnitsIndex = UNITS.indexOf(newUnits);
    while (oldUnitsIndex !== newUnitsIndex) {
      if (oldUnitsIndex > newUnitsIndex) {
        result.value = result.value * 1000;
        oldUnitsIndex -= 1;
      } else {
        result.value = Math.round(result.value / 100) / 10;
        oldUnitsIndex += 1;
      }
    }
    result.units = UNITS[newUnitsIndex];
    return result;
  }
};
