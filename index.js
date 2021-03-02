import mysql from 'mysql';

const getFirst = (rows) => {
  if (rows.length > 0) {
    const row = rows[0];
    const key = Object.keys(row)[0];
    return row[key];
  }
  throw new Error(`NO DATA:${this.sql}`);
};

const getFirstRow = rows => rows[0] || {};

const createPool = (options) => {
  let pool;
  let slavePool;
  if (Array.isArray(options)) {
    const [masterOptions, slaveOptions] = options;
    pool = mysql.createPool(masterOptions);
    if (slaveOptions) {
      slavePool = mysql.createPool(slaveOptions);
    }
  } else {
    pool = mysql.createPool(options);
  }
  const { charset, timezone } = options;
  pool.on('connection', (connection) => {
    if (timezone) connection.query(`SET SESSION time_zone = '${timezone}'`);
    if (charset) connection.query(`SET NAMES ${charset}`);
  });

  slavePool && slavePool.on('connection', (connection) => {
    if (timezone) connection.query(`SET SESSION time_zone = '${timezone}'`);
    if (charset) connection.query(`SET NAMES ${charset}`);
  });
  const query = (sql, args) => new Promise(((resolve, reject) => {
    let p = pool;
    if (slavePool && sql.match(/^select/i)) {
      p = slavePool;
    }
    p.query(sql, args, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }));

  const getConnection = () => new Promise(((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  }));

  const queryOne = (sql, args) => {
    const self = { sql };
    return query(sql, args).then(getFirst.bind(self));
  };

  const queryObject = (sql, args) => query(sql, args).then(getFirstRow);

  const executeInsert = (sql, args) => query(sql, args).then(result => result.insertId);

  const executeUpdate = (sql, args) => query(sql, args).then(result => (result.affectedRows > 0));

  const transaction = sqls => getConnection().then((conn) => {
    const transQuery = (sql, args) => new Promise(((resolve, reject) => {
      conn.query(sql, args, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }));
    return transQuery('START TRANSACTION').then(() => {
      const ps = [];
      sqls.forEach((sql) => {
        ps.push(transQuery(...sql));
      });
      return Promise.all(ps).then(() => {
        transQuery('COMMIT');
        conn.release();
        return Promise.resolve(true);
      }).catch((err) => {
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
    transaction,
  };
};

export default { createPool };
