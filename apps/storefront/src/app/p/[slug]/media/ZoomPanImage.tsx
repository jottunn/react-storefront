"use client";
import React from "react";
import Image from "next/image";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="tools">
      <button onClick={() => zoomIn()}>+</button>
      <button onClick={() => zoomOut()}>-</button>
      <button onClick={() => resetTransform()}>x</button>
    </div>
  );
};

interface ZoomPanImageProps {
  src: string;
  alt: string;
}

const ZoomPanImage = ({ src, alt }: ZoomPanImageProps) => {
  return (
    <TransformWrapper initialScale={1} initialPositionX={0} initialPositionY={0}>
      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <>
          {/* <Controls /> */}
          <TransformComponent>
            <Image
              className="m-auto"
              src={src}
              alt={alt}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              loading="lazy"
              unoptimized
            />
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
};

export default ZoomPanImage;
