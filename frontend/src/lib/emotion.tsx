"use client";
import { useState } from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";

export default function EmotionRoot({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const cache = createCache({ key: "css", prepend: true });
    // compat 모드로 React 18과의 스타일 삽입을 안정화
    (cache as any).compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    // 서버 사이드 렌더링 시 Emotion이 삽입한 스타일을 Head에 주입
    const inserted = (cache as any).inserted as Record<string, string>;
    const names = Object.keys(inserted);
    const css = Object.values(inserted).join(" ");
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: css }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}