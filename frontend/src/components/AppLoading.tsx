export default function AppLoading() {
  return (
    <div
      className="d-flex bg-white"
      style={{ width: '100vw', height: '100vh' }}
    >
      <div className="m-auto">
        <div
          className="spinner-border"
          style={{ width: '3rem', height: '3rem' }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  )
}
