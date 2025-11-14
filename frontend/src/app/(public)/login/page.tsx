"use client";
import { useState } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
//import toast from "react-hot-toast";
import FormRow from "@/src/components/FormRow";
import SubmitButton from "@/src/components/SubmitButton";
import Link from "next/link";
import { emailInvalidMessage, isValidEmail } from "@/src/utils/validators";

//const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));  //esta linea sirve para visualizar la carga

interface LoginFormInputs {
  email: string;
  password: string;
}
// placeholder-[#78a8aa]  bg-[#9acbd06b]
const inputStyle =
  "w-[100%] placeholder:text-sm placeholder-[#78a8aa] bg-[#00697110] px-2 py-2 font-medium rounded-xl border-none  transition duration-200  focus:outline-none  hover:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
// (Task 40) Añadimos estado para el error del servidor
  const [serverError, setServerError] = useState<string | null>(null); 

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    setServerError(null); // (Task 40) Reseteamos el error del servidor antes de enviar

    try {
     // await sleep(1500); // Pausa por 1.5 segundos para simular carga
      console.log("¡Has iniciado sesión correctamente! 🎉");
      console.log("Data: ", data);
      
      // --- Para probar el error, descomentar la siguiente línea ---
      // throw new Error("El correo electrónico o la contraseña proporcionados son incorrectos.");
      reset();// Resetea el formulario solo si el login fue exitoso

    } catch (error: any) {// (Task 40) Capturamos el error del servidor
      setServerError(error.message || "Ocurrió un error inesperado");

      console.log(
        "El correo electrónico o la contraseña proporcionados son incorrectos."
      );
      console.log(error);
    } finally {
      setIsLoading(false);
        }
  };

  return (
    <section className="  min-h-screen flex flex-col items-center justify-center">
      <div className="">
        <div className="mb-7">
          <p className="mb-3 font-medium text-[14px] hover:text-[var(--color-secondary)]">
            &#8592; <Link href="/">Regresar</Link>
          </p>
          <h1 className=" text-4xl font-bold text-[var(--color-primary)]">
            Acceder a tu cuenta.
          </h1>
        </div>

        {/* (Task 40) Mostrar el error del servidor aquí */}
        {serverError && (
          <div className="p-3 my-4 text-red-800 bg-red-100 rounded-xl text-sm font-medium">
            {serverError}
          </div>
        )}

        <form
          className=" flex flex-col gap-7"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormRow label="Email" error={errors?.email?.message}>
            <input
              className={inputStyle}
              type="email"
              id="email"
              placeholder="Introduce tu correo electrónico"
              disabled={isLoading}
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
          <FormRow label="Contraseña" error={errors?.password?.message}>
            <input
              className={inputStyle}
              type="password"
              id="password"
              autoComplete="current-password"
              placeholder="Introduce tu contraseña"
              disabled={isLoading}
              {...register("password", {
                required: "Este campo es obligatorio",
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener un mínimo de 8 caracteres",
                },
              })}
            />
          </FormRow>
          <SubmitButton extraClass="mr-auto mb-7" disabled={isLoading}>
            {isLoading ? "Procesando..." : "Acceder a la cuenta"}
          </SubmitButton>
        </form>
        <p className=" text-[14px]">
          ¿Aún no tienes una cuenta?
          <Link
            href="/register"
            className="hover:text-[var(--color-secondary)] pl-1"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </section>
  );
};
export default Login;