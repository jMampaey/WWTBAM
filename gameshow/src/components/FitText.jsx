import { useLayoutEffect, useRef } from 'react';

export default function FitText({ children, maxSize, minSize = 10, style }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = maxSize;
    el.style.fontSize = size + 'px';
    while (el.scrollWidth > el.offsetWidth + 1 && size > minSize) {
      size -= 1;
      el.style.fontSize = size + 'px';
    }
  });

  return (
    <div ref={ref} style={{ whiteSpace: 'nowrap', width: '100%', minWidth: 0, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}
