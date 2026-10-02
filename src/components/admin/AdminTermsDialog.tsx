import { useEffect, useState } from 'react';
import { ShieldCheck, ScrollText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { logAdminActivity } from '@/lib/adminActivity';

const STORAGE_KEY = 'maish-admin-terms-accepted';

/** The clauses the admin is agreeing to. */
const CLAUSES: Array<{ title: string; body: string }> = [
  {
    title: 'Accountable for every change',
    body:
      'Every action you take in this dashboard is recorded against your email address with a timestamp — including adding, editing, deleting and deactivating products, and any price or stock change. These records cannot be edited from the dashboard.',
  },
  {
    title: 'Changes are live immediately',
    body:
      'Anything you save here is written to the live database and appears on the public website straight away. There is no separate publish step, so please check prices, stock levels and spelling before saving.',
  },
  {
    title: 'Use accurate information only',
    body:
      'Product names, descriptions, images and prices must be accurate and must not misrepresent the goods. Prices must be in Kenya Shillings (KSh) and must accurately reflect what a customer will be charged.',
  },
  {
    title: 'Deleting is permanent',
    body:
      'Deleting a product removes it from the website immediately. It cannot be undone from this dashboard. Use the Active switch instead of Delete when you only want to hide a product temporarily.',
  },
  {
    title: 'Keep credentials confidential',
    body:
      'Your admin login is for you only. Do not share your password, and do not let anyone else use your account. All activity performed while signed in is attributed to you personally.',
  },
  {
    title: 'Unauthorised use is not permitted',
    body:
      'You may only make these changes if you are authorised to do so by Maish Boutique. Attempting to access the dashboard without authorisation, or abusing any of these permissions, is grounds for immediate removal of access.',
  },
];

interface AdminTermsDialogProps {
  open: boolean;
  onAccepted: () => void;
}

export function AdminTermsDialog({ open, onAccepted }: AdminTermsDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  // Reset each time the dialog opens so it cannot be pre-accepted.
  useEffect(() => {
    if (open) {
      setAccepted(false);
      setScrolledToEnd(false);
    }
  }, [open]);

  function handleAccept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Private browsing can block storage; the session still works.
    }
    void logAdminActivity({
      action: 'admin.terms_accepted',
      entityType: 'session',
      entityLabel: 'Admin terms and conditions',
    });
    onAccepted();
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Admin Terms &amp; Conditions
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Please read and accept these terms before using the admin dashboard.
          </p>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto space-y-4 rounded-md border p-4 text-sm min-h-0"
          onScroll={(e) => {
            const el = e.currentTarget;
            // Treat "within 40px of the bottom" as having reached the end.
            setScrolledToEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 40);
          }}
        >
          {CLAUSES.map((clause) => (
            <section key={clause.title} className="space-y-1">
              <h3 className="font-semibold">{clause.title}</h3>
              <p className="text-muted-foreground">{clause.body}</p>
            </section>
          ))}

          <section className="space-y-1 border-t pt-4">
            <h3 className="font-semibold">Acknowledgement</h3>
            <p className="text-muted-foreground">
              By accepting, you confirm you have read and understood these terms
              and agree to be bound by them while using the Maish Boutique admin
              dashboard.
            </p>
          </section>
        </div>

        {!scrolledToEnd && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ScrollText className="h-3.5 w-3.5" />
            Scroll to the bottom to continue.
          </p>
        )}

        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-0.5"
            aria-label="Accept admin terms and conditions"
          />
          <span>
            I have read and accept the Admin Terms &amp; Conditions.
          </span>
        </label>

        <DialogFooter>
          <Button onClick={handleAccept} disabled={!accepted}>
            <Check className="h-4 w-4 mr-2" />
            Accept &amp; Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** True when the terms were already accepted in this browser. */
export function hasAcceptedAdminTerms(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default AdminTermsDialog;
