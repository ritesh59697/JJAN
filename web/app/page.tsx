"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { TopBar, NotWiredNotice } from "./TopBar";
import { Landing } from "./Landing";
import { VideoBackground } from "./VideoBackground";

// `/` is the marketing page only. The app itself lives at /dashboard.
export default function Home() {
  const { isConnected } = useAccount();

  // The sections are client-rendered, so on a cold load of /#how or /#faq the
  // target doesn't exist yet when the browser tries to jump to it. Re-run the
  // scroll once we're mounted, and again on same-page hash changes.
  useEffect(() => {
    const jump = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    jump();
    window.addEventListener("hashchange", jump);
    return () => window.removeEventListener("hashchange", jump);
  }, []);

  return (
    <>
      {/* Sibling of .container, not a child, so it sits in the page's base
          stacking context rather than inside the content layer. */}
      <VideoBackground />
      <div className="container">
        <TopBar />
        {!isConnected && (
          <p className="tag">
            Save with friends. The smart contract holds the pot, so no organizer can run off with it. Built on GIWA.
          </p>
        )}
        <NotWiredNotice />
        <Landing />
      </div>
    </>
  );
}
