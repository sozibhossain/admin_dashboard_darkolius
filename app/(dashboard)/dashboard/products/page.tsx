"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Product, getApiErrorMessage, productApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const LIMIT = 8;
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const MAX_PRODUCT_IMAGE_SIZE = 10 * 1024 * 1024;

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  sizes: string[];
  stockSell: string;
  stockAvailable: string;
  totalStock: string;
  imageUrl: string;
  imagePublicId: string;
  imageFile: File | null;
};

type ProductModalMode = "add" | "edit" | "details";

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  sizes: [],
  stockSell: "",
  stockAvailable: "",
  totalStock: "",
  imageUrl: "",
  imagePublicId: "",
  imageFile: null,
};

const toFormState = (product?: Product): ProductFormState => ({
  name: product?.name || "",
  description: product?.description || "",
  price: product?.price !== undefined ? String(product.price) : "",
  sizes: product?.size || [],
  stockSell: product?.stockSell !== undefined ? String(product.stockSell) : "",
  stockAvailable:
    product?.stockAvailable !== undefined ? String(product.stockAvailable) : "",
  totalStock: product?.totalStock !== undefined ? String(product.totalStock) : "",
  imageUrl: product?.image?.[0]?.url || "",
  imagePublicId: product?.image?.[0]?.public_id || "",
  imageFile: null,
});

type ProductModalProps = {
  open: boolean;
  mode: ProductModalMode;
  form: ProductFormState;
  selectedProduct: Product | null;
  pending: boolean;
  removingImage: boolean;
  onClose: () => void;
  onChange: (updater: (prev: ProductFormState) => ProductFormState) => void;
  onImagePick: (file: File | null) => void;
  onRemoveImage: () => void;
  onSubmit: () => void;
};

function ProductModal({
  open,
  mode,
  form,
  selectedProduct,
  pending,
  removingImage,
  onClose,
  onChange,
  onImagePick,
  onRemoveImage,
  onSubmit,
}: ProductModalProps) {
  const isDetails = mode === "details";
  const titleMap: Record<ProductModalMode, string> = {
    add: "Add Product",
    edit: "Edit Product",
    details: "Product Details",
  };
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const localPreviewUrl = useMemo(
    () => (form.imageFile ? URL.createObjectURL(form.imageFile) : ""),
    [form.imageFile],
  );

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const previewSrc =
    localPreviewUrl || form.imageUrl || selectedProduct?.image?.[0]?.url || "";

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-4xl rounded-xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-zinc-900">{titleMap[mode]}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input
                disabled={isDetails}
                value={form.name}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="GT5s Motorized Treadmill"
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                disabled={isDetails}
                type="number"
                value={form.price}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="2100"
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Sell</Label>
              <Input
                disabled={isDetails}
                type="number"
                value={form.stockSell}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, stockSell: event.target.value }))
                }
                placeholder="150"
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Available</Label>
              <Input
                disabled={isDetails}
                type="number"
                value={form.stockAvailable}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    stockAvailable: event.target.value,
                  }))
                }
                placeholder="150"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Stock</Label>
              <Input
                disabled={isDetails}
                type="number"
                value={form.totalStock}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, totalStock: event.target.value }))
                }
                placeholder="300"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Product Size</Label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const active = form.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isDetails}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          sizes: active
                            ? prev.sizes.filter((item) => item !== size)
                            : [...prev.sizes, size],
                        }))
                      }
                      className={cn(
                        "h-10 min-w-11 rounded-md border px-3 text-sm font-medium transition-colors",
                        active
                          ? "border-[#f8b400] bg-[#f8b400] text-white"
                          : "border-zinc-300 bg-white text-zinc-700",
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                disabled={isDetails}
                rows={4}
                value={form.description}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Product description..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Product Image</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                disabled={isDetails}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  event.target.value = "";
                  onImagePick(file);
                }}
              />
              <button
                type="button"
                disabled={isDetails}
                onClick={() => imageInputRef.current?.click()}
                className={cn(
                  "flex h-44 w-full flex-col items-center justify-center rounded-lg border border-dashed text-center transition-colors",
                  isDetails
                    ? "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400"
                    : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-100",
                )}
              >
                <Upload className="mb-2 h-7 w-7 text-[#5c52bd]" />
                <p className="text-xl font-semibold text-zinc-900">Upload Photo</p>
                <p className="text-lg text-zinc-500">png,jpeg,jpg Max 1 image</p>
              </button>
            </div>
          </div>

          {previewSrc && (
            <div className="relative mt-4 rounded-lg border border-zinc-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Image Preview
              </p>
              {!isDetails ? (
                <button
                  type="button"
                  disabled={removingImage}
                  onClick={onRemoveImage}
                  className="absolute right-3 top-3 rounded-full border border-zinc-200 bg-white p-1 text-zinc-600 shadow-sm transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed"
                  aria-label="Remove image"
                >
                  {removingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt={form.name || selectedProduct?.name || "Product"}
                className="h-36 w-full max-w-[260px] rounded-md border border-zinc-200 object-cover"
              />
            </div>
          )}

          {isDetails && selectedProduct ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
              <p>
                <span className="font-semibold text-zinc-800">Created:</span>{" "}
                {formatDate(selectedProduct.createdAt)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-zinc-800">Updated:</span>{" "}
                {formatDate(selectedProduct.updatedAt)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            {isDetails ? "Close" : "Cancel"}
          </Button>
          {!isDetails ? (
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "add" ? "Adding..." : "Saving..."}
                </>
              ) : mode === "add" ? (
                "Add Product"
              ) : (
                "Save Changes"
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type DeleteModalProps = {
  open: boolean;
  productName?: string;
  pending: boolean;
  onNo: () => void;
  onYes: () => void;
};

function DeleteConfirmModal({
  open,
  productName,
  pending,
  onNo,
  onYes,
}: DeleteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-zinc-900">Delete Product</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-zinc-900">{productName || "this product"}</span>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onNo} disabled={pending}>
            No
          </Button>
          <Button variant="destructive" onClick={onYes} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [modalMode, setModalMode] = useState<ProductModalMode | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchText.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchText]);

  const query = useQuery({
    queryKey: ["products", page, LIMIT, searchTerm],
    queryFn: () =>
      productApi.getAll({
        page,
        limit: LIMIT,
        searchTerm: searchTerm || undefined,
      }),
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      toast.success("Product created.");
      setModalMode(null);
      setSelectedProduct(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Product> | FormData;
    }) =>
      productApi.update(id, payload),
    onSuccess: () => {
      toast.success("Product updated.");
      setModalMode(null);
      setSelectedProduct(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ id, publicId }: { id: string; publicId: string }) =>
      productApi.deleteImage(id, publicId),
    onSuccess: (updatedProduct) => {
      toast.success("Product image deleted.");
      setSelectedProduct(updatedProduct);
      setForm((prev) => ({
        ...prev,
        imageUrl: updatedProduct.image?.[0]?.url || "",
        imagePublicId: updatedProduct.image?.[0]?.public_id || "",
        imageFile: null,
      }));
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      toast.success("Product deleted.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const totalPages = useMemo(() => {
    const total = query.data?.meta?.total ?? 0;
    return Math.max(1, Math.ceil(total / LIMIT));
  }, [query.data?.meta?.total]);

  const rows = query.data?.data ?? [];

  const openAddModal = () => {
    setSelectedProduct(null);
    setForm(emptyForm);
    setModalMode("add");
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setForm(toFormState(product));
    setModalMode("edit");
  };

  const openDetailsModal = (product: Product) => {
    setSelectedProduct(product);
    setForm(toFormState(product));
    setModalMode("details");
  };

  const closeProductModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
    setForm(emptyForm);
  };

  const buildProductFormData = () => {
    const payload = new FormData();

    payload.append("name", form.name.trim());
    payload.append("description", form.description.trim());
    payload.append("price", String(Number(form.price)));
    payload.append("size", JSON.stringify(form.sizes.filter(Boolean)));
    payload.append("stockSell", String(Number(form.stockSell || 0)));
    payload.append("stockAvailable", String(Number(form.stockAvailable || 0)));
    payload.append("totalStock", String(Number(form.totalStock || 0)));

    if (form.imageFile) {
      payload.append("image", form.imageFile);
    }

    return payload;
  };

  const handleImagePick = (file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.");
      return;
    }

    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      toast.error("Image must be 10MB or smaller.");
      return;
    }

    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  const handleRemoveImage = () => {
    if (form.imageFile) {
      setForm((prev) => ({ ...prev, imageFile: null }));
      return;
    }

    if (!form.imagePublicId) {
      setForm((prev) => ({
        ...prev,
        imageUrl: "",
        imagePublicId: "",
      }));
      return;
    }

    if (!selectedProduct?._id) {
      setForm((prev) => ({
        ...prev,
        imageUrl: "",
        imagePublicId: "",
      }));
      return;
    }

    deleteImageMutation.mutate({
      id: selectedProduct._id,
      publicId: form.imagePublicId,
    });
  };

  const submitProduct = () => {
    if (!form.name.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (!form.price) {
      toast.error("Price is required.");
      return;
    }

    if (modalMode === "add" && !form.imageFile && !form.imageUrl) {
      toast.error("Product image is required.");
      return;
    }

    const payload: Partial<Product> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      size: form.sizes.filter(Boolean),
      stockSell: Number(form.stockSell || 0),
      stockAvailable: Number(form.stockAvailable || 0),
      totalStock: Number(form.totalStock || 0),
      image:
        form.imageUrl && form.imagePublicId
          ? [{ url: form.imageUrl, public_id: form.imagePublicId }]
          : [],
    };

    if (modalMode === "edit" && selectedProduct?._id) {
      if (form.imageFile) {
        updateMutation.mutate({
          id: selectedProduct._id,
          payload: buildProductFormData(),
        });
        return;
      }

      updateMutation.mutate({ id: selectedProduct._id, payload });
      return;
    }

    if (form.imageFile) {
      createMutation.mutate(buildProductFormData());
      return;
    }

    createMutation.mutate(payload);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title="Product Dashboard"
        description="Create and manage your category with ease."
        action={
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add Products
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              className="pl-9"
              placeholder="Search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          {query.isLoading ? (
            <TableSkeleton rows={8} columns={8} />
          ) : rows.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Product Price</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Stock Sell</TableHead>
                    <TableHead>Stock Available</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image?.[0]?.url || "/logo-icon.png"}
                          alt={product.name}
                          className="h-11 w-11 rounded-md border border-zinc-200 object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.size?.join(", ") || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="warning">{product.stockSell ?? 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">{product.stockAvailable ?? 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openDetailsModal(product)}
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTarget(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-zinc-500">
                  Showing {(page - 1) * LIMIT + 1} to{" "}
                  {Math.min(page * LIMIT, query.data?.meta?.total ?? rows.length)} of{" "}
                  {query.data?.meta?.total ?? rows.length} results
                </p>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          ) : (
            <EmptyState title="No products found." />
          )}
        </CardContent>
      </Card>

      <ProductModal
        open={modalMode !== null}
        mode={modalMode ?? "add"}
        form={form}
        selectedProduct={selectedProduct}
        pending={isSubmitting}
        removingImage={deleteImageMutation.isPending}
        onClose={closeProductModal}
        onChange={(updater) => setForm(updater)}
        onImagePick={handleImagePick}
        onRemoveImage={handleRemoveImage}
        onSubmit={submitProduct}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        productName={deleteTarget?.name}
        pending={deleteMutation.isPending}
        onNo={() => setDeleteTarget(null)}
        onYes={() => {
          if (deleteTarget?._id) {
            deleteMutation.mutate(deleteTarget._id);
          }
        }}
      />
    </div>
  );
}
