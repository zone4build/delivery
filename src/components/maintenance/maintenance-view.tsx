import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

interface MaintenanceViewProps {
  title?: string;
  description?: string;
  image?: any;
  shopName?: string;
}

const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  title,
  description,
  image,
  shopName,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 py-10 text-center">
      <div className="relative mb-8 h-64 w-full max-w-lg md:h-80">
        {image?.original ? (
          <Image
            src={image.original}
            alt={title || 'Maintenance'}
            fill
            className="object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-200">
            <span className="text-gray-400">Maintenance Image</span>
          </div>
        )}
      </div>

      <h1 className="mb-4 text-3xl font-bold text-heading md:text-4xl lg:text-5xl">
        {title || `Our shop ${shopName || ''} is currently under maintenance`}
      </h1>

      <p className="max-w-2xl text-lg leading-relaxed text-body">
        {description ||
          "We're currently performing some scheduled maintenance to improve your experience. We'll be back online shortly!"}
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
          Thank you for your patience
        </p>
        <div className="h-1 w-20 rounded-full bg-accent" />
      </div>
    </div>
  );
};

export default MaintenanceView;
