'use client';
import { Button, Form, Input, message } from 'antd';
import { apiClient, ApiError } from '@/lib/api-client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function CommentForm({ photoId }: { photoId: string }) {
  const [form] = Form.useForm();
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Form form={form} onFinish={(v) => start(async () => {
      try {
        await apiClient(`/api/photos/${photoId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ content: v.content }),
        });
        form.resetFields();
        router.refresh();
      } catch (e) {
        message.error(e instanceof ApiError ? e.message : 'Failed');
      }
    })} layout="inline">
      <Form.Item name="content" rules={[{ required: true, message: 'Required' }]} style={{ flex: 1 }}>
        <Input placeholder="Add a comment…" />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary" loading={pending}>Post</Button>
      </Form.Item>
    </Form>
  );
}
