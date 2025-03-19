'use client';

import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import CardsClient from './cards-client';

export const dynamicParams = false;

export const generateStaticParams = () => {
  return [
    { type: 'all' },
    { type: 'sold' },
    { type: 'checked' },
    { type: 'unchecked' }
  ];
};

export default function CardsPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;

  if (!['all', 'sold', 'checked', 'unchecked'].includes(type)) {
    notFound();
  }

  return <CardsClient type={type} />;
}