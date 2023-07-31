import mysql from "mysql2";
const connectDB = () => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "kartik_db",
  });
  return connection;
};

export default connectDB;
