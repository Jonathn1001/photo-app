'use client';
import dynamic from 'next/dynamic';

const UploadModal = dynamic(() => import('./UploadModal').then(m => m.UploadModal), { ssr: false });

export function UploadModalLazy() {
  return <UploadModal />;
}
