'use client';
import { Button, Modal, Upload, App } from 'antd';
import type { UploadProps } from 'antd';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api-client';
import { ALLOWED_MIME, MAX_BYTES } from '@photo-app/shared/schemas';

export function UploadModal() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

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
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={() => setOpen(true)}
        style={{ marginBottom: 8 }}
      >
        New upload
      </Button>
      <Modal
        open={open}
        onCancel={() => !busy && setOpen(false)}
        footer={null}
        title="New post"
        centered
        width={520}
        destroyOnClose
      >
        <p style={{ color: '#737373', marginTop: -4, marginBottom: 20 }}>
          Share a photo with your circle.
        </p>
        <Upload.Dragger
          beforeUpload={beforeUpload}
          customRequest={({ file }) => onFiles(file as File)}
          disabled={busy}
          maxCount={1}
          showUploadList={false}
          style={{ borderRadius: 16, padding: '12px 0' }}
        >
          <p className="ant-upload-drag-icon" style={{ marginBottom: 12 }}>
            <PictureOutlined style={{ fontSize: 36, color: '#525252' }} />
          </p>
          <p
            className="ant-upload-text"
            style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#171717' }}
          >
            {busy ? 'Uploading…' : 'Drop your photo here'}
          </p>
          <p className="ant-upload-hint" style={{ fontSize: 13, color: '#737373' }}>
            or click to browse from your device
          </p>
          <div
            style={{
              marginTop: 16,
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#a3a3a3',
              letterSpacing: '0.08em',
            }}
          >
            JPG · PNG · WEBP · MAX 5MB
          </div>
        </Upload.Dragger>
      </Modal>
    </>
  );
}
