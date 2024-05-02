import { SubmitHandler, useForm } from "react-hook-form"
import { Link } from "react-router-dom"

type Inputs = {
  name: string
  email: string
  password: string
}

export default function Register() {
  const { register, handleSubmit } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data)
  }

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Display name</label>
          <input id="name" {...register("name")} required />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} required />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} required />
        </div>

        <button>Register</button>
      </form>

      <p>
        Have an account already? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
