"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
const Scene = dynamic(() => import("@/components/Scene"), {
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  return (
    <>
      <Scene />
    </>
  );
}
