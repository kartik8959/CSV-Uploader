import React from "react";
import "./spinner.css";

const Spinner = (props) => {
  console.log(props, "props");
  return (
    <div className="loader-container">
      {props.isLoading && (
        <div className="loader">
          <span></span>
        </div>
      )}
    </div>
  );
};

export default Spinner;
