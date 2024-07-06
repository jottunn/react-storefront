"use client";
import React, { useEffect } from "react";

const SvgSprite = () => {
  useEffect(() => {
    fetch("/sprite.svg")
      .then((res) => res.text())
      .then((data) => {
        const div = document.createElement("div");
        div.style.display = "none";
        div.innerHTML = data;
        document.body.insertBefore(div, document.body.childNodes[0]);
      });
  }, []);

  return null;
};

export default SvgSprite;
