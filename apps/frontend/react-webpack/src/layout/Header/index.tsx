import MenuCom from '../Menu';
import Logout from './Logout';

export default () => {
  return (
    <header
      className="h-[68px] flex items-center border-b border-gray-200"
      style={{ padding: '0px 4rem' }}
    >
      <h1 className="text-3xl font-bold" style={{ paddingRight: '1rem' }}>
        Eggshell
      </h1>
      <div className="flex-1 flex justify-between items-center">
        <MenuCom />
      </div>
      <Logout />
    </header>
  );
};