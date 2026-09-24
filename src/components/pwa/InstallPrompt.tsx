import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp, isDesktop } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setDismissed(true);
    }
  };

  // Desktop: Show banner at top
  if (isDesktop) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-primary text-primary-foreground py-3 px-4"
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Install Maish Fashion Boutique for the best experience
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              variant="secondary"
              className="flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-primary-foreground/20 rounded"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Mobile: Show bottom sheet style banner
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:pb-6"
      >
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">Install App</h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                Install Maish Fashion for faster shopping and offline access
              </p>

              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissed(true)}
                >
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
