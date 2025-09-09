type Messages = typeof import('./messages/en.json');

declare global {
  // next-intl picks up this interface for typing translation helpers
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}

export {};
