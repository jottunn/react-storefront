"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ProductCard } from "@/components/productList/ProductCard";
import { GroupedProduct } from "@/lib/product";
import { Product } from "@/saleor/api";
import "swiper/css";

export interface SwiperComponentProps {
  products: Product[];
  prevButtonClass: string;
  nextButtonClass: string;
}
export default function SwiperComponent({
  products,
  prevButtonClass,
  nextButtonClass,
}: SwiperComponentProps) {
  return (
    <Swiper
      slidesPerView={2}
      spaceBetween={10}
      modules={[Navigation]}
      navigation={{
        prevEl: `.${prevButtonClass}`,
        nextEl: `.${nextButtonClass}`,
      }}
      breakpoints={{
        // When the viewport width is >= 640px
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        // When the viewport width is >= 768px
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        // When the viewport width is >= 1024px
        1024: {
          slidesPerView: 5,
          spaceBetween: 40,
        },
      }}
    >
      {products.map((product, index) => (
        <SwiperSlide key={index}>
          <ProductCard
            key={product.id}
            product={product as GroupedProduct}
            priority={false}
            loading="lazy"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
