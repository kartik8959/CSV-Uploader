import express from "express";

import fs from "fs";
import csvParser from "csv-parser";
import csvtojson from "csvtojson";
import connectDB from "./config/db.js";
import path from "path";
import multer from "multer";

const app = express();
const connection = connectDB();
const upload = multer({ dest: "temp/" });

app.get("/", (req, resp) => {
  resp.send("hello Express");
});

app.post("/upload", upload.single("csvFile"), (req, resp) => {
  const csvFilePath = req.file.path;
  console.log(csvFilePath, "filepath");
  csvtojson()
    .fromFile(csvFilePath)
    .then((source) => {
      // Fetching the data from each row and inserting to the table "products"
      for (var i = 0; i < source.length; i++) {
        var UPC = source[i]["UPC"],
          PkgDesc = source[i]["PkgDesc"],
          Size = source[i]["Size"],
          Unit = source[i]["Unit"],
          AisleNumber = source[i]["AisleNumber"],
          ItemCode = source[i]["ItemCode"],
          Dept = source[i]["Dept"],
          DeptDesc = source[i]["DeptDesc"],
          NormlPrice = source[i]["NormlPrice"],
          QtySold = source[i]["QtySold"];

        var insertStatement =
          "INSERT INTO CSV_TB values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        var items = [
          UPC,
          PkgDesc,
          Size,
          Unit,
          AisleNumber,
          ItemCode,
          Dept,
          DeptDesc,
          NormlPrice,
          QtySold,
        ];

        // Inserting data of current row into database
        connection.query(insertStatement, items, (err, results, fields) => {
          if (err) {
            console.log("Unable to insert item at row ", i + 1);
            console.log(err);
            resp
              .status(500)
              .json({ error: "Error inserting data into the database." });
          }
        });
      }
      console.log("Records inserted into database successfully...!!");
      resp.json({ message: "Data inserted successfully!" });
    });
});

app.post("/clear-data", (req, resp) => {
  const tableName = "CSV_TB";
  const query = `TRUNCATE TABLE ${tableName}`;

  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error while clearing data", err);
      return resp.status(500).json({ error: "Internal server Error" });
    }
    resp.json({ message: `Successfully cleared all data from ${tableName}` });
  });
});

app.get("/fetch-data", (req, resp) => {
  const limit = parseInt(req.query.limit) || 0;
  const offset = parseInt(req.query.offset) || 100;
  const query = `SELECT * FROM CSV_TB LIMIT ${limit},${offset}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.log("error executing query", err);
      return resp.status(500).json({
        error: "Failed to fetch records",
        status: "Error",
        statusCode: resp.statusCode,
        reason: err.message,
      });
    }
    resp.status(200).json({
      results: results,
      count: results.length,
      status: "Success",
      statusCode: resp.statusCode,
    });
  });
});

app.listen("5000", () => {
  console.log("App listening on PORT 5000");
});
