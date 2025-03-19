import { notFound } from 'next/navigation';
import CardsClient from './cards-client';

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { type: 'all' },
    { type: 'sold' },
    { type: 'checked' },
    { type: 'unchecked' }
  ];
}

interface PageProps {
  params: {
    type: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function CardsPage({ params }: PageProps) {
  const type = params.type;

  if (!['all', 'sold', 'checked', 'unchecked'].includes(type)) {
    notFound();
  }

  return <CardsClient type={type} />;
}