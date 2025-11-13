"use client";

import { useEffect, useMemo, useState } from "react";
import FormRow from "@/src/components/FormRow";

export type ProductFormValues = {
  name: string;
  price: string;
  code: string;
  stock: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialValues?: ProductFormValues;
  onSubmit: (values: { name: string; price: number; code: string; stock: number }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  serverError?: string | null;
};

const DEFAULT_VALUES: ProductFormValues = {
  name: "",
  price: "",
  code: "",
  stock: "",
};

type ValidationErrors = Partial<Record<keyof ProductFormValues, string>>;

const validateForm = (values: ProductFormValues): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!values.name.trim()) {
    errors.name = "El nombre es obligatorio.";
  } else if (values.name.trim().length < 3) {
    errors.name = "El nombre debe tener al menos 3 caracteres.";
  }

  if (!values.code.trim()) {
    errors.code = "El código es obligatorio.";
  }

  if (!values.price.trim()) {
    errors.price = "El precio es obligatorio.";
  } else {
    const numericPrice = Number(values.price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      errors.price = "El precio debe ser un número mayor a 0.";
    }
  }

  if (!values.stock.trim()) {
    errors.stock = "El stock es obligatorio.";
  } else {
    const numericStock = Number(values.stock);
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      errors.stock = "El stock debe ser un entero mayor o igual a 0.";
    }
  }

  return errors;
};

const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
  serverError,
}) => {
  const [values, setValues] = useState<ProductFormValues>(
    initialValues ?? DEFAULT_VALUES
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof ProductFormValues, boolean>>({
    name: false,
    price: false,
    code: false,
    stock: false,
  });

  useEffect(() => {
    setValues(initialValues ?? DEFAULT_VALUES);
    setErrors({});
    setTouched({
      name: false,
      price: false,
      code: false,
      stock: false,
    });
  }, [initialValues]);

  const title = useMemo(
    () => (mode === "create" ? "Crear producto" : "Editar producto"),
    [mode]
  );

  const handleChange =
    (field: keyof ProductFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleBlur =
    (field: keyof ProductFormValues) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setErrors((prev) => ({
        ...prev,
        ...validateForm(values),
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateForm(values);
    setErrors(validationErrors);
    setTouched({
      name: true,
      price: true,
      code: true,
      stock: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit({
      name: values.name.trim(),
      code: values.code.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <FormRow
        label="Nombre"
        error={touched.name ? errors.name : undefined}
      >
        <input
          id="product-name"
          type="text"
          value={values.name}
          onChange={handleChange("name")}
          onBlur={handleBlur("name")}
          placeholder="Balón profesional"
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </FormRow>

      <FormRow
        label="Código"
        error={touched.code ? errors.code : undefined}
      >
        <input
          id="product-code"
          type="text"
          value={values.code}
          onChange={handleChange("code")}
          onBlur={handleBlur("code")}
          placeholder="PROD-001"
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 uppercase tracking-wide"
        />
      </FormRow>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormRow
          label="Precio"
          error={touched.price ? errors.price : undefined}
        >
          <input
            id="product-price"
            type="number"
            min="0.01"
            step="0.01"
            value={values.price}
            onChange={handleChange("price")}
            onBlur={handleBlur("price")}
            placeholder="149.99"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </FormRow>

        <FormRow
          label="Stock"
          error={touched.stock ? errors.stock : undefined}
        >
          <input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={handleChange("stock")}
            onBlur={handleBlur("stock")}
            placeholder="25"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </FormRow>
      </div>

      {serverError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={submitting}
        >
          {submitting ? "Guardando..." : title}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;

