"use client";

import React from "react";

/**
 * Catches GLTF loading errors (e.g., missing file) and renders a fallback
 * instead of crashing the whole Canvas.
 */
export class AssetBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.warn("AssetBoundary caught an error (likely missing model):", err);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
