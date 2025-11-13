"use client";

import { useEffect, useState } from "react";
import SpinnerMini from "@/src/components/SpinnerMini";
import Modal from "@/src/components/Modal";
import ProductForm, {
  type ProductFormValues,
} from "@/src/components/products/ProductForm";
import ConfirmDialog from "@/src/components/ConfirmDialog";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  type PaginationMeta,
  type Product,
} from "@/src/services/products";

const ITEMS_PER_PAGE = 5;

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

const mapProductToFormValues = (
  product: Product | null
): ProductFormValues | undefined => {
  if (!product) return undefined;
  return {
    name: product.name,
    code: product.code,
    price: product.price.toString(),
    stock: product.stock.toString(),
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<Product | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { items, meta: metaData } = await listProducts({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: query || undefined,
        });
        setProducts(items);
        setMeta(metaData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los productos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, query]);

  const handleOpenCreate = () => {
    setFormError(null);
    setCreateModalOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateModalOpen(false);
    setFormError(null);
    setFormSubmitting(false);
  };

  const handleCreateSubmit = async (values: {
    name: string;
    price: number;
    code: string;
    stock: number;
  }) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      await createProduct(values);
      handleCloseCreate();
      setFeedback({
        type: "success",
        message: "Producto creado exitosamente.",
      });
      const fetchProducts = async () => {
        try {
          const { items, meta: metaData } = await listProducts({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: query || undefined,
          });
          setProducts(items);
          setMeta(metaData);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los productos"
          );
        }
      };
      fetchProducts();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "No fue posible crear el producto."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEdit = (product: Product) => {
    setEditProduct(product);
    setFormError(null);
    setFormSubmitting(false);
  };

  const handleCloseEdit = () => {
    setEditProduct(null);
    setFormError(null);
    setFormSubmitting(false);
  };

  const handleEditSubmit = async (values: {
    name: string;
    price: number;
    code: string;
    stock: number;
  }) => {
    if (!editProduct) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      await updateProduct(editProduct.id, values);
      handleCloseEdit();
      setFeedback({
        type: "success",
        message: "Producto actualizado correctamente.",
      });
      const fetchProducts = async () => {
        try {
          const { items, meta: metaData } = await listProducts({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: query || undefined,
          });
          setProducts(items);
          setMeta(metaData);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los productos"
          );
        }
      };
      fetchProducts();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "No fue posible actualizar el producto."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRequestDelete = (product: Product) => {
    setConfirmDeleteProduct(product);
    setFeedback(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteProduct(null);
    setDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteProduct) return;
    setDeleting(true);
    try {
      await deleteProduct(confirmDeleteProduct.id);
      setFeedback({
        type: "success",
        message: `Producto "${confirmDeleteProduct.name}" eliminado.`,
      });
      const shouldGoBack =
        currentPage > 1 && products.length === 1;
      setConfirmDeleteProduct(null);
      setDeleting(false);
      if (shouldGoBack) {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else {
        const fetchProducts = async () => {
          try {
            const { items, meta: metaData } = await listProducts({
              page: currentPage,
              limit: ITEMS_PER_PAGE,
              search: query || undefined,
            });
            setProducts(items);
            setMeta(metaData);
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "No se pudieron cargar los productos"
            );
          }
        };
        fetchProducts();
      }
    } catch (err) {
      setDeleting(false);
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "No fue posible eliminar el producto.",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFeedback = () => {
    setFeedback(null);
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < meta.totalPages ? prev + 1 : prev));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <SpinnerMini />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  const totalPages = Math.max(1, meta.totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + products.length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Crear Producto
        </button>
      </div>

      {feedback ? (
        <div
          className={`mb-6 p-4 rounded-md ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{feedback.message}</span>
            <button
              onClick={handleClearFeedback}
              className="text-sm font-medium hover:underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar productos por nombre o código..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      {products.length === 0 && !loading ? (
        <p>No se encontraron productos{query && ` que coincidan con "${query}"`}.</p>
      ) : (
        <>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-800 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Nombre</th>
                  <th scope="col" className="px-6 py-3">Código</th>
                  <th scope="col" className="px-6 py-3">Precio</th>
                  <th scope="col" className="px-6 py-3">Stock</th>
                  <th scope="col" className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{product.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 uppercase tracking-wide">
                      {product.code}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleRequestDelete(product)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-700">
              Mostrando {startIndex + 1}–{endIndex} de {meta.totalItems} productos
            </span>
            <div className="flex gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={createModalOpen}
        onClose={handleCloseCreate}
        title="Crear producto"
        description="Completa todos los campos para registrar un nuevo producto."
      >
        <ProductForm
          mode="create"
          onSubmit={handleCreateSubmit}
          onCancel={handleCloseCreate}
          submitting={formSubmitting}
          serverError={formError}
        />
      </Modal>

      <Modal
        isOpen={Boolean(editProduct)}
        onClose={handleCloseEdit}
        title="Editar producto"
        description="Actualiza los datos y guarda los cambios."
      >
        <ProductForm
          mode="edit"
          initialValues={mapProductToFormValues(editProduct)}
          onSubmit={handleEditSubmit}
          onCancel={handleCloseEdit}
          submitting={formSubmitting}
          serverError={formError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteProduct)}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirming={deleting}
        title="Eliminar producto"
        description={`¿Seguro que deseas eliminar el producto "${confirmDeleteProduct?.name}"?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}