'use client';
import { DiscoverProfile } from '@/app/discover/DiscoverProfile';
import { AllCaughtUp } from '@/components/AllCaughtUp';
import useOnScreen from '@/hooks/useOnScreen';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { GetUser } from 'types';

const PROFILES_PER_PAGE = 4;
export function DiscoverProfiles() {
  const searchParams = useSearchParams();
  const bottomElRef = useRef<HTMLDivElement>(null);
  const isBottomOnScreen = useOnScreen(bottomElRef);
  const qc = useQueryClient();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [
      'discover',
      {
        gender: searchParams.get('gender'),
        relationshipStatus: searchParams.get('relationship-status'),
      },
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('limit', PROFILES_PER_PAGE.toString());
      newSearchParams.set('offset', pageParam);

      const res = await fetch(`/api/users?${newSearchParams.toString()}`);
      if (!res.ok) {
        throw new Error('Error fetching discover profiles.');
      }

      const users = (await res.json()) as GetUser[];

      for (const user of users) {
        qc.setQueryData(['users', user.id], user);
      }
      return users;
    },
    getNextPageParam: (lastPage, pages) => {
      // If the `pages` `length` is 0, that means there is not a single profile to load
      if (pages.length === 0) return undefined;

      // If the `lastPage` is less than the limit, that means the end is reached
      if (lastPage.length < PROFILES_PER_PAGE) return undefined;

      // This will serve as the `offset`, add 1 to load next page
      return pages.flat().length + 1;
    },
    staleTime: 60000 * 10,
  });

  useEffect(() => {
    if (!isBottomOnScreen) return;
    if (!data) return;
    if (!hasNextPage) return;

    fetchNextPage();
  }, [isBottomOnScreen]);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
        {status === 'loading' ? (
          <p>Loading profiles...</p>
        ) : status === 'error' ? (
          <p>Error loading profiles.</p>
        ) : (
          data?.pages
            .flat()
            .map((profile) => (
              <DiscoverProfile key={profile.id} user={profile} />
            ))
        )}
      </div>
      <div className="mt-4 h-4" ref={bottomElRef}></div>
      {!isFetching && !hasNextPage && <AllCaughtUp />}
    </>
  );
}
