var define = require('./define')
var insert = require('./insert')
var query = require('./query')
var count = require('./count')
var upd = require('./update')
var remove = require('./remove')
var parse = require('./parse')
var sql = require('sql')

module.exports = function (model, dialect, prefix) {
  prefix = prefix || ''
  sql.setDialect(dialect)

  var tableList = define(model, dialect, prefix).map(function (t) {
    return sql.define(t)
  })

  var tables = {}
  for (var entitySetName in model.entitySets) {
    tables[entitySetName] = tableList.filter(function (t) {
      return t._name === (prefix + model.entitySets[entitySetName].entityType.replace(model.namespace + '.', ''))
    })[0]
  }

  return {
    create: function () {
      // return tableList.map(function (t) {
      //   return t.create().ifNotExists().toQuery()
      // })
      const queries = [];
      tableList.forEach(function (t) {
        queries.push(t.create().ifNotExists().toQuery());
        t.columns.forEach(function (col) {
          const q = {text: `ALTER TABLE "${t._name}" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.dataType}`, values: []};
          queries.push(q);
        });
      });
      return queries;
    },
    drop: function () {
      return tableList.map(function (t) {
        return t.drop().toQuery()
      })
    },
    insert: function (entitySetName, doc) {
      doc = insert(doc, entitySetName, model)

      return tables[entitySetName].insert(doc).toQuery()
    },
    query: function (entitySetName, mongoOptions) {
      return query(tables[entitySetName], mongoOptions, entitySetName, model)
    },
    count: function (entitySetName, mongoOptions) {
      return count(tables[entitySetName], mongoOptions)
    },
    parse: function (entitySetName, doc) {
      return parse(doc, entitySetName, model)
    },
    update: function (entitySetName, query, update) {
      return upd(tables[entitySetName], query, update, entitySetName, model)
    },
    delete: function (entitySetName, query) {
      return remove(tables[entitySetName], query, entitySetName, model)
    }
  }
}
