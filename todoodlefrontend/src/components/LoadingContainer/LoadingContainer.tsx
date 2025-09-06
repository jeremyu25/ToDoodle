import "../../styles/utilities.css"

type LoadingContainerProps = {
    name: string;
}

const LoadingContainer = ({name}: LoadingContainerProps) => {
  return (
    <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {name}...</p>
    </div>
  )
}

export default LoadingContainer