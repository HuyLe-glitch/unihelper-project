import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditDepartment = ({ title = "Đang phát triển", description = "Tính năng này sẽ được cập nhật trong thời gian tới." }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-20 select-none">
      <div className="bg-white shadow-md rounded-xl p-10 max-w-lg w-full text-center border border-gray-200">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">
          {title}
        </h2>

        <p className="text-gray-500 mb-6">
          {description}
        </p>

        <div className="animate-pulse">
          <div className="h-3 w-3 bg-indigo-500 rounded-full inline-block mx-1"></div>
          <div className="h-3 w-3 bg-indigo-500 rounded-full inline-block mx-1"></div>
          <div className="h-3 w-3 bg-indigo-500 rounded-full inline-block mx-1"></div>
        </div>
      </div>
    </div>
  );
};

export default EditDepartment;
