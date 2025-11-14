"use client";

import FormRow from "@/src/components/FormRow";
import SubmitButton from "@/src/components/SubmitButton";
import Link from "next/link";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRegister } from "@/src/hooks/useRegister";
import { useRouter } from "next/navigation";
import { isValidEmail, emailInvalidMessage } from "@/src/utils/validators";

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const inputStyle =
  "w-[100%] placeholder:text-sm placeholder-[#78a8aa] bg-[#00697110] px-2 py-2 font-medium rounded-xl border-none transition duration-200 focus:outline-none hover:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";

const Register: React.FC = () => {
  const router = useRouter();
  const { handleRegister, loading, response } = useRegister();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<RegisterFormInputs>();

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setErrorMessage(null);

    const userData = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    try {
      const result = await handleRegister(userData);

      if (result?.success) {
        console.log("✅ Usuario creado:", result);
        alert("Cuenta creada con éxito 🎉");

        reset();

        // 🔄 Redirección automática después de unos segundos
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        console.error("❌ Error en el registro:", result?.message);
        setErrorMessage(result?.message || "Error desconocido al registrar");
      }
    } catch (error: any) {
      console.error("❌ Error inesperado:", error.message);
      setErrorMessage(error.message || "Error desconocido");
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center">
      <div>
        <div className="mb-7">
          <p className="mb-3 font-medium text-[14px] hover:text-[var(--color-secondary)]">
            &#8592; <Link href="/">Regresar</Link>
          </p>
          <h1 className="text-4xl font-bold text-[var(--color-primary)]">
            Regístrate
          </h1>
        </div>

        <form className="grid grid-cols-2 gap-8" onSubmit={handleSubmit(onSubmit)}>
          <FormRow label="Nombre" error={errors?.name?.message}>
            <input
              className={inputStyle}
              type="text"
              id="name"
              placeholder="Escribe tu nombre"
              disabled={loading}
              {...register("name", { required: "Este campo es obligatorio" })}
            />
          </FormRow>

          <FormRow label="Email" error={errors?.email?.message}>
            <input
              className={inputStyle}
              type="email"
              id="email"
              placeholder="Introduce tu correo electrónico"
              disabled={loading}
              {...register("email", {
                required: "Este campo es obligatorio",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message:
                    "Por favor, proporcione una dirección de correo electrónico válida.",
                },
                validate: (value: string) =>
                  isValidEmail(value) || emailInvalidMessage,
              })}
            />
          </FormRow>

          <FormRow
            label="Contraseña (mínimo 8 caracteres)"
            error={errors?.password?.message}
          >
            <input
              className={inputStyle}
              type="password"
              id="password"
              placeholder="Introduce tu contraseña"
              disabled={loading}
              {...register("password", {
                required: "Este campo es obligatorio",
                minLength: {
                  value: 8,
                  message: "Debe tener mínimo 8 caracteres.",
                },
              })}
            />
          </FormRow>

          <FormRow
            label="Repita la contraseña"
            error={errors?.passwordConfirm?.message}
          >
            <input
              className={inputStyle}
              type="password"
              id="passwordConfirm"
              placeholder="Confirma tu contraseña"
              disabled={loading}
              {...register("passwordConfirm", {
                required: "Este campo es obligatorio",
                validate: (value) =>
                  value === getValues("password") ||
                  "Las contraseñas deben coincidir",
              })}
            />
          </FormRow>

          <SubmitButton extraClass="mr-auto mb-7" disabled={loading}>
            {loading ? "Procesando..." : "Crear cuenta"}
          </SubmitButton>
        </form>

        {errorMessage && (
          <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
        )}

        {response?.success && (
          <p className="text-green-600 text-sm mt-2">
            ¡Registro exitoso! 🎉
          </p>
        )}

        <p className="text-[14px] mt-2">
          ¿Ya tienes una cuenta?
          <Link href="/login" className="hover:text-[var(--color-secondary)] pl-1">
            Accede a tu cuenta
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
