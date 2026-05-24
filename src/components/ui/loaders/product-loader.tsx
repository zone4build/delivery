import ContentLoader from 'react-content-loader';

const ProductLoader = (props: any) => {
  const Loader = ContentLoader as any;
  return (
    <Loader
      speed={2}
      width={'100%'}
      height={'100%'}
      viewBox="0 0 400 520"
      backgroundColor="#f3f4f6"
      foregroundColor="#e5e7eb"
      className="rounded-[2.5rem] overflow-hidden"
      {...props}
    >
      {/* Product Image Area */}
      <rect x="15" y="15" rx="32" ry="32" width="370" height="340" />

      {/* Product Name */}
      <rect x="25" y="385" rx="8" ry="8" width="85%" height="28" />

      {/* Unit/Subtitle */}
      <rect x="25" y="425" rx="4" ry="4" width="30%" height="12" />

      {/* Price Area */}
      <rect x="25" y="475" rx="6" ry="6" width="35%" height="24" />

      {/* Cart Button Placeholder */}
      <rect x="280" y="465" rx="20" ry="20" width="95" height="40" />
    </Loader>
  );
};

export default ProductLoader;
