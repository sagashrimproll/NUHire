export default function ResetLinkPage() {
  return (
    <div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <h1 className = "reset">Reset Password</h1>
      <form>
        <div className="body">
          <h2 className="email">
            Email:
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email"
            />
          </h2>
          <h2 className="password">
            New Password:
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your new password"
            />
          </h2>
          <h2 className="confirm">
            Confirm Password:
            <input
              type="password"
              id="confirm"
              name="confirm"
              required
              placeholder="Confirm your new password"
            />
          </h2>
          <button type="submit" className="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}  