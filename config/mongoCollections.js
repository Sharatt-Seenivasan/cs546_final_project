import { dbConnection, closeConnection } from "./mongoConnection.js";

const getCollection = (collection) => {
  let _col;
  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

export const usersCollection = getCollection("users");
export const birdsCollection = getCollection("birds");
