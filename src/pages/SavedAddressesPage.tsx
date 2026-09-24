import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Edit2, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const SavedAddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Default addresses if user has none saved
  const addresses = user?.address ? [
    {
      id: '1',
      type: 'Home',
      name: user.fullName || 'User',
      phone: user.phone || '',
      address: user.address,
      town: user.town || '',
      county: user.county || '',
      isDefault: true,
    }
  ] : [];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/account')}
              className="touch-target flex items-center justify-center hover:bg-muted rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold">Saved Addresses</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{addr.type}</p>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1">{addr.name}</p>
                      <p className="text-sm text-muted-foreground">{addr.phone}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {addr.address}
                        {addr.town && `, ${addr.town}`}
                        {addr.county && `, ${addr.county}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-muted rounded-lg" aria-label="Edit address">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg text-red-500" aria-label="Delete address">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Saved Addresses</h3>
            <p className="text-muted-foreground mb-6">
              You haven't saved any addresses yet.
            </p>
            <Button onClick={() => navigate('/account')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          </div>
        )}

        {/* Add New Address Button */}
        {addresses.length > 0 && (
          <Button className="w-full mt-4" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-muted rounded-xl">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> You can also add or edit your address when placing an order at checkout.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavedAddressesPage;
