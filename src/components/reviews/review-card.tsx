import { useTranslation } from 'next-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import cn from 'classnames';
import Rating from '@/components/ui/rating-badge';
import dayjs from 'dayjs';
import { Image } from '@/components/ui/image';
import { CheckedIcon } from '@/components/icons/checked';
import { LikeIcon } from '@/components/icons/like-icon';
import { MenuIcon } from '@/components/icons/menu-icon';
import { DislikeIcon } from '@/components/icons/dislike-icon';
import { productPlaceholder } from '@/lib/placeholders';
import { useCreateFeedback } from '@/framework/product';
import type { Review } from '@/types';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useUser } from '@/framework/user';
import Avatar from '@/components/ui/avatar';
type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  const { createFeedback } = useCreateFeedback();
  const { isAuthorized } = useUser();

  const {
    id,
    comment,
    rating,
    photos,
    created_at,
    user,
    negative_feedbacks_count,
    positive_feedbacks_count,
    my_feedback,
  } = review;
  function feedback(value: { positive: boolean } | { negative: boolean }) {
    if (!isAuthorized) {
      openModal('LOGIN_VIEW');
      return;
    }
    createFeedback({
      model_id: id,
      model_type: 'Review',
      ...value,
    });
  }
  function openAbuseReportModal() {
    if (!isAuthorized) {
      openModal('LOGIN_VIEW');
      return;
    }
    openModal('ABUSE_REPORT', {
      model_id: id,
      model_type: 'Review',
    });
  }

  const handleImageClick = (idx: number) => {
    openModal('REVIEW_IMAGE_POPOVER', {
      images: photos,
      initSlide: idx,
    });
  };

  return (
    <div className="my-6 rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Avatar
            src={user?.profile?.avatar?.thumbnail ?? `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
            title={user?.name}
            className="h-12 w-12 border-2 border-accent/20"
          />
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-bold text-heading capitalize">{user?.name}</span>
              <div className="flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                <CheckedIcon className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                {t('text-verified-purchase')}
              </div>
            </div>
            <div className="text-[11px] text-gray-400">
              {dayjs(created_at).format('MMMM D, YYYY')}
            </div>
          </div>
        </div>
        <Rating rating={rating} variant="small" />
      </div>

      <p className="mb-5 text-base leading-relaxed text-body-dark">
        {comment}
      </p>

      {photos && photos.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-3">
          {photos.map((photo, idx) => (
            <div
              className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border border-gray-100 transition-all hover:border-accent"
              key={photo.id}
              onClick={() => handleImageClick(idx)}
            >
              <Image
                src={photo.thumbnail ?? productPlaceholder}
                alt={user.name ?? ''}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button
            className={cn(
              'flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 rtl:space-x-reverse',
              my_feedback?.positive
                ? 'bg-accent text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            )}
            disabled={my_feedback?.positive}
            onClick={() => feedback({ positive: true })}
          >
            <LikeIcon className="h-3.5 w-3.5" />
            <span>{positive_feedbacks_count}</span>
          </button>
          <button
            className={cn(
              'flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 rtl:space-x-reverse',
              my_feedback?.negative
                ? 'bg-red-500 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            )}
            onClick={() => feedback({ negative: true })}
            disabled={my_feedback?.negative}
          >
            <DislikeIcon className="h-3.5 w-3.5" />
            <span>{negative_feedbacks_count}</span>
          </button>
        </div>

        <Menu
          as="div"
          className="relative inline-block ltr:text-left rtl:text-right"
        >
          <Menu.Button className="group rounded-full p-1.5 transition-colors hover:bg-gray-50">
            <MenuIcon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-accent" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              as="ul"
              className={cn(
                'absolute bottom-full mb-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl focus:outline-none ltr:right-0 ltr:origin-bottom-right rtl:left-0 rtl:origin-bottom-left'
              )}
            >
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={openAbuseReportModal}
                    className={cn(
                      'flex w-full items-center px-4 py-2 text-xs font-bold transition duration-200 focus:outline-none',
                      active ? 'bg-red-50 text-red-600' : 'text-gray-600'
                    )}
                  >
                    {t('text-report-abuse')}
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}
