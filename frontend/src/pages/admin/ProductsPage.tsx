import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { mockProducts } from '@/data/mockData'
import type { Product, Quality } from '@/types'

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
})

const qualitySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>
type QualityFormData = z.infer<typeof qualitySchema>

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showQualityDialog, setShowQualityDialog] = useState(false)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [isCreatingQuality, setIsCreatingQuality] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingQuality, setEditingQuality] = useState<Quality | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const qualityForm = useForm<QualityFormData>({
    resolver: zodResolver(qualitySchema),
  })

  const openCreateProductDialog = () => {
    setEditingProduct(null)
    setIsCreatingProduct(true)
    productForm.reset({ name: '' })
    setShowProductDialog(true)
  }

  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product)
    setIsCreatingProduct(false)
    productForm.reset({ name: product.name })
    setShowProductDialog(true)
  }

  const openCreateQualityDialog = () => {
    setEditingQuality(null)
    setIsCreatingQuality(true)
    qualityForm.reset({ name: '', description: '' })
    setShowQualityDialog(true)
  }

  const openEditQualityDialog = (quality: Quality) => {
    setEditingQuality(quality)
    setIsCreatingQuality(false)
    qualityForm.reset({ name: quality.name, description: quality.description || '' })
    setShowQualityDialog(true)
  }

  const onProductSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (isCreatingProduct) {
      const newProduct: Product = {
        id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
        code: `PROD-${String(products.length + 1).padStart(3, '0')}`,
        name: data.name,
        active: true,
        qualities: [],
      }
      setProducts(prev => [...prev, newProduct])
      setSelectedProduct(newProduct)
      toast.success('Producto creado exitosamente')
    } else if (editingProduct) {
      setProducts(prev =>
        prev.map(p => (p.id === editingProduct.id ? { ...p, name: data.name } : p))
      )
      if (selectedProduct?.id === editingProduct.id) {
        setSelectedProduct(prev => (prev ? { ...prev, name: data.name } : null))
      }
      toast.success('Producto actualizado exitosamente')
    }

    setIsSubmitting(false)
    setShowProductDialog(false)
  }

  const onQualitySubmit = async (data: QualityFormData) => {
    if (!selectedProduct) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (isCreatingQuality) {
      const newQuality: Quality = {
        id: `Q-${String(selectedProduct.qualities.length + 1)}`,
        code: `Q-${String.fromCharCode(65 + selectedProduct.qualities.length)}`,
        name: data.name,
        description: data.description,
        active: true,
        productId: selectedProduct.id,
      }

      setProducts(prev =>
        prev.map(p =>
          p.id === selectedProduct.id ? { ...p, qualities: [...p.qualities, newQuality] } : p
        )
      )
      setSelectedProduct(prev =>
        prev ? { ...prev, qualities: [...prev.qualities, newQuality] } : null
      )
      toast.success('Calidad creada exitosamente')
    } else if (editingQuality) {
      setProducts(prev =>
        prev.map(p =>
          p.id === selectedProduct.id
            ? {
                ...p,
                qualities: p.qualities.map(q =>
                  q.id === editingQuality.id ? { ...q, name: data.name, description: data.description } : q
                ),
              }
            : p
        )
      )
      setSelectedProduct(prev =>
        prev
          ? {
              ...prev,
              qualities: prev.qualities.map(q =>
                q.id === editingQuality.id ? { ...q, name: data.name, description: data.description } : q
              ),
            }
          : null
      )
      toast.success('Calidad actualizada exitosamente')
    }

    setIsSubmitting(false)
    setShowQualityDialog(false)
  }

  const toggleProductStatus = (product: Product) => {
    setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, active: !p.active } : p)))
    toast.success(product.active ? 'Producto desactivado' : 'Producto activado')
  }

  const toggleQualityStatus = (quality: Quality) => {
    if (!selectedProduct) return

    setProducts(prev =>
      prev.map(p =>
        p.id === selectedProduct.id
          ? {
              ...p,
              qualities: p.qualities.map(q =>
                q.id === quality.id ? { ...q, active: !q.active } : q
              ),
            }
          : p
      )
    )
    setSelectedProduct(prev =>
      prev
        ? {
            ...prev,
            qualities: prev.qualities.map(q =>
              q.id === quality.id ? { ...q, active: !q.active } : q
            ),
          }
        : null
    )
    toast.success(quality.active ? 'Calidad desactivada' : 'Calidad activada')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D2137]">Productos y Calidades</h2>
        <p className="text-[#5C7391]">Administra los productos y sus calidades</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Products List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Productos</CardTitle>
              <Button onClick={openCreateProductDialog} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  selectedProduct?.id === product.id
                    ? 'border-[#1E88E5] bg-[#1E88E5]/5'
                    : 'border-border hover:border-[#1E88E5]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#0D2137]">{product.name}</p>
                      {!product.active && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#5C7391]">{product.code}</p>
                    <p className="mt-1 text-sm text-[#9BAEC8]">
                      {product.qualities.length} calidades
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation()
                        openEditProductDialog(product)
                      }}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 text-[#5C7391]" />
                    </Button>
                    <Switch
                      checked={product.active}
                      onCheckedChange={() => toggleProductStatus(product)}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Qualities List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Calidades de {selectedProduct?.name || '...'}
                </CardTitle>
                <CardDescription>
                  {selectedProduct?.qualities.length || 0} calidades configuradas
                </CardDescription>
              </div>
              <Button
                onClick={openCreateQualityDialog}
                size="sm"
                disabled={!selectedProduct}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Calidad
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedProduct?.qualities.map(quality => (
              <div
                key={quality.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {quality.code}
                    </Badge>
                    <p className="font-medium text-[#0D2137]">{quality.name}</p>
                    {!quality.active && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  {quality.description && (
                    <p className="mt-1 text-sm text-[#5C7391]">{quality.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditQualityDialog(quality)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4 text-[#5C7391]" />
                  </Button>
                  <Switch
                    checked={quality.active}
                    onCheckedChange={() => toggleQualityStatus(quality)}
                  />
                </div>
              </div>
            ))}

            {(!selectedProduct || selectedProduct.qualities.length === 0) && (
              <div className="py-8 text-center text-[#9BAEC8]">
                {selectedProduct
                  ? 'No hay calidades configuradas'
                  : 'Selecciona un producto para ver sus calidades'}
              </div>
            )}

            <Alert className="mt-4 border-[#1E88E5]/30 bg-[#1E88E5]/5">
              <Info className="h-4 w-4 text-[#1E88E5]" />
              <AlertDescription className="text-[#5C7391]">
                Inactivar una calidad no afecta movimientos históricos
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCreatingProduct ? 'Nuevo Producto' : 'Editar Producto'}
            </DialogTitle>
            <DialogDescription>
              {isCreatingProduct
                ? 'Ingresa el nombre del nuevo producto'
                : 'Modifica el nombre del producto'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nombre del producto *</Label>
              <Input
                id="productName"
                {...productForm.register('name')}
                placeholder="Ej: Aceite de Palma"
              />
              {productForm.formState.errors.name && (
                <p className="text-sm text-red-500">{productForm.formState.errors.name.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#0D2137] hover:bg-[#1A3A5C]">
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quality Dialog */}
      <Dialog open={showQualityDialog} onOpenChange={setShowQualityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCreatingQuality ? 'Nueva Calidad' : 'Editar Calidad'}
            </DialogTitle>
            <DialogDescription>
              {isCreatingQuality
                ? `Agregar calidad para ${selectedProduct?.name}`
                : 'Modifica los datos de la calidad'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={qualityForm.handleSubmit(onQualitySubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qualityName">Nombre de la calidad *</Label>
              <Input
                id="qualityName"
                {...qualityForm.register('name')}
                placeholder="Ej: Alta Pureza"
              />
              {qualityForm.formState.errors.name && (
                <p className="text-sm text-red-500">{qualityForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityDescription">Descripción</Label>
              <Input
                id="qualityDescription"
                {...qualityForm.register('description')}
                placeholder="Ej: FFA < 3%"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowQualityDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#0D2137] hover:bg-[#1A3A5C]">
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
