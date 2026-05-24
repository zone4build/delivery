import ContentLoader from 'react-content-loader';

const ShopLoader = (props: any) => {
  const Loader = ContentLoader as any;
  return (
    <Loader
      speed={2}
      width={400}
      height={100}
      viewBox="0 0 400 100"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      className="w-full"
      {...props}
    >
      {/* Shop Logo (Circle) */}
      <circle cx="50" cy="50" r="32" />

      {/* Shop Name */}
      <rect x="100" y="30" rx="4" ry="4" width="200" height="15" />

      {/* Shop Address */}
      <rect x="100" y="55" rx="4" ry="4" width="150" height="10" />
    </Loader>
  );
};

export default ShopLoader;
