import Header from './Header';
import LayoutBody from './LayoutBody';

interface ILayoutProps {
  children: React.ReactNode;
}
export default ({ children }: ILayoutProps) => {
  return (
    <>
      <Header />
      <LayoutBody>
        {children}
      </LayoutBody>
    </>
  );
};
