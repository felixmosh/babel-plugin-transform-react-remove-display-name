export const ForwardRefComponent = React.forwardRef(() => {
  return <div />;
});

ForwardRefComponent.displayName = 'ForwardRefComponent';

export const MemoComponent = React.memo(() => {
  return <div />;
});

MemoComponent.displayName = 'MemoComponent';
