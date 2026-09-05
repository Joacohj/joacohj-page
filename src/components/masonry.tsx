'use client'
import Image from "next/image";
import { Masonry } from "react-motion-gallery";
import "react-motion-gallery/styles.css";
const images = [
    { src: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&h=1600&q=80", width: 1200, height: 1600 },
    { src: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=1200&h=900&q=80", width: 1200, height: 900 },

    { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&h=1500&q=80", width: 1200, height: 1500, span: { 0: 1, 1100: 2 } },
    { src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=800&q=80", width: 1200, height: 800 },
];
export function BasicMasonry() {
    return (
        <Masonry
            columns={{ 0: 1, 700: 2, 1100: 3 }}
            gap={{ 0: 12, 1100: 20 }}
            className="w-full"
        >
            {images.map((image, index) => (
                <Masonry.Item
                    key={image.src}
                    width={image.width}
                    height={image.height}
                    span={image.span}
                >
                    <img
                    width={image.width}
                    height={image.height}
                    loading="eager"
                        src={image.src}
                        alt={`Masonry item ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                    />
                </Masonry.Item>
            ))}
        </Masonry>
    );
}