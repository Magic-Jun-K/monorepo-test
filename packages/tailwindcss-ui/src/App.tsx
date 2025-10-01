import { ButtonExample, CommonButtonExample } from './components/example';

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          TailwindCSS UI 组件库
        </h1>
        
        <div className="space-y-8">
          <ButtonExample />
          <CommonButtonExample />
        </div>
      </div>
    </div>
  );
}
export default App;