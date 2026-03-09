import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, Tag, Truck, Gift } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetOffers, useCreateOffer, useDeleteOffer,
  useGetAllPromoCodes, useCreatePromoCode, useDeletePromoCode,
  useGetDeliverySettings, useUpdateDeliverySettings,
  DiscountType,
} from '../../hooks/useQueries';
import { formatCurrency } from '../../utils/formatCurrency';

export default function OffersManagement() {
  return (
    <div className="space-y-8">
      <DeliverySettingsSection />
      <OffersSection />
      <PromoCodesSection />
    </div>
  );
}

function DeliverySettingsSection() {
  const { data: settings, isLoading } = useGetDeliverySettings();
  const updateSettings = useUpdateDeliverySettings();
  const [fee, setFee] = useState('');
  const [threshold, setThreshold] = useState('');
  const [freeDelivery, setFreeDelivery] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setFee((Number(settings.deliveryFee) / 100).toString());
      setThreshold((Number(settings.freeDeliveryThreshold) / 100).toString());
      setFreeDelivery(settings.freeDelivery);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        deliveryFee: BigInt(Math.round(parseFloat(fee) * 100)),
        freeDeliveryThreshold: BigInt(Math.round(parseFloat(threshold) * 100)),
        freeDelivery,
      });
      toast.success('Delivery settings saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-5 w-5 text-primary" /> Delivery Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Fee (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fee}
                  onChange={e => setFee(e.target.value)}
                  placeholder="40.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Free Delivery Threshold (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={threshold}
                  onChange={e => setThreshold(e.target.value)}
                  placeholder="400.00"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={freeDelivery} onCheckedChange={setFreeDelivery} id="freeDelivery" />
              <Label htmlFor="freeDelivery">Enable Free Delivery for All Orders</Label>
            </div>
            <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2">
              {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Settings
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OffersSection() {
  const { data: offers = [], isLoading } = useGetOffers();
  const createOffer = useCreateOffer();
  const deleteOffer = useDeleteOffer();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discountPercentage: '', startDate: '', endDate: '' });

  const now = Date.now();

  const handleCreate = async () => {
    try {
      const startMs = new Date(form.startDate).getTime();
      const endMs = new Date(form.endDate).getTime();
      await createOffer.mutateAsync({
        title: form.title,
        description: form.description,
        discountPercentage: BigInt(parseInt(form.discountPercentage)),
        startDate: BigInt(startMs * 1_000_000),
        endDate: BigInt(endMs * 1_000_000),
      });
      toast.success('Offer created');
      setDialogOpen(false);
      setForm({ title: '', description: '', discountPercentage: '', startDate: '', endDate: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create offer');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await deleteOffer.mutateAsync(id);
      toast.success('Offer deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete offer');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-5 w-5 text-primary" /> Promotional Offers
          </CardTitle>
          <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add Offer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No offers yet.</TableCell>
                  </TableRow>
                ) : (
                  offers.map(offer => {
                    const start = Number(offer.startDate) / 1_000_000;
                    const end = Number(offer.endDate) / 1_000_000;
                    const isActive = now >= start && now <= end;
                    return (
                      <TableRow key={offer.id.toString()}>
                        <TableCell>
                          <p className="font-medium text-sm">{offer.title}</p>
                          <p className="text-xs text-muted-foreground">{offer.description}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{Number(offer.discountPercentage)}% OFF</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(start).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(end).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}>
                            {isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(offer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Promotional Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Summer Sale" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Get fresh produce at discounted prices..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Discount Percentage</Label>
              <Input type="number" min="1" max="100" value={form.discountPercentage} onChange={e => setForm(f => ({ ...f, discountPercentage: e.target.value }))} placeholder="10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createOffer.isPending}>
              {createOffer.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PromoCodesSection() {
  const { data: codes = [], isLoading } = useGetAllPromoCodes();
  const createCode = useCreatePromoCode();
  const deleteCode = useDeletePromoCode();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: DiscountType.percentage,
    discountValue: '',
    minOrderValue: '',
    usageLimit: '',
    expiryDays: '',
  });

  const now = Date.now();

  const handleCreate = async () => {
    try {
      const expiresInSeconds = BigInt(parseInt(form.expiryDays) * 24 * 60 * 60);
      await createCode.mutateAsync({
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: BigInt(Math.round(parseFloat(form.discountValue) * (form.discountType === DiscountType.fixedAmount ? 100 : 1))),
        minOrderValue: BigInt(Math.round(parseFloat(form.minOrderValue) * 100)),
        usageLimit: BigInt(parseInt(form.usageLimit)),
        expiresInSeconds,
      });
      toast.success('Promo code created');
      setDialogOpen(false);
      setForm({ code: '', discountType: DiscountType.percentage, discountValue: '', minOrderValue: '', usageLimit: '', expiryDays: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create promo code');
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete promo code "${code}"?`)) return;
    try {
      await deleteCode.mutateAsync(code);
      toast.success('Promo code deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete promo code');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-5 w-5 text-primary" /> Promo & Gift Codes
          </CardTitle>
          <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add Code
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">No promo codes yet.</TableCell>
                  </TableRow>
                ) : (
                  codes.map(code => {
                    const expiresAt = Number(code.expiresAt) / 1_000_000;
                    const isExpired = now > expiresAt;
                    const isExhausted = Number(code.timesUsed) >= Number(code.usageLimit);
                    const isActive = !isExpired && !isExhausted;
                    return (
                      <TableRow key={code.code}>
                        <TableCell className="font-mono font-bold text-sm">{code.code}</TableCell>
                        <TableCell>
                          {code.discountType === DiscountType.percentage
                            ? `${Number(code.discountValue)}%`
                            : formatCurrency(Number(code.discountValue))}
                        </TableCell>
                        <TableCell className="text-sm">{formatCurrency(Number(code.minOrderValue))}</TableCell>
                        <TableCell className="text-sm">{Number(code.timesUsed)}/{Number(code.usageLimit)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(expiresAt).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}>
                            {isExpired ? 'Expired' : isExhausted ? 'Exhausted' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(code.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20"
                className="font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={form.discountType} onValueChange={val => setForm(f => ({ ...f, discountType: val as DiscountType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DiscountType.percentage}>Percentage (%)</SelectItem>
                    <SelectItem value={DiscountType.fixedAmount}>Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.discountValue}
                  onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                  placeholder={form.discountType === DiscountType.percentage ? '20' : '50.00'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Order (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderValue}
                  onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))}
                  placeholder="200.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.usageLimit}
                  onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expires in (days)</Label>
              <Input
                type="number"
                min="1"
                value={form.expiryDays}
                onChange={e => setForm(f => ({ ...f, expiryDays: e.target.value }))}
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createCode.isPending}>
              {createCode.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
