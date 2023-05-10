export const FunctionalComponent = () => {
  return <div />;
};

FunctionalComponent.displayName = 'FunctionalComponent';

function FunctionComponent() {
  return <div />;
}

FunctionComponent.displayName = 'FunctionComponent';

const withData = (component) => {
  return component;
};
const withNested = withData;
const otherFunc = withData;

const WithHOCFunctional = withData(FunctionalComponent);
WithHOCFunctional.displayName = 'WithHOCFunctional';

const WithHOCFunctionComponent = withData(withNested(FunctionalComponent));
WithHOCFunctionComponent.displayName = 'WithHOCFunctionComponent';

const NoneFunctionComponent = otherFunc(FunctionalComponent);
NoneFunctionComponent.displayName = 'NoneFunctionComponent';

const noneUppercaseVarFunctionComponent = withData(FunctionalComponent);
noneUppercaseVarFunctionComponent.displayName = 'noneUppercaseVarFunctionComponent';
