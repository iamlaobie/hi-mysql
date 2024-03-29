'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getFirst = function (rows) {
  if (rows.length > 0) {
    const row = rows[0];
    const key = Object.keys(row)[0];
    return row[key];
  }
  throw new Error(`NO DATA:${this.sql}`);
}; /* eslint-disable no-underscore-dangle */


const getFirstRow = rows => rows[0] || {};

const createPool = options => {
  let hasSlave = false;
  const pool = _mysql2.default.createPoolCluster();
  if (Array.isArray(options)) {
    const [masterOptions, ...slaves] = options;
    pool.add('master', masterOptions);
    if (slaves && slaves.length) {
      hasSlave = true;
      slaves.forEach((opts, idx) => {
        pool.add(`slave${idx}`, opts);
      });
    }
  } else {
    pool.add('master', options);
  }
  const { charset, timezone } = Array.isArray(options) ? options[0] : options;
  Object.keys(pool._nodes).forEach(key => {
    pool._nodes[key].pool.on('connection', connection => {
      if (timezone) connection.query(`SET SESSION time_zone = '${timezone}'`);
      if (charset) connection.query(`SET NAMES ${charset}`);
    });
  });

  const query = (sql, args, opts = {}) => new Promise((resolve, reject) => {
    const { forceMaster } = opts;
    let p = pool.of('master');
    if (!forceMaster && hasSlave && sql.match(/^select/i)) {
      // 假定每个节点的算力一致，master承担平均每个节点query的70%
      const [masterOptions] = options;
      const masterLoadQuery = masterOptions.loadQuery || 0.7;
      const masterRatio = 1 / options.length * masterLoadQuery;
      const rnd = Math.random();
      if (masterRatio < rnd) {
        p = pool.of('slave*');
      }
    }
    p.query(sql, args, (err, rows) => {
      if (err) reject(err);else resolve(rows);
    });
  });

  const getConnection = (ns = 'master') => new Promise((resolve, reject) => {
    pool.getConnection(ns, (err, conn) => {
      if (err) reject(err);else resolve(conn);
    });
  });

  const queryOne = (sql, args, opts) => {
    const self = { sql };
    return query(sql, args, opts).then(getFirst.bind(self));
  };

  const queryObject = (sql, args, opts) => query(sql, args, opts).then(getFirstRow);

  const executeInsert = (sql, args, opts) => query(sql, args, opts).then(result => result.insertId);

  const executeUpdate = (sql, args, opts) => query(sql, args, opts).then(result => result.affectedRows > 0);

  const transaction = sqls => getConnection('master').then(conn => {
    const transQuery = (sql, args) => new Promise((resolve, reject) => {
      conn.query(sql, args, (err, rows) => {
        if (err) reject(err);else resolve(rows);
      });
    });
    return transQuery('START TRANSACTION').then(() => {
      const ps = [];
      sqls.forEach(sql => {
        ps.push(transQuery(...sql));
      });
      return Promise.all(ps).then(() => {
        transQuery('COMMIT');
        conn.release();
        return Promise.resolve(true);
      }).catch(err => {
        transQuery('ROLLBACK');
        conn.release();
        return Promise.reject(err);
      });
    });
  }).catch(err => Promise.reject(err));

  return {
    pool,
    query,
    queryOne,
    queryObject,
    executeInsert,
    executeUpdate,
    getConnection,
    transaction
  };
};

exports.default = { createPool };

