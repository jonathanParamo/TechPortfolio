import { technologies } from "../constants";

const WithTechnologies = (WrappedComponent) => {
  const HOC = (props) => {
    return <WrappedComponent technologies={technologies} {...props} />;
  };

  HOC.displayName = `WithTechnologies(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return HOC;
};

export default WithTechnologies;