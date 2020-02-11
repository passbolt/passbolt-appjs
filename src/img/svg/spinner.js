import React from "react";

export default function SvgSpinnerIcon() {
  return (
    <span className="svg-icon spinner">
      <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g stroke="none" fill="none"><g id="loading_white" transform="translate(2, 2)" strokeWidth="4"><circle id="Oval" stroke="#CCC" cx="9" cy="9" r="9"/></g><g id="loading_white" transform="translate(2, 2)" strokeWidth="2"><path d="M18,9 C18,4.03 13.97,0 9,0" id="Shape" stroke="#000"><animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="0.35s" repeatCount="indefinite"/></path></g></g></svg>
    </span>
  );
}
