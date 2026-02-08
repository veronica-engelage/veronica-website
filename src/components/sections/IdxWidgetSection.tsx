"use client";

import { useEffect, useRef } from "react";

type IdxWidgetSectionProps = {
  title?: string | null;
  widgetId?: string | null;
  widgetHost?: string | null;
};

export function IdxWidgetSection({ title, widgetId, widgetHost }: IdxWidgetSectionProps) {
  if (!widgetId) return null;
  const host = widgetHost || "demoidxbroker.idxbroker.com";
  const src = `https://${host}/idx/widgets/${widgetId}`;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = src;
    script.id = `idxwidgetsrc-${widgetId}`;
    script.async = true;
    script.charset = "UTF-8";
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [src, widgetId]);

  return (
    <section className="container-page py-12">
      {title ? <h2 className="text-3xl font-semibold">{title}</h2> : null}
      <div className={title ? "mt-6" : ""} ref={containerRef} />
    </section>
  );
}
