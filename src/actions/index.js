// @flow
import React from 'react';
import { u2728 as surpriseIcon } from 'react-icons-kit/noto_emoji_regular/u2728';

import Spacer from '../components/Spacer';
import TextLink from '../components/TextLink';

import type { Toast } from '../types';

export const breakMachineWithKeyboard = (triggerRef: ?HTMLElement) => ({
  type: 'BREAK_MACHINE_WITH_KEYBOARD',
  triggerRef,
  toast: {
    id: 'break-machine-keyboard',
    title: '😮 Surprise!',
    message: (
      <span>
        You discovered an easter egg, you crafty devil. Keyboard navigation
        allows you to <strong>exceed the range of some controls</strong>.<br />
        <Spacer size={8} />
        What will you do with your new powers?
      </span>
    ),
  },
});

export const discoverStorefront = () => ({
  type: 'DISCOVER_STOREFRONT',
});

export const dismissToast = (toastId: string) => ({
  type: 'DISMISS_TOAST',
  toastId,
});

export const selectFormat = (machineName: string, format: string) => ({
  type: 'SELECT_FORMAT',
  machineName,
  format,
});

export const selectSize = (machineName: string, size: string) => ({
  type: 'SELECT_SIZE',
  machineName,
  size,
});

export const authenticateAsAdmin = (password: string) => ({
  type: 'AUTHENTICATE_AS_ADMIN',
  password,
});
