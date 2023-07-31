import axios from "axios";

export class ProductsService {
  static saveFileData = async (fileData) => {
    console.log(fileData, "filedata");
    const response = await axios.post("/upload", fileData);
    console.log(response);
    return response;
  };

  static removeData = async () => {
    let response = await axios.post("/clear-data");
    console.log("response from service cleared", response);
  };

  static fetchData = async () => {
    let response = await axios.get("/fetch-data");
    return response.data;
  };

  static loadMore = async () => {
    let response = await axios.get("/fetch-data/?limit=100");
    return response.data;
  };
}
