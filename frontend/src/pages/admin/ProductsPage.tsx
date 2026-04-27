import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Info, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
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
  const [products, setProducts]           = useState(mockProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showQualityDialog, setShowQualityDialog] = useState(false)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [isCreatingQuality, setIsCreatingQuality] = useState(false)
  const [editingProduct,   setEditingProduct]   = useState<Product | null>(null)
  const [editingQuality,   setEditingQuality]   = useState<Quality | null>(null)
  const [isSubmitting,     setIsSubmitting]     = useState(false)

  const productForm = useForm<ProductFormData>({ resolver: zodResolver(productSchema) })
  const qualityForm = useForm<QualityFormData>({ resolver: zodResolver(qualitySchema) })

  // ─── product actions ────────────────────────────────────────────────────────
  const openCreateProductDialog = () => {
    setEditingProduct(null); setIsCreatingProduct(true)
    productForm.reset({ name: '' }); setShowProductDialog(true)
  }
  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product); setIsCreatingProduct(false)
    productForm.reset({ name: product.name }); setShowProductDialog(true)
  }
  const onProductSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    if (isCreatingProduct) {
      const p: Product = {
        id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
        code: `PROD-${String(products.length + 1).padStart(3, '0')}`,
        name: data.name, active: true, qualities: [],
      }
      setProducts(prev => [...prev, p]); setSelectedProduct(p)
      toast.success('Producto creado')
    } else if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, name: data.name } : p))
      if (selectedProduct?.id === editingProduct.id)
        setSelectedProduct(prev => prev ? { ...prev, name: data.name } : null)
      toast.success('Producto actualizado')
    }
    setIsSubmitting(false); setShowProductDialog(false)
  }
  const toggleProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p))
    toast.success(product.active ? 'Producto desactivado' : 'Producto activado')
  }

  // ─── quality actions ─────────────────────────────────────────────────────────
  const openCreateQualityDialog = () => {
    setEditingQuality(null); setIsCreatingQuality(true)
    qualityForm.reset({ name: '', description: '' }); setShowQualityDialog(true)
  }
  const openEditQualityDialog = (quality: Quality) => {
    setEditingQuality(quality); setIsCreatingQuality(false)
    qualityForm.reset({ name: quality.name, description: quality.description || '' })
    setShowQualityDialog(true)
  }
  const onQualitySubmit = async (data: QualityFormData) => {
    if (!selectedProduct) return
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    if (isCreatingQuality) {
      const q: Quality = {
        id: `Q-${selectedProduct.qualities.length + 1}`,
        code: `Q-${String.fromCharCode(65 + selectedProduct.qualities.length)}`,
        name: data.name, description: data.description, active: true,
        productId: selectedProduct.id,
      }
      const update = (p: Product) => p.id === selectedProduct.id
        ? { ...p, qualities: [...p.qualities, q] } : p
      setProducts(prev => prev.map(update))
      setSelectedProduct(prev => prev ? { ...prev, qualities: [...prev.qualities, q] } : null)
      toast.success('Calidad creada')
    } else if (editingQuality) {
      const updateQ = (q: Quality) => q.id === editingQuality.id
        ? { ...q, name: data.name, description: data.description } : q
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id ? { ...p, qualities: p.qualities.map(updateQ) } : p
      ))
      setSelectedProduct(prev => prev ? { ...prev, qualities: prev.qualities.map(updateQ) } : null)
      toast.success('Calidad actualizada')
    }
    setIsSubmitting(false); setShowQualityDialog(false)
  }
  const toggleQuality = (quality: Quality) => {
    if (!selectedProduct) return
    const update = (q: Quality) => q.id === quality.id ? { ...q, active: !q.active } : q
    setProducts(prev => prev.map(p =>
      p.id === selectedProduct.id ? { ...p, qualities: p.qualities.map(update) } : p
    ))
    setSelectedProduct(prev => prev ? { ...prev, qualities: prev.qualities.map(update) } : null)
    toast.success(quality.active ? 'Calidad desactivada' : 'Calidad activada')
  }

  // ─── render ──────────────────────────────────────────────────────────────────

  const activeProducts   = products.filter(p => p.active).length
  const totalQualities   = products.reduce((s, p) => s + p.qualities.length, 0)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2434]">Productos y Calidades</h1>
          <p className="mt-0.5 text-sm text-[#637381]">Catálogo de productos y especificaciones de calidad del terminal</p>
        </div>
        <button
          onClick={openCreateProductDialog}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1C2434] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2D3A4A] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Productos',       value: products.length,    color: 'text-[#1E88E5]', bg: 'bg-[#1E88E5]/10' },
          { label: 'Activos',         value: activeProducts,     color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total calidades', value: totalQualities,     color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm px-5 py-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${k.bg}`}>
              <Package className={`h-5 w-5 ${k.color}`} />
            </div>
            <div>
              <p className="text-xs text-[#9BAEC8]">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Products panel */}
        <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E8EDF2] px-5 py-3.5">
            <p className="text-sm font-semibold text-[#1C2434]">Productos ({products.length})</p>
          </div>
          <div className="divide-y divide-[#E8EDF2]">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`flex items-center justify-between gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-[#F7F9FC] ${
                  selectedProduct?.id === product.id ? 'bg-[#1E88E5]/5 border-l-2 border-l-[#1E88E5]' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1C2434]">{product.name}</p>
                    {!product.active && (
                      <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[#9BAEC8]">{product.code}</p>
                  <p className="text-xs text-[#9BAEC8] mt-0.5">{product.qualities.length} calidades</p>
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => openEditProductDialog(product)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] hover:bg-[#F0F4F8] hover:text-[#1C2434] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <Switch checked={product.active} onCheckedChange={() => toggleProduct(product)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Qualities panel */}
        <div className="rounded-xl border border-[#E8EDF2] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E8EDF2] px-5 py-3.5">
            <div>
              <p className="text-sm font-semibold text-[#1C2434]">
                Calidades {selectedProduct ? `— ${selectedProduct.name}` : ''}
              </p>
              {selectedProduct && (
                <p className="text-xs text-[#9BAEC8]">{selectedProduct.qualities.length} calidades configuradas</p>
              )}
            </div>
            <button
              onClick={openCreateQualityDialog}
              disabled={!selectedProduct}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E88E5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1976D2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva Calidad
            </button>
          </div>

          <div className="divide-y divide-[#E8EDF2]">
            {selectedProduct?.qualities.map(quality => (
              <div key={quality.id} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#F7F9FC] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full border border-[#E8EDF2] bg-[#F7F9FC] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#637381]">
                      {quality.code}
                    </span>
                    <p className="text-sm font-medium text-[#1C2434]">{quality.name}</p>
                    {!quality.active && (
                      <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {quality.description && (
                    <p className="mt-0.5 text-xs text-[#9BAEC8]">{quality.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditQualityDialog(quality)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BAEC8] hover:bg-[#F0F4F8] hover:text-[#1C2434] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <Switch checked={quality.active} onCheckedChange={() => toggleQuality(quality)} />
                </div>
              </div>
            ))}

            {(!selectedProduct || selectedProduct.qualities.length === 0) && (
              <div className="py-12 text-center text-sm text-[#9BAEC8]">
                {selectedProduct ? 'No hay calidades configuradas aún' : 'Selecciona un producto para ver sus calidades'}
              </div>
            )}
          </div>

          {/* Info note */}
          <div className="border-t border-[#E8EDF2] px-5 py-3 flex items-start gap-2 bg-[#F7F9FC]">
            <Info className="h-3.5 w-3.5 text-[#9BAEC8] shrink-0 mt-0.5" />
            <p className="text-xs text-[#9BAEC8]">Inactivar una calidad no afecta movimientos históricos</p>
          </div>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreatingProduct ? 'Nuevo Producto' : 'Editar Producto'}</DialogTitle>
            <DialogDescription>
              {isCreatingProduct ? 'Ingresa el nombre del nuevo producto' : 'Modifica el nombre del producto'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nombre del producto *</Label>
              <Input id="productName" {...productForm.register('name')} placeholder="Ej: Aceite de Palma" />
              {productForm.formState.errors.name && (
                <p className="text-sm text-red-500">{productForm.formState.errors.name.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#1C2434] hover:bg-[#2D3A4A]">
                {isSubmitting && <Spinner className="mr-2 h-4 w-4" />} Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quality Dialog */}
      <Dialog open={showQualityDialog} onOpenChange={setShowQualityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreatingQuality ? 'Nueva Calidad' : 'Editar Calidad'}</DialogTitle>
            <DialogDescription>
              {isCreatingQuality ? `Para ${selectedProduct?.name}` : 'Modifica los datos de la calidad'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={qualityForm.handleSubmit(onQualitySubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qualityName">Nombre de la calidad *</Label>
              <Input id="qualityName" {...qualityForm.register('name')} placeholder="Ej: Alta Pureza" />
              {qualityForm.formState.errors.name && (
                <p className="text-sm text-red-500">{qualityForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityDescription">Descripción</Label>
              <Input id="qualityDescription" {...qualityForm.register('description')} placeholder="Ej: FFA < 3%" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowQualityDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#1C2434] hover:bg-[#2D3A4A]">
                {isSubmitting && <Spinner className="mr-2 h-4 w-4" />} Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
