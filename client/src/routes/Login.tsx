import { SubmitHandler, useForm } from "react-hook-form"
import { Link } from "react-router-dom"

type Inputs = {
  email: string
  password: string
}

export default function Login() {
  const { register, handleSubmit } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data)
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} required />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} required />
        </div>

        <button>Login</button>
      </form>

      <p>
        Don't have an account yet? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
