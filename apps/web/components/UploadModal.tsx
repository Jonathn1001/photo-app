'use client';
import { Button, Modal, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api-client';
import { ALLOWED_MIME, MAX_BYTES } from '@photo-app/shared/schemas';

export function UploadModal() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
      message.error('Unsupported file type');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_BYTES) {
      message.error('Max 5 MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  async function onFiles(file: File) {
    setBusy(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sig = await apiClient<any>('/api/photos/sign-upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, mimeType: file.type, bytes: file.size }),
      });
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('upload_preset', sig.upload_preset);
      fd.append('folder', sig.folder);
      const cdRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: 'POST',
        body: fd,
      });
      if (!cdRes.ok) throw new Error('Cloudinary upload failed');
      const cd = await cdRes.json();
      await apiClient('/api/photos', {
        method: 'POST',
        body: JSON.stringify({
          publicId: cd.public_id,
          url: cd.secure_url,
          width: cd.width,
          height: cd.height,
          bytes: cd.bytes,
          format: cd.format,
        }),
      });
      message.success('Uploaded');
      setOpen(false);
      router.refresh();
    } catch (e) {
      message.error(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        Upload Photo
      </Button>
      <Modal open={open} onCancel={() => setOpen(false)} footer={null} title="Upload">
        <Upload.Dragger
          beforeUpload={beforeUpload}
          customRequest={({ file }) => onFiles(file as File)}
          disabled={busy}
          maxCount={1}
          showUploadList={false}
        >
          <p>Click or drag a JPG/PNG/WebP (max 5 MB)</p>
        </Upload.Dragger>
      </Modal>
    </>
  );
}
