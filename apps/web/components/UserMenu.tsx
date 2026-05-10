'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { GradientAvatar } from './brand';

type Props = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  signOutAction: () => void | Promise<void>;
};

export function UserMenu({ userId, name, avatarUrl, signOutAction }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{
          items: [
            {
              key: 'profile',
              icon: <UserOutlined />,
              label: <Link href={`/profile/${userId}`}>Profile</Link>,
            },
            { type: 'divider' },
            {
              key: 'signout',
              icon: <LogoutOutlined />,
              label: 'Sign out',
              onClick: () => formRef.current?.requestSubmit(),
            },
          ],
        }}
      >
        <button
          type="button"
          aria-label="Account menu"
          style={{
            background: 'transparent',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex',
          }}
        >
          <GradientAvatar name={name} src={avatarUrl ?? undefined} size={32} />
        </button>
      </Dropdown>
      <form ref={formRef} action={signOutAction} style={{ display: 'none' }} />
    </>
  );
}
