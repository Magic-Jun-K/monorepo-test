import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Login from '../pages/Login';
import Layout from '../layout';
import AuthRoute from './AuthRoute';
import Home from '@/pages/Home';

// 懒加载组件的包装函数
const loadComponent = (path: string) => {
  const Component = lazy(() =>
    import(/* @vite-ignore */ `../pages/${path}`).then(module => ({
      default: module.default
    }))
  );
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
};

// 路由配置
const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/account/login" component={Login} />
        <Route
          path="/"
          render={() => (
            <AuthRoute>
              <Layout>
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route
                    path="/form-test"
                    render={() => loadComponent('FormTest')}
                  />
                  <Route
                    path="/baidu-map"
                    render={() => loadComponent('BMapGLCom')}
                  />
                </Switch>
              </Layout>
            </AuthRoute>
          )}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
