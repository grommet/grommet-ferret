// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

const TRACE_PARSING = false;
const TRACE_MATCHING = false;

// don't convert timestamps, MAC addresses, or WWNs to attribute:value
// This pattern matches the name: ^[^\d:'"\s]{2}[^:'"\s]+
// We allow for the value to be optionally be quoted. So, we repeat the name
// pattern three times, once for single quoted value, once for double quoted
// value, and lastly with no quotes.
// We don't build this programmatically for better performance.
const ATTRIBUTE_REGEXP =
  /^[^\d:'"\s]{1}[^:'"\s]*:'[^']+'|^[^\d:'"\s]{1}[^:'"\s]*:"[^"]+"|^[^\d:'"\s]{1}[^:'"\s]*:[^'"\s]+/;
// allow for text to contain quotes
const TEXT_REGEXP = /^[^'"\s]+|^'[^']+'|^"[^"]+"/;

const TIMESTAMP_REGEXP = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

// TODO: This won't work in deployment context, use locally for now
//var StringConvert = require('../../src/js/utils/StringConvert');
const StringConvert = {
  unquoteIfNecessary: (text) => {
    // remove surrounding quotes
    if ((text[0] === '\'' && text[text.length - 1] === '\'') ||
      (text[0] === '"' && text[text.length - 1] === '"')) {
      text = text.slice(1, text.length - 1);
    }
    return text;
  }
};

export function filterUserQuery (items, userQuery) {
  // handle quoted strings, e.g. 'a b' c "d e"
  const regexp = /'([^']+)'|"([^"]+)"|(\w+)/g;
  let matches;
  let terms = [];
  while ((matches = regexp.exec(userQuery)) !== null) {
    if (matches[1]) {
      terms.push(new RegExp(matches[1], 'i'));
    } else if (matches[2]) {
      terms.push(new RegExp(matches[2], 'i'));
    } else if (matches[3]) {
      terms.push(new RegExp(matches[3], 'i'));
    }
  }

  const result = items.filter((item) => {
    let unmatchedTerms = terms.slice(0);
    Object.keys(item).forEach(key => {
      const value = item[key];
      unmatchedTerms = unmatchedTerms.filter((term) => {
        return term.test(value);
      });
      if (unmatchedTerms.length === 0) {
        return true;
      }
    });
    return (unmatchedTerms.length === 0);
  });
  return result;
}

// An attribute term in an Expression.
function AttributeTerm (text) {
  this._not = false;

  const parts = text.toLowerCase().split(':');
  this._name = parts[0];
  this._value = StringConvert.unquoteIfNecessary(parts[1]);

  this.not = (not) => {
    this._not = not;
  };

  this.isRelatedTo = (term) => {
    return (this._name === term._name);
  };

  this.matches = (item) => {
    let result = ((this._not || 'null' === this._value) ? true : false);
    Object.keys(item).some(key => {
      const value = item[key];
      if ('attributes' === key) {
        result = this.matches(value);
        if (result || this._not) {
          return true;
        }
      } else {
        if (key.toLowerCase() === this._name &&
          ((value && value.toLowerCase() === this._value) ||
          (! value && 'null' === this._value))) {
          result = (this._not ? false : true);
          return true;
        }
      }
    });
    if (result && TRACE_MATCHING && item.uri) {
      console.log('!!! ATTRIBUTE', result, item.uri,
        this._not ? 'NOT' : '', this._name, this._value);
    }
    return result;
  };

  this.toString = (prefix) => {
    return `${prefix}${this._not ? ' not ' : ''}${this._name}:${this._value}`;
  };
}

// A text term in an Expression.
function TextTerm (text) {
  this._not = false;
  this._text = text;

  // if the string is quoted, require matching at both ends
  const unquoted = StringConvert.unquoteIfNecessary(text);
  if (text === unquoted) {
    this._regexp = new RegExp(text, 'i');
  } else {
    this._regexp = new RegExp(`^${unquoted}$`, 'i');
  }

  this.not = (not) => {
    this._not = not;
  };

  this.isRelatedTo = () => {
    return false;
  };

  this.matches = (item) => {
    let result = (this._not ? true : false);
    let matched;
    Object.keys(item).forEach(key => {
      const value = item[key];
      if ('attributes' === key) {
        result = this.matches(value);
        if (result || this._not) {
          return true;
        }
      } else {
        // Don't match timestamps against short strings
        if (value && this._regexp.test(value) &&
          (text.length > 5 || ! TIMESTAMP_REGEXP.test(value))) {
          result = (this._not ? false : true);
          matched = `${key}:${value}`;
          return true;
        }
      }
    });
    if (result && TRACE_MATCHING) {
      console.log('!!! REGEXP', result, item.uri, matched,
        this._not ? 'NOT' : '', this._regexp);
    }
    return result;
  };

  this.toString = (prefix) => {
    return prefix + (this._not ? ' not ' : '') + this._regexp;
  };
}

// A simple expression in a query.
// These can be nested for more complex expressions.
// They have a _left term, a _right term, and an _op (AND or OR).
function Expression () {

  this.op = (op) => {
    if (! this._op) {
      this._op = op;
    } else {
      // already have an op, nest
      // If the right is a simple term, convert it to an expression.
      if (! this._right._left) {
        let expression = new Expression();
        expression.addTerm(this._right);
        expression.op(op);
        this._right = expression;
      } else {
        // right is an expression, add to it
        this._right.op(op);
      }
    }
  };

  this.addTerm = (term) => {
    if (! this._left) {
      this._left = term;
    } else if (! this._right) {
      this._right = term;
      if (! this._op) {
        if (this._left.isRelatedTo(this._right)) {
          this._op = 'OR';
        } else {
          this._op = 'AND';
        }
      }
    } else {
      // We already have a left and a right.
      // If the right is a simple term, convert it to an expression.
      if (! this._right._left) {
        let expression = new Expression();
        expression.addTerm(this._right);
        this._right = expression;
      }
      // Add the term to the right expression.
      this._right.addTerm(term);
    }
  };

  this.isRelatedTo = () => {
    return false;
  };

  this.matches = (item) => {
    let result = false;
    if (this._left) {
      result = this._left.matches(item);
    }
    if ((result && 'AND' === this._op) ||
      (! result && 'OR' === this._op)) {
      if (this._right) {
        result = this._right.matches(item);
      } else {
        result = false;
      }
    }
    if (result && TRACE_MATCHING) {
      console.log('!!! EXPRESSION', result, item.uri, this._op);
    }
    return result;
  };

  this.toString = (prefix) => {
    prefix = prefix || '';
    let result = '';
    if (this._left) {
      result += this._left.toString(prefix + '  ') + "\n";
    }
    if (this._op) {
      result += prefix + this._op + "\n";
    }
    if (this._right) {
      result += this._right.toString(prefix + '  ') + "\n";
    }
    return result;
  };
}

// parser helper functions

function traceParsing (message) {
  if (TRACE_PARSING) {
    console.log('!!! ' + message);
  }
}

function parseSpace (text) {
  return (' ' === text[0] ? 1 : 0);
}

function parseParens (text, expression) {
  let result = 0;
  if ('(' === text[0]) {
    traceParsing('--begin-paren--');
    // NOTE: This doesn't handle nested parens yet.
    const endIndex = text.indexOf(')');
    const subExpression = parseQuery(text.slice(1, endIndex));
    traceParsing('--end-paren--');
    expression.addTerm(subExpression);
    result = endIndex + 1;
  }
  return result;
}

function parseAnd (text, expression) {
  let result = 0;
  if ('AND' === text.slice(0, 3)) {
    traceParsing('--and--');
    result = 3;
    expression.op('AND');
  }
  return result;
}

function parseOr (text, expression) {
  let result = 0;
  if ('OR' === text.slice(0, 2)) {
    traceParsing('--or--');
    result = 2;
    expression.op('OR');
  }
  return result;
}

function parseNot (text, expression) {
  let result = 0;
  if ('NOT' === text.slice(0, 3)) {
    traceParsing('--not--');
    result = 3;
    expression.negateNextTerm();
  }
  return result;
}

function parseAttribute (text, expression) {
  let result = 0;
  const matches = text.match(ATTRIBUTE_REGEXP);
  if (matches) {
    traceParsing('--attribute--');
    // attribute:value
    result = matches[0].length;
    const term = new AttributeTerm(matches[0]);
    expression.addTerm(term);
  }
  return result;
}

function parseText (text, expression) {
  let result = 0;
  const matches = text.match(TEXT_REGEXP);
  if (matches) {
    traceParsing('--text--');
    result = matches[0].length;
    const term = new TextTerm(matches[0]);
    expression.addTerm(term);
  }
  return result;
}

function parseQuery (query) {

  const parsers = [
    parseSpace,
    parseParens,
    parseAnd,
    parseOr,
    parseNot,
    parseAttribute,
    parseText
  ];
  let remaining = query;
  let expression = new Expression();
  traceParsing('--parse-- ' + query);

  while (remaining.length > 0) {
    for (var i = 0; i < parsers.length; i += 1) {
      const parser = parsers[i];
      const length = parser(remaining, expression);
      if (length > 0) {
        remaining = remaining.slice(length);
        traceParsing(`  parsed ${length} leaving ${remaining}`);
        break;
      }
    }
  }

  traceParsing('--parsed-- ' + "\n" + expression.toString());

  return expression;
}

export function filterQuery (items, query) {
  const expression = parseQuery(query);
  const result = items.filter((item) => {
    return expression.matches(item);
  });
  return result;
}

export function filterFilter (items, filterParam) {
  // convert filter to something more useful for comparison
  let filter = {};
  (typeof filterParam === 'string' ? [filterParam] : filterParam)
    .forEach((term) => {
      const parts = term.split(':');
      if (! filter[parts[0]]) {
        filter[parts[0]] = [];
      }
      filter[parts[0]].push(parts[1].toLowerCase());
    });
  const result = items.filter((item) => {
    let match = false;
    for (let name in filter) {
      match = filter[name].some((value) => {
        return (item[name].toLowerCase() === value);
      });
      if (! match) {
        break;
      }
    }
    return match;
  });
  return result;
}

// http://my.opera.com/GreyWyvern/blog/show.dml/1671288
// Do not attempt to change '==' to '===' in the following
// method. Avoid type comparison is done on purpose.
function alphanum (a, b) {
  function chunkify(t) {
    var tz = [],
      x = 0,
      y = -1,
      n = 0, i, j;
    try {
      while (t && (i = (j = t.charAt(x++)).charCodeAt(0))) {
        var m = (i == 46 || (i >= 48 && i <= 57));
        if (m !== n) {
          tz[++y] = "";
          n = m;
        }
        tz[y] += j;
      }
    } catch (e) {
      console.log('!!! chunkify exception', t, e);
    }
    return tz;
  }

  var aa = chunkify(a);
  var bb = chunkify(b);

  for (var x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      var c = Number(aa[x]),
        d = Number(bb[x]);
      if (c == aa[x] && d == bb[x]) {
        return c - d;
      } else {
        return (aa[x] > bb[x]) ? 1 : -1;
      }
    }
  }
  return aa.length - bb.length;
}

function attributeValue (item, attribute) {
  return (item.hasOwnProperty('attributes') &&
    item.attributes.hasOwnProperty(attribute)) ? item.attributes[attribute] :
    item[attribute];
}

export function sortItems (items, sort) {
  const parts = sort.split(':');
  const attribute = parts[0];
  const ascending = ('asc' === parts[1]);
  items.sort((m1, m2) => {
    const first = (ascending ? m1 : m2);
    const second = (ascending ? m2 : m1);
    const firstValue = attributeValue(first, attribute);
    const secondValue = attributeValue(second, attribute);
    if (typeof firstValue === 'number' && typeof secondValue === 'number') {
      return firstValue - secondValue;
    } else if (typeof firstValue === 'string' &&
      typeof secondValue === 'string') {
      return alphanum(firstValue.toLowerCase(), secondValue.toLowerCase());
    } else {
      console.log('!!! Invalid sort types for', attribute, firstValue,
        secondValue);
      return 0;
    }
  });
}
