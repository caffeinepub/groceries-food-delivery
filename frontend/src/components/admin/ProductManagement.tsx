import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateProductDiscount,
} from '../../hooks/useQueries';
import { formatCurrency } from '../../utils/formatCurrency';
import ProductForm from './ProductForm';
import type { Product } from '../../backend';

export default function ProductManagement() {
  const { data: products = [], isLoading } = useGetProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createDiscount = useCreateProductDiscount();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const handleSubmit = async (data: any) => {
    try {
      const priceInPaise = BigInt(Math.round(parseFloat(data.price) * 100));
      const categoryId = BigInt(data.categoryId);

      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          name: data.name,
          description: data.description,
          price: priceInPaise,
          categoryId,
          imageUrl: data.imageUrl,
          inStock: data.inStock,
        });
        if (data.discount) {
          await createDiscount.mutateAsync({
            productId: editingProduct.id,
            discountPercentage: BigInt(parseInt(data.discount)),
          });
        }
        toast.success('Product updated successfully');
      } else {
        const productId = await addProduct.mutateAsync({
          name: data.name,
          description: data.description,
          price: priceInPaise,
          categoryId,
          imageUrl: data.imageUrl,
          stock: data.inStock,
        });
        if (data.discount && parseInt(data.discount) > 0) {
          await createDiscount.mutateAsync({
            productId,
            discountPercentage: BigInt(parseInt(data.discount)),
          });
        }
        toast.success('Product added successfully');
      }
      setFormOpen(false);
      setEditingProduct(undefined);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const handleStockToggle = async (product: Product) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        inStock: !product.inStock,
      });
      toast.success(`Stock ${!product.inStock ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{products.length} products</p>
        <Button onClick={() => { setEditingProduct(undefined); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>In Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No products yet. Add your first product!
                </TableCell>
              </TableRow>
            ) : (
              products.map(product => (
                <TableRow key={product.id.toString()}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(product.price))}</TableCell>
                  <TableCell>
                    {product.discount ? (
                      <Badge variant="secondary">{Number(product.discount)}% OFF</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.inStock}
                      onCheckedChange={() => handleStockToggle(product)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditingProduct(product); setFormOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(undefined); }}
        onSubmit={handleSubmit}
        product={editingProduct}
        isLoading={addProduct.isPending || updateProduct.isPending}
      />
    </div>
  );
}
