import React, { Suspense } from 'react'
import { Skeleton } from '../atom/Skeleton'
import { getWatchUrl, media } from '@/lib/api';
import Image from 'next/image';
import { InboxIcon } from 'lucide-react';
import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // ensure this path is correct

function CategoriesSection({ title, id, fetcher }) {
  return (
    <div className="py-8 px-6">
      <h2 id={id} className="text-2xl font-medium mb-6 scroll-m-[100px]">
        {title}
      </h2>
      <Suspense fallback={<CategoriesFallback />}>
        <CategoriesContent fetcher={fetcher} />
      </Suspense>
    </div>
  );
}

async function CategoriesContent({ fetcher }) {
  const data = await fetcher();

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[300px] py-12">
        <InboxIcon
          className="w-32 h-32 text-slate-400 mb-10"
          strokeWidth={1.2}
        />
        <p className="text-lg text-gray-500">No items found.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Carousel className="w-full max-w-full">
        <CarouselContent className="gap-4">
          {data.map((post) => (
            <CarouselItem
              key={post.id}
              className="min-w-[200px] basis-auto max-w-[200px]"
            >
              <Link
                href={getWatchUrl(post.id, post.media_type, post?.poster_path)}
              >
                <Image
                  src={media(post?.poster_path)}
                  alt=""
                  width={200}
                  height={300}
                  className="rounded-lg object-cover"
                  quality={30}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Scroll Buttons */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 z-100">
          <CarouselPrevious className="w-10 h-10 bg-white/80 text-black rounded-full shadow-md" />
        </div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-100">
          <CarouselNext className="w-10 h-10 bg-white/80 text-black rounded-full shadow-md" />
        </div>
      </Carousel>
    </div>
  );
}

export function CategoriesFallback() {
  return (
    <ul className="flex gap-4 w-full overflow-scroll scrollbar-hide">
      {new Array(12).fill(0).map((_, index) => (
        <Skeleton key={index} className="min-w-[200px] h-[300px]" />
      ))}
    </ul>
  );
}

export default CategoriesSection;
