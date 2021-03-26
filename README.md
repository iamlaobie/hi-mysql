# hi-mysql

```
import x from './index';
const master = {
  host: "192.168.99.100",
  port: 3306,
  user: "root",
  password: "***",
  database: "test"
};
const slave1 = {
  host: "192.168.99.101",
  port: 3306,
  user : "developer",
  password: "***",
  database: "test"
}

const options = [master, slave];

// single instance
const pool = x.createPool(master);

// multiple instance, the first argument is master node
const pool = x.createPool([master, slave1, ... slaveN]);

const rows = await pool.query('select * from t');
const row = await pool.queryObject('select * from t limit 1');
const autoIncrementId = await pool.executeInsert('insert into t set name = ?, val = ?', ['a', 1]);
const affectedRows = await pool.executeUpdate('update t set val = 2');
const masterConn = pool.getConnection('master');
const slaveConn = pool.getConnection('slave');

```
