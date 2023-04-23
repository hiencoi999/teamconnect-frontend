import React from 'react';
import './PageNotFound.css';

const PageNotFound = () => {
  return (
    <div id="notfound">
      <div className="notfound">
        <div className="notfound-404">
          <h1>
            4<span></span>4
          </h1>
        </div>
        <h2>Oops! Page Not Be Found</h2>
        <p>Xin lỗi nhưng tôi vẫn chưa phát triển trang này ...</p>
        <a href="/">Quay lại trang chủ</a>
      </div>
    </div>
  );
};

export default PageNotFound;
