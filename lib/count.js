var _ = require('lodash')
var filter = require('./filter')

module.exports = function (table, options) {
  var query

  options = _.extend({
    $orderBy: {},
    $select: {},
    $filter: {}
  }, options)

  query = table.select(table.star().count())
  query = query.from(table)
  query = filter(query, table, options.$filter, {})

  // for (var filter in options.$filter) {
  //   query = query.where(table[filter].equals(options.$filter[filter]))
  // }

  return query.toQuery()
}
