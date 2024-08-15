import { technologies } from '../constants';

const WithTechnologies = (WrappedComponent) => {
  return (props) => {
    return <WrappedComponent technologies={technologies} {...props} />
  };
};

export default WithTechnologies;