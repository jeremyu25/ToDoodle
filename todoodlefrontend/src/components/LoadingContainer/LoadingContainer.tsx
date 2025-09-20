import "../../styles/utilities.css"

type LoadingContainerProps = {
    name: string;
    isLoading: boolean;
}

const LoadingContainer = ({name, isLoading}: LoadingContainerProps) => {
  if (!isLoading) return null;
  
  return (
    <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {name}...</p>
    </div>
  )
}

export default LoadingContainer