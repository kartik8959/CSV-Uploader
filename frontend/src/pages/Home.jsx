import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { ProductsService } from "../productServices";
import Spinner from "../components/spinner/spinner";

const Home = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  // submit state
  const saveFile = async () => {
    setIsPreview(false);
    setIsLoading(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("csvFile", selectedFile);
        const response = await ProductsService.saveFileData(formData);
        setIsLoading(false);
      } else {
        setTypeError("No File has been uploaded !!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const showPreview = () => {
    if (excelFile) {
      setIsPreview(true);
      setFileData(fileData.slice(0, 100));
    } else {
      setTypeError("No File has been uploaded !!");
    }
  };

  const handleClearDB = () => {
    setSelectedFile(null);
    setFileData([]);
    ProductsService.removeData();
  };

  const handleFetchRecords = async () => {
    try {
      setIsLoading(true);
      let response = await ProductsService.fetchData();
      setFileData(response.results);
      setIsPreview(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      setIsLoading(true);
      let response = await ProductsService.loadMore();
      setFileData([...fileData, ...response.results]);
      setIsPreview(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // onchange event
  const handleFile = (e) => {
    setIsPreview(false);
    setSelectedFile(null);
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    let selectedFile = e.target.files[0];
    setSelectedFile(selectedFile);
    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
          const workbook = XLSX.read(e.target.result, { type: "buffer" });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          setFileData(data);
        };
      } else {
        setTypeError("Please select only excel file types");
        setExcelFile(null);
      }
    } else {
      console.log("Please select your file");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <div className="border border-black py-6 pl-4 md:pl-8 md:pr-16 lg:pl-8 lg:pr-20 xl:pl-24 xl:pr-28">
        <div className="flex flex-col md:flex-row">
          <div className="mb-4 md:mb-0">
            <button
              type="button"
              onClick={handleButtonClick}
              className="border border-black pl-2 md:pl-4 md:pr-10 xl:pl-4 xl:pr-20 mb-2 md:mb-0 font-semibold"
            >
              Select csv File
            </button>
            <input
              type="file"
              className="form-control"
              onChange={handleFile}
              hidden
              id="upload-image"
              ref={fileInputRef}
            />
            <p>
              <span className="text-green-600">
                {selectedFile && `Selected file :- ${selectedFile.name}`}
              </span>
            </p>
            {typeError && (
              <div className="text-red-400" role="alert">
                {typeError}
              </div>
            )}
          </div>

          <div className="md:pl-10">
            <p className="text-red-400 font-bold">Rules</p>
            <ul className="list-decimal px-2 md:px-8">
              <li className="text-sm">Price should be greater than 0</li>
              <li className="text-sm">Price should be less than $7</li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <label className="font-semibold" htmlFor="totalRecords">
            Total Records: {fileData && fileData.length}
          </label>
          <label className="ml-6 md:ml-8 font-semibold" htmlFor="criteria">
            Matching Criteria:
          </label>
        </div>

        <div className="flex flex-wrap mt-4">
          <button
            onClick={showPreview}
            className="border border-black font-semibold py-1 px-1 md:px-2 lg:px-4 xl:px-6 mb-2 md:mb-0 md:mr-2 lg:mr-4 xl:mr-6 rounded-md"
          >
            Preview
          </button>
          <button
            onClick={saveFile}
            className="border border-black font-semibold py-1 px-1 md:px-2 lg:px-4 xl:px-6 mb-2 md:mb-0 md:mr-2 lg:mr-4 xl:mr-6 rounded-md"
          >
            Save Records
          </button>
          <button
            onClick={handleClearDB}
            className="border border-black font-semibold py-1 px-1 md:px-2 lg:px-4 xl:px-6 mb-2 md:mb-0 md:mr-2 lg:mr-4 xl:mr-6 rounded-md"
          >
            Clear Database
          </button>
          <button
            onClick={handleFetchRecords}
            className="border border-black font-semibold py-1 px-1 md:px-2 lg:px-4 xl:px-6 mb-2 md:mb-0 md:mr-2 lg:mr-4 xl:mr-6 rounded-md"
          >
            Fetch Records from DB
          </button>
          <button
            onClick={handleLoadMore}
            className="border border-black font-semibold py-1 px-1 md:px-2 lg:px-4 xl:px-6 mb-2 md:mb-0 md:mr-2 lg:mr-4 xl:mr-6 rounded-md"
          >
            Load More
          </button>
        </div>
      </div>

      {/* table markup starts here */}

      <div className="max-w-100 ">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2">UPC</th>
              <th className="border px-4 py-2">PkgDesc</th>
              <th className="border px-4 py-2">Size</th>
              <th className="border px-4 py-2">AisleNumber</th>
              <th className="border px-4 py-2">ItemCode</th>
              <th className="border px-4 py-2">Dept</th>
              <th className="border px-4 py-2">DeptDesc</th>
              <th className="border px-4 py-2">NormlPrice</th>
              <th className="border px-4 py-2">QtySold</th>
            </tr>
          </thead>
          <tbody>
            {fileData && fileData.length === 0 && (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan={9}>
                  No Data Found !!
                </td>
              </tr>
            )}
            {isPreview &&
              fileData.length > 0 &&
              fileData.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.UPC}</td>
                  <td className="border px-4 py-2">{item.PkgDesc}</td>
                  <td className="border px-4 py-2">{item.Size}</td>
                  <td className="border px-4 py-2">{item.AisleNumber}</td>
                  <td className="border px-4 py-2">{item.ItemCode}</td>
                  <td className="border px-4 py-2">{item.Dept}</td>
                  <td className="border px-4 py-2">{item.DeptDesc}</td>
                  <td className="border px-4 py-2">{item.NormlPrice}</td>
                  <td className="border px-4 py-2">{item.QtySold}</td>
                </tr>
              ))}
          </tbody>
          <Spinner isLoading={isLoading} />
        </table>
      </div>
    </>
  );
};

export default Home;
