
import { useState, type FormEvent, type ChangeEvent } from 'react'

const API = '/api/auth'

type Mode = 'login' | 'signup'

interface AuthResponse {
  username?: string
  detail?: string
  message?: string
}

export default function App() {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [signedInAs, setSignedInAs] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [busy, setBusy] = useState<boolean>(false)

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setMessage('')
    setBusy(true)

    try {
      const response = await fetch(
        `${API}/${mode === 'signup' ? 'signup' : 'login'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      )

      const body: AuthResponse = await response.json().catch(
        (): AuthResponse => ({})
      )

      if (!response.ok) {
        setMessage(
          body.detail ||
            body.message ||
            (response.status === 409
              ? 'That username is already taken.'
              : response.status === 401
                ? 'Invalid username or password.'
                : 'Request failed. Check your input and try again.')
        )
        return
      }

      if (!body.username) {
        setMessage('Unexpected response from the server.')
        return
      }

      setSignedInAs(body.username)
      setPassword('')
      setMessage('')
    } catch {
      setMessage(
        'Cannot reach the backend. Check that the services are running.'
      )
    } finally {
      setBusy(false)
    }
  }

  function logout(): void {
    setSignedInAs('')
    setMode('login')
    setUsername('')
    setPassword('')
    setMessage('')
  }

  function handleUsernameChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    setUsername(event.target.value)
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    setPassword(event.target.value)
  }

  if (signedInAs) {
    return (
      <main className="page">
        <section className="card welcome">
          <div className="logo">K</div>
          <p className="eyebrow">KUBERNETES PRACTICE APP</p>

          <h1>
            Hello, <span>{signedInAs}</span>!
          </h1>

          <p className="muted">
            You successfully{' '}
            {mode === 'signup'
              ? 'created your account'
              : 'logged in'}.
          </p>

          <div className="status">
            <span className="dot" />
            Backend request completed
          </div>

          <button className="secondary" onClick={logout}>
            Log out
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="card">
        <div className="logo">K</div>

        <p className="eyebrow">YOUR KUBERNETES LAB</p>

        <h1>
          {mode === 'signup' ? 'Create account' : 'Welcome back'}
        </h1>

        <p className="muted">
          {mode === 'signup'
            ? 'Sign up to enter your lab dashboard.'
            : 'Log in to see your personal home page.'}
        </p>

        <div className="tabs">
          <button
            type="button"
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => {
              setMode('login')
              setMessage('')
            }}
          >
            Log in
          </button>

          <button
            type="button"
            className={mode === 'signup' ? 'tab active' : 'tab'}
            onClick={() => {
              setMode('signup')
              setMessage('')
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit}>
          <label htmlFor="username">Username</label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="e.g. neeraj"
            minLength={3}
            maxLength={40}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="At least 8 characters"
            minLength={8}
            maxLength={72}
            autoComplete={
              mode === 'signup'
                ? 'new-password'
                : 'current-password'
            }
            required
          />

          {message && (
            <p className="message" role="alert">
              {message}
            </p>
          )}

          <button
            className="primary"
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create account'
                : 'Log in'}
          </button>
        </form>

        <p className="footnote">
          Demo application · Never use a real password here
        </p>
      </section>
    </main>
  )
}
