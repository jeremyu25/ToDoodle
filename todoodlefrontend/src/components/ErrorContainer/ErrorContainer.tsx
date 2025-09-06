import "../../styles/utilities.css"

type ErrorContainerProps = {
  error_name: string;
}

const ErrorContainer = ({error_name}: ErrorContainerProps) => {
  return (
    <div className="error-container">
      <p className="error-message">Error: {error_name}</p>
      <button onClick={() => window.location.reload()} className="retry-btn">
        Retry
      </button>
    </div>
  )
}

export default ErrorContainer