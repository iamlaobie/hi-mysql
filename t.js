import x from './index';
const config = {
        "host": "127.0.0.1",
        "port": 3306,
        "user": "root",
        "password": "123456",
        "database": "test"
      };
const options = [config, config];
const pool = x.createPool(options);

pool.query('select * from users').then(console.log)
