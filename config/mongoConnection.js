import { MongoClient } from "mongodb";
import { mongoConfig as config } from "./settings.js";

let _connection, _db;

const dbConnection = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(config.serverUrl);
    _db = _connection.db(config.dbName);
  }

  return _db;
};

const closeConnection = async () => {
  await _connection.close();
};

export { dbConnection, closeConnection };
