import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

// The beforeinstallprompt event isn't in the standard lib DOM typings.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt: () => Promise<void>;
}

const DISMISS_KEY = "pwa-install-dismissed";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // iOS Safari
  (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent.toLowerCase());

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    // Already installed or dismissed this session → never show.
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === "true") return;

    const onBeforeInstall = (e: Event) => {
      // Stop Chrome's automatic mini-infobar so we control the UX.
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires beforeinstallprompt — show manual instructions.
    if (isIos()) setVisible(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    setShowIosHelp(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  const handleInstall = async () => {
    if (isIos()) {
      setShowIosHelp(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    // The event can only be used once.
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/98 backdrop-blur-xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          <Download className="h-5 w-5 text-accent" />
        </div>

        <div className="min-w-0 flex-1">
          {showIosHelp ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Tap the{" "}
              <Share className="inline h-3.5 w-3.5 -translate-y-0.5" /> Share
              button, then{" "}
              <span className="font-semibold text-foreground">
                "Add to Home Screen"
              </span>
              .
            </p>
          ) : (
            <>
              <p className="truncate text-sm font-bold text-foreground">
                Install FaithCare
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Add it to your device for quick, app-like access.
              </p>
            </>
          )}
        </div>

        {!showIosHelp && (
          <Button
            onClick={handleInstall}
            className="shrink-0 px-4 font-bold"
            size="sm"
          >
            Install
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          className="h-8 w-8 shrink-0 rounded-full"
          title="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
