import Image from "next/image";

export default function SmartImage({ src, ...props }) {
  const is1688 = src?.includes("alicdn.com");

  if (is1688) {
    // bypass optimizer for 1688
    return (
      <img
        src={src}
        alt={props.alt || ""}
        className={props.className}
        style={{ width: props.width, height: props.height }}
      />
    );
  }

  // normal optimized image (AWS, etc.)
  return <Image src={src} {...props} />;
}
