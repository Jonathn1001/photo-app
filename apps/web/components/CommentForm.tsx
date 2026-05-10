'use client';
import { Button, Input, App } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { apiClient, ApiError } from '@/lib/api-client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function CommentForm({ photoId }: { photoId: string }) {
  const [value, setValue] = useState('');
  const [pending, start] = useTransition();
  const router = useRouter();
  const { message } = App.useApp();

  function submit() {
    const content = value.trim();
    if (!content) return;
    start(async () => {
      try {
        await apiClient(`/api/photos/${photoId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
        setValue('');
        router.refresh();
      } catch (e) {
        message.error(e instanceof ApiError ? e.message : 'Failed');
      }
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={submit}
        placeholder="Add a comment…"
        maxLength={500}
        size="large"
        style={{ borderRadius: 999, paddingLeft: 16 }}
      />
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<SendOutlined />}
        loading={pending}
        disabled={!value.trim()}
        onClick={submit}
      />
    </div>
  );
}
