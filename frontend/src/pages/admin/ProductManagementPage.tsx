import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { goeyToast } from "goey-toast";

import {
    ProductFormPanel,
    ProductTableSection,
} from "@/components/features/product-sales";
import { Button } from "@/components/ui/Button";
import {
    DEFAULT_PRODUCT_FORM_VALUES,
    PRODUCT_IMAGE_STORAGE_KEY,
    buildProductPayload,
    readProductImageMap,
    toErrorMessage,
    type CategoryFilter,
    type ProductFormErrors,
    type ProductFormMode,
    type ProductFormValues,
    validateProductForm,
} from "@/features/product-sales";
import {
    useCreateProductMutation,
    useProductListQuery,
    useUpdateProductMutation,
} from "@/hooks/use-product-sales";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { productSalesService, type ProductRecord } from "@/services/product-sales.service";

export function ProductManagementPage() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const [productSearchInput, setProductSearchInput] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [productPage, setProductPage] = useState(1);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<ProductFormMode>("add");
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [productFormValues, setProductFormValues] = useState<ProductFormValues>(
        DEFAULT_PRODUCT_FORM_VALUES,
    );
    const [productFormErrors, setProductFormErrors] = useState<ProductFormErrors>({});
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [imageUploading, setImageUploading] = useState(false);

    const [productImageMap, setProductImageMap] = useState<Record<string, string>>(() =>
        readProductImageMap(),
    );

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setProductSearch(productSearchInput.trim());
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [productSearchInput]);

    useEffect(() => {
        setProductPage(1);
    }, [categoryFilter, productSearch]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(PRODUCT_IMAGE_STORAGE_KEY, JSON.stringify(productImageMap));
    }, [productImageMap]);

    useEffect(() => {
        return () => {
            if (imagePreviewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const productFilters = useMemo(
        () => ({
            page: productPage,
            limit: 10,
            search: productSearch || undefined,
            category: categoryFilter === "all" ? undefined : categoryFilter,
        }),
        [categoryFilter, productPage, productSearch],
    );

    const productsQuery = useProductListQuery(productFilters);

    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();

    const openAddProductPanel = () => {
        setFormMode("add");
        setEditingProductId(null);
        setProductFormValues(DEFAULT_PRODUCT_FORM_VALUES);
        setProductFormErrors({});
        setSelectedImageFile(null);
        setImagePreviewUrl("");
        setUploadedImageUrl("");
        setFormOpen(true);
    };

    const openEditProductPanel = (product: ProductRecord) => {
        const mappedCategory: ProductFormValues["category"] =
            product.category === "MERCHANDISE"
                ? "MERCHANDISE"
                : product.category === "OTHER"
                    ? "OTHER"
                    : "SUPPLEMENT";

        const existingImageUrl = productImageMap[product.id] ?? "";

        setFormMode("edit");
        setEditingProductId(product.id);
        setProductFormValues({
            name: product.name,
            description: product.description ?? "",
            category: mappedCategory,
            costPrice: typeof product.costPrice === "number" ? String(product.costPrice) : "",
            salePrice: String(product.salePrice),
            sku: product.sku,
            stockQuantity: String(product.stockQuantity),
            lowStockThreshold: String(product.lowStockThreshold),
            isActive: product.isActive,
        });
        setProductFormErrors({});
        setSelectedImageFile(null);
        setImagePreviewUrl(existingImageUrl);
        setUploadedImageUrl(existingImageUrl);
        setFormOpen(true);
    };

    const handleProductFieldChange = (field: keyof ProductFormValues, value: string | boolean) => {
        setProductFormValues((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            goeyToast.error("Please choose an image file.");
            return;
        }

        const blobUrl = URL.createObjectURL(file);
        setSelectedImageFile(file);
        setImagePreviewUrl(blobUrl);
        setUploadedImageUrl("");
    };

    const handleImageUpload = async () => {
        if (!selectedImageFile) {
            goeyToast.error("Select an image before uploading.");
            return;
        }

        setImageUploading(true);

        try {
            const url = await productSalesService.uploadProductImage(selectedImageFile);
            setUploadedImageUrl(url);
            setImagePreviewUrl(url);
            goeyToast.success("Image uploaded successfully.");
        } catch (error) {
            goeyToast.error(toErrorMessage(error));
        } finally {
            setImageUploading(false);
        }
    };

    const handleProductFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errors = validateProductForm(productFormValues);
        setProductFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const payload = buildProductPayload(productFormValues);

        try {
            if (formMode === "add") {
                const createdProduct = await createProductMutation.mutateAsync(payload);

                if (uploadedImageUrl.length > 0) {
                    setProductImageMap((current) => ({
                        ...current,
                        [createdProduct.id]: uploadedImageUrl,
                    }));
                }

                goeyToast.success("Product created successfully.");
            } else {
                if (!editingProductId) {
                    return;
                }

                const updatedProduct = await updateProductMutation.mutateAsync({
                    productId: editingProductId,
                    payload,
                });

                if (uploadedImageUrl.length > 0) {
                    setProductImageMap((current) => ({
                        ...current,
                        [updatedProduct.id]: uploadedImageUrl,
                    }));
                }

                goeyToast.success("Product updated successfully.");
            }

            setFormOpen(false);
        } catch (error) {
            goeyToast.error(toErrorMessage(error));
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void navigate("/app/management/products/pos")}
                    >
                        <MaterialIcon icon="shopping_cart" className="text-lg" />
                        <span>Go to POS</span>
                    </Button>
                    <Button type="button" onClick={openAddProductPanel}>
                        <MaterialIcon icon="add" className="text-lg" />
                        <span>Add Product</span>
                    </Button>
                </div>
            </header>

            <ProductTableSection
                sectionId="products-management"
                searchInput={productSearchInput}
                onSearchInputChange={setProductSearchInput}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                onOpenAddProduct={openAddProductPanel}
                loading={productsQuery.isLoading}
                errorMessage={productsQuery.isError ? toErrorMessage(productsQuery.error) : null}
                onRetry={() => void productsQuery.refetch()}
                products={productsQuery.data?.data ?? []}
                currentPage={productsQuery.data?.page ?? 1}
                totalPages={productsQuery.data?.totalPages ?? 1}
                onPreviousPage={() => setProductPage((current) => Math.max(current - 1, 1))}
                onNextPage={() =>
                    setProductPage((current) => {
                        const totalPages = productsQuery.data?.totalPages ?? 1;
                        return Math.min(current + 1, totalPages);
                    })
                }
                onEditProduct={openEditProductPanel}
                showAddToCart={false}
                productImageMap={productImageMap}
            />

            <ProductFormPanel
                open={formOpen}
                isMobile={isMobile}
                mode={formMode}
                values={productFormValues}
                errors={productFormErrors}
                isSubmitting={createProductMutation.isPending || updateProductMutation.isPending}
                imagePreviewUrl={imagePreviewUrl}
                uploadedImageUrl={uploadedImageUrl}
                imageUploading={imageUploading}
                onClose={() => setFormOpen(false)}
                onSubmit={(event) => void handleProductFormSubmit(event)}
                onFieldChange={handleProductFieldChange}
                onImageChange={handleImageChange}
                onUploadImage={() => void handleImageUpload()}
            />
        </div>
    );
}
