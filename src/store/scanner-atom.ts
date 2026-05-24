import { atom } from 'jotai';

export const scannerAtom = atom<{
  display: boolean;
}>({
  display: false,
});
