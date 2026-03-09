import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useGetCategories } from '../../hooks/useQueries';
import type { Product } from '../../backend';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  discount: string;
  inStock: boolean;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  product?: Product;
  isLoading?: boolean;
}

export default function ProductForm({ open, onClose, onSubmit, product, isLoading }: ProductFormProps) {
  const { data: categories = [] } = useGetCategories();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
      imageUrl: '',
      discount: '',
      inStock: true,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: (Number(product.price) / 100).toString(),
        categoryId: product.categoryId.toString(),
        imageUrl: product.imageUrl,
        discount: product.discount ? product.discount.toString() : '',
        inStock: product.inStock,
      });
    } else {
      reset({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        discount: '',
        inStock: true,
      });
    }
  }, [product, open, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. Fresh Tomatoes"
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
                placeholder="0.00"
              />
              {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                {...register('discount')}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <p className="text-destructive text-xs">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...register('imageUrl')}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="inStock"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="inStock"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="inStock">In Stock</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : (product ? 'Update Product' : 'Add Product')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
